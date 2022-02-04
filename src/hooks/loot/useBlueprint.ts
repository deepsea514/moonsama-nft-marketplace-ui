import {useCallback, useEffect, useMemo, useState} from 'react'

import { useWorkbenchContract } from '../../hooks/useContracts/useContracts';
import { useActiveWeb3React } from '../../hooks';
import { BigNumber } from '@ethersproject/bignumber';
import { assetTypeToStringAssetType, StringAssetType } from 'utils/subgraph';
import { useBlockNumber } from 'state/application/hooks';

export enum CraftCallbackState {
  INVALID,
  LOADING,
  VALID,
}

export type BlueprintAsset = {
    assetAddress: string,
    assetId: string,
    assetType: StringAssetType,
    amount?: BigNumber
}

export type BlueprintData = {
    inputTarget: string,
    inputs: BlueprintAsset[],
    output: BlueprintAsset,
    availableToMint: BigNumber,
}

export function useBlueprint(
  blueprintId: string,
): BlueprintData | undefined {
  const { account, chainId } = useActiveWeb3React();

  const blockumber = useBlockNumber();

  const [blueprint, setBlueprint] = useState<BlueprintData | undefined>(undefined)

  //console.log('YOLO', { account, chainId, library });
  const contract = useWorkbenchContract(true);

  const cb = useCallback(async () => {
      const blueprint = await contract?.blueprint(blueprintId)
      if (!!blueprint) {
          setBlueprint({
              inputs: blueprint.inputs.map((x: any, i: number) => {
                  return {
                    assetAddress: x.assetAddress.toString().toLowerCase(),
                    assetId: x.assetId.toString(),
                    assetType: assetTypeToStringAssetType(x.assetType),
                    amount: blueprint.amounts[i]
                  }
              }),
              inputTarget: blueprint.inputTarget,
              availableToMint: blueprint.availableToMint,
              output: blueprint.output
          })
      }
  }, [
    account,
    chainId,
    contract
  ]);

  useEffect(() => {
    if(contract && chainId) { 
        cb();
    }
  }, [
      contract,
      chainId,
      blockumber
  ]);

  return blueprint
}

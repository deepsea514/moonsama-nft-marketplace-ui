import { BigNumber } from '@ethersproject/bignumber';
import { request } from 'graphql-request';
import { useActiveWeb3React } from 'hooks/useActiveWeb3React/useActiveWeb3React';
import { useCallback } from 'react';
import { Asset } from 'hooks/marketplace/types';
import {
  StaticTokenData,
  useTokenStaticDataCallbackArray,
} from 'hooks/useTokenStaticDataCallback/useTokenStaticDataCallback';
import { QUERY_USER_ERC721 } from 'subgraph/erc721Queries';
import { getAssetEntityId, StringAssetType } from 'utils/subgraph';
import { useRawCollectionsFromList } from 'hooks/useRawCollectionsFromList/useRawCollectionsFromList';
import { TokenMeta } from 'hooks/useFetchTokenUri.ts/useFetchTokenUri.types';
import { QUERY_USER_ERC1155 } from 'subgraph/erc1155Queries';

export interface OwnedTokens {
  id: string;
  ownedTokens: { id: string; contract: { id: string } }[];
}

export interface TokenOwner {
  id: string;
  balance: string;
  token: { id: string; contract: { id: string } };
}

export interface UserCollection {
  [key: string]: {
    meta: TokenMeta | undefined;
    staticData: StaticTokenData;
    asset: Asset;
  }[];
}

export const useUserCollection = () => {
  const { chainId } = useActiveWeb3React();
  const staticCallback = useTokenStaticDataCallbackArray();
  const rawCollections = useRawCollectionsFromList();

  const fetchUserCollection = useCallback(
    async (account: string) => {
      const result: UserCollection = {};
      const fetches = rawCollections.map(async (collection) => {
        if (!collection.subgraph) {
          result[collection.display_name] = [];
          return;
        }

        let assets: Asset[] = [];

        if (collection.type === 'ERC721') {
          const query = QUERY_USER_ERC721(account);
          const response = await request(collection.subgraph, query);

          console.debug('YOLO fetchUserCollection', response);

          if (!response) {
            result[collection.display_name] = [];
            return;
          }

          const ot: OwnedTokens = response.owners?.[0];

          if (!ot) {
            result[collection.display_name] = [];
            return;
          }

          assets = ot.ownedTokens.map((x) => {
            const aid = BigNumber.from(x.id).toString();
            return {
              assetId: aid,
              id: getAssetEntityId(x.contract.id, aid),
              assetType: StringAssetType.ERC721,
              assetAddress: x.contract.id,
            };
          });
        } else {
          const query = QUERY_USER_ERC1155(account);
          const response = await request(collection.subgraph, query);

          console.debug('YOLO fetchUserCollection', response);

          if (!response) {
            result[collection.display_name] = [];
            return;
          }

          const to: TokenOwner[] = response.tokenOwners;

          if (!to) {
            result[collection.display_name] = [];
            return;
          }

          assets = to
            .filter((x) => x.balance !== '0')
            .map((x) => {
              const aid = BigNumber.from(x.token.id).toString();
              return {
                assetId: aid,
                id: getAssetEntityId(x.token.contract.id, aid),
                assetType: StringAssetType.ERC1155,
                assetAddress: x.token.contract.id,
              };
            });
        }

        const staticDatas = await staticCallback(assets);

        const datas = staticDatas.map((sd, i) => {
          return {
            meta: sd.meta,
            staticData: sd.staticData,
            asset: assets[i],
          };
        });
        result[collection.display_name] = datas;
        return;
      });

      await Promise.all(fetches);
      return result;
    },
    [chainId]
  );

  return fetchUserCollection;
};

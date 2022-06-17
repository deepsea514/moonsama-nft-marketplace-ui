import { isAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import SearchIcon from '@mui/icons-material/SearchSharp';
import { Button, IconButton, InputAdornment, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { Token as TokenComponent } from 'components';
import { useClasses } from 'hooks';
import { Asset } from 'hooks/marketplace/types';
import { useFetchSubcollectionMeta } from 'hooks/useFetchCollectionMeta/useFetchCollectionMeta';
import { TokenMeta } from 'hooks/useFetchTokenUri.ts/useFetchTokenUri.types';
import { useRawcollection } from 'hooks/useRawCollectionsFromList/useRawCollectionsFromList';
import {
  StaticTokenData,
  useTokenStaticDataCallbackArrayWithFilter,
} from 'hooks/useTokenStaticDataCallback/useTokenStaticDataCallback';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { useForm } from 'react-hook-form';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { Filters, GlitchText, Loader, Sort } from 'ui';
import { SortOption } from 'ui/Sort/Sort';
import { truncateHexString } from 'utils';
import {
  getAssetEntityId,
  StringAssetType,
  stringToStringAssetType,
  stringToOrderType,
  getDisplayUnitPrice,
} from 'utils/subgraph';
import { styles } from './styles';

import { useFloorOrder } from 'hooks/useFloorOrder/useFloorOrder';
import { useTokenStaticData } from 'hooks/useTokenStaticData/useTokenStaticData';
import { useFetchTokenUri } from 'hooks/useFetchTokenUri.ts/useFetchTokenUri';
import { usePurchaseDialog } from '../../hooks/usePurchaseDialog/usePurchaseDialog';
import { useTokenBasicData } from 'hooks/useTokenBasicData.ts/useTokenBasicData';
import { useApprovedPaymentCurrency } from 'hooks/useApprovedPaymentCurrencies/useApprovedPaymentCurrencies';
import { useDecimalOverrides } from 'hooks/useDecimalOverrides/useDecimalOverrides';

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_PAGE_SIZE = 50;

const CollectionPage = () => {
  const [collection, setCollection] = useState<
    {
      meta: TokenMeta | undefined;
      staticData: StaticTokenData;
    }[]
  >([]);
  const { address, type, subcollectionId } = useParams<{
    address: string;
    type: string;
    subcollectionId: string;
  }>();

  let history = useHistory();
  const sampleLocation = useLocation();
  let path: string = sampleLocation.pathname;
  let pathSplit = path.split('/');
  let filterParam = pathSplit[7].split('+');
  let sortParam =
    pathSplit[5] == '' ? SortOption.TOKEN_ID_ASC : parseInt(pathSplit[5]);
  
  const assetType = stringToStringAssetType(type);
  const asset: Asset = {
    assetAddress: address?.toLowerCase(),
    assetType: assetType,
    assetId: '0',
    id: getAssetEntityId(address?.toLowerCase(), '0'),
  };
  const recognizedCollection = useRawcollection(asset.assetAddress);
  const searchBarOn = recognizedCollection?.idSearchOn ?? true;
  const subcollection = recognizedCollection?.subcollections?.find(
    (x) => x.id === subcollectionId
  );
  const submeta = useFetchSubcollectionMeta(
    subcollection ? [subcollection] : undefined
  );

  const isSubcollection = subcollectionId !== '0';

  const [take, setTake] = useState<number>(0);
  const [filters, setFilters] = useState<Filters | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>(sortParam);
  const [paginationEnded, setPaginationEnded] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [searchCounter, setSearchCounter] = useState<number>(0);
  const { placeholderContainer, container } = useClasses(styles);
  const { register, handleSubmit } = useForm();
  const displayFilters = assetType === StringAssetType.ERC721;

  // TODO: wire it to search result

  const collectionName = recognizedCollection
    ? recognizedCollection.display_name
    : `Collection ${truncateHexString(address)}`;

  const getItemsWithFilterAndSort = useTokenStaticDataCallbackArrayWithFilter(
    asset,
    subcollectionId,
    filters,
    sortBy
  ); //useTokenStaticDataCallback(asset)//
  /*
  const f = x(['Black Bird', 'White Shades'])
  console.log('MSATTR', f)
  const m = searchItems(
    f.map(num => {
      return {
        assetAddress: asset.assetAddress,
        assetType: assetType,
        assetId: num.toString(),
        id: '000'
      }
    }
  ))
  console.log('MSATTR', m)
  */

  const searchSize =
    filters?.selectedOrderType == undefined
      ? DEFAULT_PAGE_SIZE
      : SEARCH_PAGE_SIZE;

  const handleScrollToBottom = useCallback(() => {
    if (pageLoading) return;
    console.log('SCROLLBOTTOM');
    setTake((state) => (state += searchSize));
    setSearchCounter((state) => (state += 1));
  }, [searchSize]);

  const handleTokenSearch = useCallback(
    async ({ tokenID }) => {
      if (!!tokenID) {
        setPaginationEnded(true);
        setPageLoading(true);
        const data = await getItemsWithFilterAndSort(
          1,
          BigNumber.from(tokenID - 1),
          setTake
        );
        path = sampleLocation.pathname;
        pathSplit = path.split('/');
        let new_path =
          pathSplit[0] +
          '/' +
          pathSplit[1] +
          '/' +
          pathSplit[2] +
          '/' +
          pathSplit[3] +
          '/' +
          pathSplit[4] +
          '/' +
          pathSplit[5] +
          '/' +
          tokenID +
          '/' +
          pathSplit[7];
        history.push(new_path);
        setPageLoading(false);
        setCollection(data);
      } else {
        setPaginationEnded(false);
        setPageLoading(true);
        const data = await getItemsWithFilterAndSort(
          searchSize,
          BigNumber.from(take),
          setTake
        );
        setPageLoading(false);
        setCollection(data);
      }
    },
    [searchSize, sortBy]
  );

  useBottomScrollListener(handleScrollToBottom, {
    offset: 400,
    debounce: 1000,
  });

  useEffect(() => {
    const getCollectionById = async () => {
      setPageLoading(true);
      let data;
      console.log('FETCH', { searchSize, address, take, paginationEnded });
      if (pathSplit[6] == '') {
        data = await getItemsWithFilterAndSort(
          searchSize,
          BigNumber.from(take),
          setTake
        );
      } else {
        data = await getItemsWithFilterAndSort(
          1,
          BigNumber.from(parseInt(pathSplit[6]) - 1),
          setTake
        );
      }

      // if (filterParam.length >= 3) {
      //   let temp,
      //     tempSelectedOrderType,
      //     tempPriceRange: number[] = [],
      //     tempTraits: string[] = [];
      //   temp = filterParam[0].split(':');
      //   tempSelectedOrderType = parseInt(temp[1]);
      //   temp = filterParam[1].replace('[', '').replace(']', '').split(':');
      //   temp = temp[1].split(',');
      //   tempPriceRange.push(parseInt(temp[0]));
      //   tempPriceRange.push(parseInt(temp[1]));
      //   temp = filterParam[2]
      //     .replace('[', '')
      //     .replace(']', '')
      //     .replaceAll(`"`, ``)
      //     .split(':');
      //   temp = temp[1].split(',');
      //   tempTraits = temp;
      //   let newFilter: Filters = {
      //     selectedOrderType: tempSelectedOrderType,
      //     priceRange: tempPriceRange,
      //     traits: tempTraits,
      //   };
      //   setFilters(newFilter);
      // }

      const isEnd = !data || data.length == 0;
      const pieces = data.filter(({ meta }) => !!meta);
      setPageLoading(false);

      if (isEnd) {
        setPaginationEnded(true);
        setCollection((state) => state.concat(pieces));
        return;
      }
      setCollection((state) => state.concat(pieces));
    };
    if (!paginationEnded) {
      getCollectionById();
    }
  }, [
    filterParam,
    address,
    searchCounter,
    paginationEnded,
    searchSize,
    JSON.stringify(filters?.traits),
    sortBy,
  ]);

  if (assetType.valueOf() === StringAssetType.UNKNOWN) {
    throw Error('Asset type was not recognized');
  }
  if (!isAddress(address)) {
    throw Error('Address format is incorrect');
  }

  const handleFiltersUpdate = useCallback(async (filters: Filters) => {
    let strings =
      'selectedOrderType:' +
      JSON.stringify(filters.selectedOrderType) +
      '+' +
      'priceRange:' +
      JSON.stringify(filters.priceRange) +
      '+' +
      'traits:' +
      JSON.stringify(filters.traits);
    console.log('FILTER', filters);
    path = sampleLocation.pathname;
    pathSplit = path.split('/');
    let new_path =
      pathSplit[0] +
      '/' +
      pathSplit[1] +
      '/' +
      pathSplit[2] +
      '/' +
      pathSplit[3] +
      '/' +
      pathSplit[4] +
      '/' +
      pathSplit[5] +
      '/' +
      pathSplit[7] +
      '/' +
      strings;
    history.push(new_path);
    setCollection([]);
    setTake(0);
    setFilters(filters);
    setPageLoading(true);
    setPaginationEnded(false);
    setSearchCounter((state) => (state += 1));
  }, []);

  const handleSortUpdate = useCallback(async (sortBy: SortOption) => {
    console.log('sortBy', sortBy);
    setCollection([]);
    setTake(0);
    setSortBy(sortBy);
    path = sampleLocation.pathname;
    pathSplit = path.split('/');
    let new_path =
      pathSplit[0] +
      '/' +
      pathSplit[1] +
      '/' +
      pathSplit[2] +
      '/' +
      pathSplit[3] +
      '/' +
      pathSplit[4] +
      '/' +
      sortBy +
      '/' +
      pathSplit[6] +
      '/' +
      pathSplit[7];
    history.push(new_path);
    setPageLoading(true);
    setPaginationEnded(false);
    setSearchCounter((state) => (state += 1));
  }, []);

  const { setPurchaseData, setPurchaseDialogOpen } = usePurchaseDialog();
  const floorAssetOrder = useFloorOrder(asset);
  const floorAssets = useMemo(() => {
    if (floorAssetOrder?.sellAsset) {
      return [floorAssetOrder.sellAsset] as Asset[];
    }
    return [] as Asset[];
  }, [floorAssetOrder]);

  const approvedPaymentCurrency = useApprovedPaymentCurrency(
    floorAssetOrder?.sellAsset || ({} as Asset)
  );
  const staticData = useTokenStaticData(floorAssets);
  const balanceData = useTokenBasicData(floorAssets);
  const metas = useFetchTokenUri(staticData);
  const decimalOverrides = useDecimalOverrides();

  const assetMeta = metas?.[0];

  const decimals =
    decimalOverrides[asset.assetAddress] ?? balanceData?.[0]?.decimals ?? 0;
  const tokenName = staticData?.[0]?.name;
  const tokenSymbol = staticData?.[0]?.symbol;

  const displayPPU = getDisplayUnitPrice(
    decimals,
    5,
    stringToOrderType(floorAssetOrder?.orderType),
    floorAssetOrder?.askPerUnitNominator,
    floorAssetOrder?.askPerUnitDenominator,
    true
  );

  return (
    <>
      <div className={container}>
        <GlitchText variant="h1">{collectionName}</GlitchText>
        {isSubcollection && !!submeta?.[0]?.name && (
          <GlitchText variant="h2">{submeta?.[0].name}</GlitchText>
        )}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 2, md: 4 }}
          sx={{
            marginTop: '10px',
            padding: '16px',
          }}
          justifyContent="flex-end"
          alignItems="center"
        >
          {searchBarOn && (
            <div>
              <TextField
                placeholder="Search by token ID"
                variant="outlined"
                defaultValue={pathSplit[6]}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        onClick={handleSubmit(handleTokenSearch)}
                        onMouseDown={handleSubmit(handleTokenSearch)}
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                {...register('tokenID')}
              />
            </div>
          )}

          {displayFilters && (
            <div>
              <Filters
                onFiltersUpdate={handleFiltersUpdate}
                assetAddress={asset.assetAddress}
              />
            </div>
          )}
          <div>
            <Sort onSortUpdate={handleSortUpdate} sortBy={sortBy} />
          </div>
        </Stack>
        {floorAssetOrder && assetMeta && recognizedCollection?.floorDisplay && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 2, md: 4 }}
            sx={{
              marginTop: '10px',
              padding: '16px',
            }}
            justifyContent="flex-end"
            alignItems="center"
          >
            <GlitchText>Floor NFT</GlitchText>: {assetMeta.name}{' '}
            {asset.assetAddress.toLowerCase() !==
            '0xb654611f84a8dc429ba3cb4fda9fad236c505a1a'
              ? `#${floorAssetOrder.sellAsset.assetId}`
              : ''}{' '}
            ({displayPPU} {approvedPaymentCurrency.symbol})
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => {
                setPurchaseDialogOpen(true);
                setPurchaseData({
                  order: floorAssetOrder,
                  orderType: stringToOrderType(floorAssetOrder.orderType),
                  decimals,
                  symbol: tokenSymbol,
                  name: tokenName,
                  approvedPaymentCurrency,
                });
              }}
            >
              {' '}
              Fill
            </Button>
          </Stack>
        )}
      </div>
      <Grid container alignContent="center">
        {collection.map(
          (token, i) =>
            token && (
              <Grid
                item
                key={`${token.staticData.asset.id}-${i}`}
                xs={12}
                md={6}
                lg={3}
              >
                <TokenComponent {...token} />
              </Grid>
            )
        )}
      </Grid>
      {pageLoading && (
        <div className={placeholderContainer}>
          <Loader />
        </div>
      )}
    </>
  );
};

export default CollectionPage;

import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { TokenTrade } from 'components/TokenTrade/TokenTrade';
import { useClasses } from 'hooks';
import { FillWithOrder } from 'hooks/marketplace/types';
import { TokenMeta } from 'hooks/useFetchTokenUri.ts/useFetchTokenUri.types';
import { useLatestTradesWithStaticCallback } from 'hooks/useLatestTradesWithStaticCallback/useLatestTradesWithStaticCallback';
import { useRawCollectionsFromList } from 'hooks/useRawCollectionsFromList/useRawCollectionsFromList';
import { StaticTokenData } from 'hooks/useTokenStaticDataCallback/useTokenStaticDataCallback';
import { useWhitelistedAddresses } from 'hooks/useWhitelistedAddresses/useWhitelistedAddresses';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { GlitchText, Loader } from 'ui';
import { styles } from './styles';

const PAGE_SIZE = 10;

const FreshTradesPage = () => {
  const [collection, setCollection] = useState<
    {
      meta: TokenMeta | undefined;
      staticData: StaticTokenData;
      fill: FillWithOrder;
    }[]
  >([]);
  const [take, setTake] = useState<number>(0);
  const [paginationEnded, setPaginationEnded] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  const {
    placeholderContainer,
    container,
    scene,
    canvas,
    poster,
    glass,
    nftWrapper,
    filterChip,
  } = useClasses(styles);

  const sceneRef = useRef(null);
  const canvasRef = useRef(null);
  const posterRef = useRef(null);
  const glassRef = useRef(null);

  const getPaginatedItems = useLatestTradesWithStaticCallback();
  const collections = useRawCollectionsFromList();
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    undefined
  );
  const [searchCounter, setSearchCounter] = useState<number>(0);

  const handleScrollToBottom = useCallback(() => {
    setTake((state) => (state += PAGE_SIZE));
    setSearchCounter((state) => (state += 1));
  }, []);

  useBottomScrollListener(handleScrollToBottom, { offset: 400 });

  const whitelist = useWhitelistedAddresses(); // REMOVEME later

  const selectedTokenAddress =
    selectedIndex === undefined
      ? undefined
      : collections[selectedIndex]?.address?.toLowerCase();

  useEffect(() => {
    const getCollectionById = async () => {
      setPageLoading(true);
      let data = await getPaginatedItems(
        PAGE_SIZE,
        take,
        selectedTokenAddress,
        setTake
      );
      data = data.filter((x) =>
        whitelist.includes(x.staticData.asset.assetAddress.toLowerCase())
      ); // REMOVEME later
      setPageLoading(false);
      const isEnd = data.some(({ meta }) => !meta);

      //console.log('IS END', {paginationEnded, isEnd, pieces, data})

      //console.log('FRESH', {data, PAGE_SIZE, take, isEnd})

      if (isEnd) {
        const pieces = data.filter(({ meta }) => !!meta);
        setPaginationEnded(true);
        setCollection((state) => state.concat(pieces));
        return;
      }
      setCollection((state) => state.concat(data));
    };
    if (!paginationEnded) {
      getCollectionById();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCounter, paginationEnded, selectedTokenAddress]);

  const handleTouchMove = (event: any): void => {
    event.preventDefault();

    const x = event.touches[0].pageX;
    const y = event.touches[0].pageY;

    updateRotation(x, y);
  };

  const handleMouseMove = (event: any): void => {
    const x = event.pageX;
    const y = event.pageY;
    console.log(event);
    updateRotation(x, y);
  };

  const updateRotation = (x: number, y: number) => {
    console.log(x, y);
    if (!!glassRef.current && !!canvasRef.current) {
      const yAxisRotation =
        (x - window.innerWidth / 8) * (80 / window.innerWidth);
      const xAxisRotation =
        (y - window.innerHeight / 8) * (-80 / window.innerHeight);

      const transformations = [
        'translate(-50%, -50%)',
        'rotateY(' + yAxisRotation + 'deg)',
        'rotateX(' + xAxisRotation + 'deg)',
      ];

      // @ts-ignore
      glassRef.current.style.backgroundPosition =
        500 - yAxisRotation * 5 + 'px ' + (xAxisRotation * 5 + 'px');
      // @ts-ignore
      canvasRef.current.style.transform = transformations.join(' ');
    }
  };

  const handleSelection = (i: number | undefined) => {
    if (i !== selectedIndex) {
      setCollection([]);
      setSelectedIndex(i);
      setTake(0);
      setSearchCounter(0);
      setPaginationEnded(false);
    }
  };

  return (
    <>
      <div className={container}>
        <GlitchText variant="h1">Latest trades</GlitchText>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Stack
          direction={{ xs: 'row' }}
          flexWrap={{ xs: 'wrap' }}
          //spacing={{ xs: 1 }}
          justifyContent="center"
          alignItems="center"
        >
          <Chip
            key={`all`}
            label={'All'}
            variant="outlined"
            onClick={() => handleSelection(undefined)}
            className={`${filterChip}${
              selectedIndex === undefined ? ' selected' : ''
            }`}
          />
          {collections.map((collection, i) => {
            return (
              <Chip
                key={`${collection.address}-${i}`}
                label={collection.display_name}
                variant="outlined"
                onClick={() => handleSelection(i)}
                className={`${filterChip}${
                  selectedIndex === i ? ' selected' : ''
                }`}
              />
            );
          })}
        </Stack>
      </div>
      <Grid container spacing={1} style={{ marginTop: 12 }}>
        {collection
          .map(
            (token, i) =>
              token && (
                <Grid
                  item
                  key={`${token.staticData.asset.id}-${i}`}
                  lg={3}
                  md={4}
                  sm={6}
                  xs={12}
                >
                  <TokenTrade {...token} />
                </Grid>
              )
          )
          .filter((x) => !!x)}
      </Grid>
      {pageLoading && (
        <div className={placeholderContainer}>
          <Loader />
        </div>
        // <div className={nftWrapper}>
        //   <div ref={sceneRef} className={scene} onTouchMove={handleTouchMove} onMouseMove={handleMouseMove}>
        //     <div ref={canvasRef} className={canvas}>
        //       <div ref={posterRef} className={poster}>
        //           efwefw
        //       </div>
        //       <div ref={glassRef} className={glass}>
        //
        //       </div>
        //     </div>
        //   </div>
        // </div>
      )}
    </>
  );
};

export default FreshTradesPage;

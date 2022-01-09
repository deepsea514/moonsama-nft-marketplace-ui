import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import WhiteLogo from 'assets/images/logo-white.svg';
import { useMediaQuery } from 'beautiful-react-hooks';
import { Account } from 'components';
import { useClasses } from 'hooks';
import { useState } from 'react';
import { Drawer, Footer, Header, NavLink } from 'ui';
import { MAX_WIDTH_TO_SHOW_NAVIGATION } from '../../constants';
import { styles } from './Layout.styles';
import { LayoutProps } from './Layout.types';

export const Layout = ({ children }: LayoutProps) => {
  const { logo, nav, navItem, buttonContainer, navItemDrawer } =
    useClasses(styles);
  const showRegularMenu = useMediaQuery(
    `(max-width: ${MAX_WIDTH_TO_SHOW_NAVIGATION}px)`
  );
  const [isDrawerOpened, setIsDrawerOpened] = useState<boolean>(false);

  return (
    <>
      <Header>
        <Container style={{ padding: '0 15px' }} maxWidth={false}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xl={3} className={nav}>
              {showRegularMenu && (
                <IconButton onClick={() => setIsDrawerOpened(true)}>
                  <MenuIcon />
                </IconButton>
              )}
              <NavLink href="/" className={navItem}>
                <div className={logo}>
                  <img src={WhiteLogo} alt="" />
                </div>
              </NavLink>
            </Grid>
            <Grid item className={buttonContainer}>
              {!showRegularMenu ? (
                <Box
                  style={{ display: 'flex' }}
                  onClick={() => setIsDrawerOpened(false)}
                >
                  <NavLink href="/auctions" className={navItem}>
                    Auctions
                  </NavLink>
                  <NavLink href="/collections" className={navItem}>
                    Collections
                  </NavLink>
                  <NavLink href="/freshoffers" className={navItem}>
                    Latest offers
                  </NavLink>
                  <NavLink href="/freshtrades" className={navItem}>
                    Latest trades
                  </NavLink>
                  <NavLink href="/myoffers" className={navItem}>
                    My offers
                  </NavLink>
                  <NavLink href="/mynfts" className={navItem}>
                    My NFTs
                  </NavLink>

                  {/*<NavLink href="/explore" className={navItem}>
                  Explore
                </NavLink>*/}
                </Box>
              ) : (
                <Drawer
                  open={isDrawerOpened}
                  onClose={() => setIsDrawerOpened(false)}
                  onOpen={() => setIsDrawerOpened(true)}
                  onClick={() => setIsDrawerOpened(false)}
                >
                  <Box>
                    <NavLink href="/auctions" className={navItemDrawer}>
                      Auctions
                    </NavLink>
                    <NavLink href="/collections" className={navItemDrawer}>
                      Collections
                    </NavLink>
                    <NavLink href="/freshoffers" className={navItemDrawer}>
                      Latest offers
                    </NavLink>
                    <NavLink href="/freshtrades" className={navItemDrawer}>
                      Latest trades
                    </NavLink>
                    <NavLink href="/myoffers" className={navItemDrawer}>
                      My offers
                    </NavLink>
                    <NavLink href="/mynfts" className={navItemDrawer}>
                      My NFTs
                    </NavLink>
                  </Box>
                </Drawer>
              )}

              <Account />
            </Grid>
          </Grid>
        </Container>
      </Header>
      <Container maxWidth="xl">{children}</Container>
      <Footer />
    </>
  );
};

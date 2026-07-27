import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

const navItems = [
  { key: 'quran', label: "Kur'an Ezberle" },
  { key: 'kuranOku', label: "Kur'an Oku" },
  { key: 'sureler', label: 'Sureler' },
  { key: 'mukabele', label: 'Mukabele' },
  { key: 'dualar', label: 'Namaz Duaları' },
  { key: 'kuranDualari', label: "Kur'an Duaları" },
  { key: 'hadis', label: 'Hadis' },
];

const pagePaths = {
  quran: '/',
  kuranOku: '/kuran-oku',
  sureler: '/sureler',
  mukabele: '/mukabele',
  dualar: '/dualar',
  kuranDualari: '/kuran-dualari',
  hadis: '/hadis',
};

const NavBarComponent = ({ activePage = 'quran', onPageChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handlePageChange = (event, page) => {
    event.preventDefault();
    if (page === 'quran') {
      window.location.assign('/');
      return;
    }

    window.history.pushState({}, '', pagePaths[page] || '/');
    onPageChange?.(page);
  };

  const handleMobilePageChange = (event, page) => {
    setMobileMenuOpen(false);
    handlePageChange(event, page);
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: '#54613d',
            color: '#fff8d9',
            borderBottom: '1px solid rgba(142, 118, 63, 0.35)',
            boxShadow: '0 2px 10px rgba(47, 56, 35, 0.22)',
          }}
        >
          <Toolbar
            variant="dense"
            id="back-to-top-anchor"
            sx={{
              gap: { xs: 0.75, sm: 1 },
              minHeight: 48,
              px: { xs: 1, sm: 2 },
            }}
          >
            <Avatar
              src="../static/images/icons-Allah.png"
              sx={{
                width: { xs: 30, sm: 40 },
                height: { xs: 30, sm: 40 },
                '& img': {
                  filter: 'invert(1)',
                },
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              onClick={(event) => handlePageChange(event, 'quran')}
              sx={{
                mr: { xs: 0.5, sm: 2 },
                display: 'flex',
                fontFamily: 'inherit',
                fontWeight: 900,
                letterSpacing: 0,
                color: 'inherit',
                textDecoration: 'none',
                paddingLeft: { xs: 0.5, sm: 2 },
                fontSize: { xs: '0.86rem', sm: '1rem' },
                maxWidth: { xs: 128, sm: 'none' },
                '&:visited': {
                  color: '#fff8d9',
                },
                '&:hover': {
                  color: '#111',
                },
                '&:focus': {
                  color: '#111',
                },
              }}
            >
              Kuran-ı Kerim Sitesi
            </Typography>
            <IconButton
              aria-label="Menüyü aç"
              onClick={() => setMobileMenuOpen(true)}
              sx={{
                display: { xs: 'inline-flex', lg: 'none' },
                ml: 'auto',
                width: 40,
                height: 40,
                color: '#fff8d9',
                border: '1px solid rgba(255, 248, 217, 0.42)',
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              component="nav"
              sx={{
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                gap: 0.75,
                minWidth: 0,
                ml: 'auto',
                flex: '1 1 auto',
                justifyContent: 'flex-end',
                overflow: 'hidden',
              }}
            >
              {navItems.map((item) => {
                const selected = activePage === item.key;

                return (
                  <Button
                    key={item.key}
                    href={pagePaths[item.key] || '/'}
                    onClick={(event) => handlePageChange(event, item.key)}
                    sx={{
                      minHeight: 30,
                      flexShrink: 0,
                      px: { xs: 0.9, sm: 1.4 },
                      py: 0.35,
                      color: selected ? '#54613d' : '#fff8d9',
                      backgroundColor: selected ? '#fff8d9' : 'transparent',
                      border: '1px solid rgba(255, 248, 217, 0.42)',
                      borderRadius: 999,
                      fontWeight: 900,
                      fontSize: { xs: '0.78rem', sm: '0.875rem' },
                      textTransform: 'none',
                      '&:visited': {
                        color: selected ? '#54613d' : '#fff8d9',
                      },
                      '&:hover': {
                        color: selected ? '#54613d' : '#111',
                        backgroundColor: selected ? '#fff8d9' : 'rgba(255, 248, 217, 0.12)',
                      },
                      '&:focus': {
                        color: selected ? '#54613d' : '#111',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
      <Box sx={{ height: 48 }} />
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              width: 'min(84vw, 320px)',
              backgroundColor: '#fffdf4',
              color: '#2f312d',
            },
          },
        }}
      >
        <Box
          sx={{
            minHeight: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            backgroundColor: '#54613d',
            color: '#fff8d9',
          }}
        >
          <Typography sx={{ fontWeight: 900 }}>
            Menü
          </Typography>
          <IconButton
            aria-label="Menüyü kapat"
            onClick={() => setMobileMenuOpen(false)}
            sx={{ color: '#fff8d9' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List component="nav" aria-label="Mobil ana menü" sx={{ py: 1 }}>
          {navItems.map((item) => {
            const selected = activePage === item.key;

            return (
              <ListItemButton
                key={item.key}
                component="a"
                href={pagePaths[item.key] || '/'}
                selected={selected}
                onClick={(event) => handleMobilePageChange(event, item.key)}
                sx={{
                  mx: 1,
                  mb: 0.35,
                  minHeight: 46,
                  borderRadius: 1,
                  color: selected ? '#fff8d9' : '#2f312d',
                  backgroundColor: selected ? '#6f7745' : 'transparent',
                  '&.Mui-selected': {
                    backgroundColor: '#6f7745',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: '#5f6839',
                  },
                  '&:hover': {
                    color: '#111',
                    backgroundColor: 'rgba(111, 119, 69, 0.1)',
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontWeight: 900,
                        fontSize: '0.98rem',
                      },
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
    </>
  );
};

export default NavBarComponent;

import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const navItems = [
  { key: 'quran', label: "Kur'an Ezberle" },
  { key: 'sureler', label: 'Sureler' },
  { key: 'mukabele', label: 'Mukabele' },
  { key: 'dualar', label: 'Namaz Duaları' },
  { key: 'kuranDualari', label: "Kur'an Duaları" },
  { key: 'hadis', label: 'Hadis' },
];

const pagePaths = {
  quran: '/',
  sureler: '/sureler',
  mukabele: '/mukabele',
  dualar: '/dualar',
  kuranDualari: '/kuran-dualari',
  hadis: '/hadis',
};

const NavBarComponent = ({ activePage = 'quran', onPageChange }) => {
  const handlePageChange = (event, page) => {
    event.preventDefault();
    if (page === 'quran') {
      window.location.assign('/');
      return;
    }

    window.history.pushState({}, '', pagePaths[page] || '/');
    onPageChange?.(page);
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
            <Box
              component="nav"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.4, sm: 0.75 },
                ml: 'auto',
                flex: '1 1 auto',
                justifyContent: 'flex-end',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
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
    </>
  );
};

export default NavBarComponent;

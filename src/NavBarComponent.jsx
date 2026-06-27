import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArchiveIcon from '@mui/icons-material/Archive';
import { Paper } from '@mui/material';

const NavBarComponent = () => {
 return (
       <>
        <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="fixed"
          sx={{
            display: { xs: 'none', sm: 'block' },
            backgroundColor: '#54613d',
            color: '#fff8d9',
            borderBottom: '1px solid rgba(142, 118, 63, 0.35)',
            boxShadow: '0 2px 10px rgba(47, 56, 35, 0.22)',
          }}
        >
        <Toolbar variant="dense" id="back-to-top-anchor">
         <Avatar
          src="../static/images/icons-Allah.png"
          sx={{
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
            sx={{
              mr: 2,
              display: { xs: 'none', sm: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none', paddingLeft:2
               }}
            >
            Kuran-ı Kerim Sitesi
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
      <Box sx={{ height: { xs: 0, sm: 48 } }} />
        
       </>
 );
}
export default NavBarComponent;

import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';

const BottomBarComponent = () => {
 return (
       <>
        <Box sx={{ flexGrow: 1 }}>

      <BottomNavigation sx={{ width: 500 }} position="fixed" >
      <BottomNavigationAction
        label="Recents"
        value="recents"
        icon={<RestoreIcon />}
      />
      <BottomNavigationAction
        label="Favorites"
        value="favorites"
        icon={<FavoriteIcon />}
      />
    
    
    </BottomNavigation>
    </Box>
       </>
 );
}
export default BottomBarComponent;
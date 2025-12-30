import { useState } from 'react'
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

const NavBarComponent = () => {
 return (
       <>
        <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar variant="dense" id="back-to-top-anchor">
         <Avatar src="../static/images/icons-Allah.png" />
         <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
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
   <br />
       </>
 );
}
export default NavBarComponent;
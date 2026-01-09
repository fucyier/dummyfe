import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { AudioPlayer  } from 'react-audio-play';
import BottomNavigation from '@mui/material/BottomNavigation';
import { AppBar, Button } from '@mui/material';
import Fab from '@mui/material/Fab';
import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { useState,useRef } from 'react';


const VerseComponent = ({surah, author,audio, gorunum, dataVerse}) => {
   const [state, setState] = useState({
    bottom: false
  });
     const [secilenSound, setSecilenSound] = useState(null);

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff7f7ea',
  ...theme.typography.h3,
  padding: theme.spacing(2),
  textAlign: 'right',
  color: (theme.vars ?? theme).palette.text.primary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));
const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: -20,
  left: 0,
  right: 0,
  margin: '0 auto',
});

 const handleClickUp = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      '#back-to-top-anchor',
    );

    if (anchor) {
      anchor.scrollIntoView({
        block: 'center',
      });
    }
  };

    const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };
 const DrawerList =(item) =>(
               <Box
              sx={{ width:  'auto' }}
              role="presentation"
              onKeyDown={toggleDrawer('bottom', false)}
            >
             <AudioPlayer autoPlay={true} src={`https://cdn.islamic.network/quran/audio/128/${audio}/${item}.mp3`} width='100%'  color="#cfcfcf"
                      sliderColor="#94b9ff"
                      backgroundColor="#252a2fff" /> 
    </Box>
  );


  return (
       <>
            <div>
              <Typography sx={{ mt: 2, mb: 2 }} variant="h4" component="div"> 
                {dataVerse.length==0?'':dataVerse.name+' Suresi'}
                </Typography>
                <br/>
              <Stack
                direction="column"
                spacing={2}
                sx={{
                  justifyContent: "flex-start",
                  alignItems: "stretch",
                }}
              >
                <Item key={dataVerse.zero?.id} value={dataVerse.zero?.id}>{gorunum ? dataVerse.zero?.verse_simplified : dataVerse.zero?.verse}</Item>
                <div id={'tr0' + dataVerse.zero?.id} style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'left' }}>{dataVerse.zero?.transcription}</div>
                <div id={'tra0' + dataVerse.zero?.id} style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'left' }}>{author !== 0 ? dataVerse.zero?.translation.text : ''}</div>

                {dataVerse?.verses?.map(item => 
                <>
                  <Divider>
                    {/* <Chip label={item.verse_number} size="large" /> */}
                    <Button variant="contained" endIcon={<SendIcon />} onClick={
                       (e)=>{
                         setState({ ...state, ['bottom']: open });
                         setSecilenSound(e.target.innerText.substring(0,1));
                       }
                      }>
                      {item.id+'. ayet'}
                    </Button>
                    
                  </Divider>
                  <Item key={item.id} value={item.id}>{gorunum ? item.verse_simplified : item.verse}
                  </Item>
                  <div id={'tr' + item.id} style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'left' }}>{item.transcription}</div>
                  <div id={'tra' + item.id} style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'left' }}>{author !== 0 ? item.translation.text : ''}</div>
                </>
                )}
                 <Drawer
                          anchor={'bottom'}
                          open={state['bottom']}
                          onClose={toggleDrawer('bottom', false)}
                        >
                      {DrawerList(secilenSound)}
                    </Drawer>
              </Stack>
            </div>
            {dataVerse.audio!==undefined &&(
              <AppBar position="fixed" color="primary" style={{top: "auto", bottom: 0}} >
                <label>Türkçe Meal</label>
            
              
                 {/* <StyledFab color="primary" variant="circular" size='small' onClick={handleClickUp}>
          <KeyboardArrowUpIcon/>
          </StyledFab> */}
     
               <BottomNavigation sx={{ width: '100%' }}  >
            
                {/* <AudioPlayer src={`https://cdn.islamic.network/quran/audio-surah/128/${audio}/${surah}.mp3`} width='100%'  color="#cfcfcf"
                      sliderColor="#94b9ff"
                      backgroundColor="#1976d2" /> */}
        <AudioPlayer src={dataVerse?.audio?.mp3} width='100%'  color="#cfcfcf"
                      sliderColor="#94b9ff"
                      backgroundColor="#1976d2" /> 
              </BottomNavigation>
            
            </AppBar>
          )
}
          </>
        );
      }


export default VerseComponent;
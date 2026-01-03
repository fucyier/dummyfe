import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { AudioPlayer } from 'react-audio-play';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { AppBar } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { Label } from '@mui/icons-material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const VerseComponent = ({surah, author,audio, gorunum, dataVerse}) => {
 

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

                {dataVerse?.verses?.map(item => <>

                  <Divider>
                    <Chip label={item.verse_number} size="small" />
                  </Divider>
                  <Item key={item.id} value={item.id}>{gorunum ? item.verse_simplified : item.verse}
                  </Item>
                  <div id={'tr' + item.id} style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'left' }}>{item.transcription}</div>
                  <div id={'tra' + item.id} style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'left' }}>{author !== 0 ? item.translation.text : ''}</div>
                </>
                )}
              </Stack>
            </div>
            <AppBar position="fixed" color="primary" style={{top: "auto", bottom: 0}} >
              <Toolbar>
                
                 <StyledFab color="primary" variant="circular" size='small' onClick={handleClickUp}>
          <KeyboardArrowUpIcon/>
          </StyledFab>
       
               <BottomNavigation sx={{ width: '100%' }}  >
          
                <AudioPlayer src={`https://cdn.islamic.network/quran/audio-surah/128/${audio}/${surah}.mp3`} width='100%'  color="#cfcfcf"
              sliderColor="#94b9ff"
              backgroundColor="#1976d2" />
                {/* <audio controls style={{width:'100%'}}>
                  <source src={dataVerse?.audio?.mp3} type="audio/mpeg"></source>
                </audio> */}
              </BottomNavigation>
              </Toolbar>
            </AppBar>

          </>
        );
      }


export default VerseComponent;
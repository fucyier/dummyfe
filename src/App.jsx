import './App.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { useEffect, useState } from 'react'
import NavBarComponent from './NavBarComponent';
import BarComponent from './BarComponent';
import HadisComponent from './HadisComponent';
import DuaComponent from './DuaComponent';
import KuranDuaComponent from './KuranDuaComponent';
import KuranOkuComponent from './KuranOkuComponent';
import KuranTesti from './KuranTesti';
import SureComponent from './SureComponent';
import MukabeleComponent from './MukabeleComponent';
import { applyStaticSeo } from './seo';

const getPageFromPath = () => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/hadis') return 'hadis';
  if (path === '/dualar') return 'dualar';
  if (path === '/kuran-dualari') return 'kuranDualari';
  if (path === '/kuran-oku') return 'kuranOku';
  if (path === '/kuran-testi') return 'kuranTesti';
  if (path === '/sureler') return 'sureler';
  if (path === '/mukabele') return 'mukabele';
  return 'quran';
};

function App() {
  const [activePage, setActivePage] = useState(getPageFromPath);

  useEffect(() => {
    applyStaticSeo(activePage);
  }, [activePage]);

  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getPageFromPath());
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <> 
       <NavBarComponent activePage={activePage} onPageChange={setActivePage} />
       {activePage === 'hadis' ? (
         <HadisComponent />
       ) : activePage === 'dualar' ? (
         <DuaComponent />
       ) : activePage === 'kuranDualari' ? (
         <KuranDuaComponent />
       ) : activePage === 'kuranOku' ? (
         <KuranOkuComponent />
       ) : activePage === 'kuranTesti' ? (
         <KuranTesti />
       ) : (
         <BarComponent
           contentOverride={activePage === 'sureler'
             ? (props) => <SureComponent {...props} />
             : activePage === 'mukabele'
               ? (props) => <MukabeleComponent {...props} />
             : null}
           contentAudioFilter={activePage === 'mukabele'
             ? (item) => item.audioType === 'ayah' && item.source === 'quranfoundation'
             : null}
           hideSurahControl={activePage === 'mukabele'}
         />
       )}
       <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
    </>
  )
}

export default App

import './App.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { lazy, Suspense, useEffect, useState } from 'react'
import NavBarComponent from './NavBarComponent';
import BarComponent from './BarComponent';
import { applyStaticSeo } from './seo';

const HadisComponent = lazy(() => import('./HadisComponent'));
const DuaComponent = lazy(() => import('./DuaComponent'));
const KuranDuaComponent = lazy(() => import('./KuranDuaComponent'));
const KuranOkuComponent = lazy(() => import('./KuranOkuComponent'));
const KuranTesti = lazy(() => import('./KuranTesti'));
const SureComponent = lazy(() => import('./SureComponent'));
const MukabeleComponent = lazy(() => import('./MukabeleComponent'));

const RouteLoading = () => (
  <div className="route-loading" role="status" aria-live="polite">
    <span className="route-loading__spinner" />
    <strong>Lütfen Bekleyiniz</strong>
  </div>
);

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
       <Suspense fallback={<RouteLoading />}>
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
       </Suspense>
       <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
    </>
  )
}

export default App

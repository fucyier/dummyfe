import './App.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { useEffect, useState } from 'react'
import NavBarComponent from './NavBarComponent';
import BarComponent from './BarComponent';
import HadisComponent from './HadisComponent';
import SureComponent from './SureComponent';

const getPageFromPath = () => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/hadis') return 'hadis';
  if (path === '/sureler') return 'sureler';
  return 'quran';
};

function App() {
  const [activePage, setActivePage] = useState(getPageFromPath);

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
       ) : (
         <BarComponent
           contentOverride={activePage === 'sureler'
             ? (props) => <SureComponent {...props} />
             : null}
         />
       )}
       <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
    </>
  )
}

export default App

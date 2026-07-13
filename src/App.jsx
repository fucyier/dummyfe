import './App.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { useState } from 'react'
import NavBarComponent from './NavBarComponent';
import BarComponent from './BarComponent';
import HadisComponent from './HadisComponent';

function App() {
  const [activePage, setActivePage] = useState('quran');

  return (
    <> 
       <NavBarComponent activePage={activePage} onPageChange={setActivePage} />
       {activePage === 'hadis' ? <HadisComponent /> : <BarComponent />}
       <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
    </>
  )
}

export default App

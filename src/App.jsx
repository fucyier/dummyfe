import './App.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import NavBarComponent from './NavBarComponent';
import BarComponent from './BarComponent';
function App() {
  return (
    <> 
       <NavBarComponent />
       <BarComponent/>
       <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
    </>
  )
}

export default App

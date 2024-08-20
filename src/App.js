
import './App.css';
import React,{ Suspense, useState } from 'react';
import { Box } from '@mui/material';
import Header from './components/Header/header';
import Biryani from '../src/images/Biryani.jpg'
import footer from './components/Footer/footer';
import Footer from './components/Footer/footer';
import Navbar from './components/Header/navbar';
import { Contrast } from '@mui/icons-material';



const Recipes = React.lazy(() => import('./components/Header/recipies'));
function App() {
  const [showLogin, setShowLogin] = useState(false);

  return (
   <div className='app'>
     
       <Navbar   />


       
       
       <Header />
        <Recipes/>
        
         <Footer/>
         
    </div>  
  );
}

export default App;

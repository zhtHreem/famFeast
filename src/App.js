
import './App.css';
import React,{ Suspense, useState } from 'react';
import Header from './components/Header/header';

import footer from './components/Footer/footer';
import Footer from './components/Footer/footer';
import Navbar from './components/Header/navbar';

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

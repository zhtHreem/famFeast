
import './App.css';
import React,{ useState } from 'react';
import Header from './components/Header/header';
import Footer from './components/Footer/footer';
import Navbar from './components/Header/navbar';
import Recipes from './components/Header/recipies';
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

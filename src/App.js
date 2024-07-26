
import './App.css';
import React,{ Suspense } from 'react';
import Header from './components/Header/header';

import footer from './components/Footer/footer';
import Footer from './components/Footer/footer';


const Recipes = React.lazy(() => import('./components/Header/recipies'));
function App() {
  return (
   <div className='app'>
     <Header/>
     <Suspense fallback={<div>Loading...</div>}>
        <Recipes/>
        </Suspense>  
     <Footer/>
    </div>  
  );
}

export default App;

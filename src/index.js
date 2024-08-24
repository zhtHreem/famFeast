import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider ,createBrowserRouter} from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Navbar from './components/Header/navbar';
import Header from './components/Header/header';
import Recipe from './components/Recipe/recipe';
import Profile from './components/Profile/profile';
import NewRecipe from './components/Recipe/createNewRecipe';
import Login from './components/Login/login';
import { LoginProvider } from './components/Login/logincontext';
import SearchResults from './components/Tool/search';
const router = createBrowserRouter([

  {
    path:"/",
    element:<App/>
  },
  {
    path:"/navbar",
    element:<Navbar/>
  },
  {
    path:"/recipe/:search",
    element:<Recipe/>
  },
  {
     path:"/search/:query",
    element:<SearchResults/>
  },
  {
    path:"/profile",
    element:<Profile/>
  },
  {
    path:"/newrecipe",
    element:<NewRecipe/>
  },
  {
    path:"/login",
    element:<Login/>
  }



])





const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     <LoginProvider>
    <RouterProvider router={router}/>
    </LoginProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

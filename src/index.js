import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, RouterProvider, createBrowserRouter, useParams } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import './index.css';
import theme from './theme';
import { AuthProvider } from './auth/AuthContext';
import { FeedbackProvider } from './components/Feedback';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Browse from './pages/Browse';
import RecipeDetail from './pages/RecipeDetail';
import RecipeForm from './pages/RecipeForm';
import Pantry from './pages/Pantry';
import Cookbooks from './pages/Cookbooks';
import CookbookDetail from './pages/CookbookDetail';
import Profile from './pages/Profile';
import Saved from './pages/Saved';
import AuthPage from './pages/AuthPage';
import NotFound from './pages/NotFound';
import RouteError from './components/RouteError';
import reportWebVitals from './reportWebVitals';

// Old URLs from the previous version of the site keep working.
const LegacyRecipe = () => <Navigate to={`/recipe/${useParams().id}`} replace />;

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      // Public
      { path: '/', element: <Home /> },
      { path: '/recipes', element: <Browse /> },
      { path: '/recipe/:id', element: <RecipeDetail /> },
      { path: '/pantry', element: <Pantry /> },
      { path: '/profile/:id', element: <Profile /> },
      { path: '/login', element: <AuthPage mode="login" /> },
      { path: '/register', element: <AuthPage mode="register" /> },
      { path: '/search/:query', element: <Navigate to="/recipes" replace /> },
      { path: '/recipes/:id', element: <LegacyRecipe /> },
      // Private: need an account
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/recipes/new', element: <RecipeForm /> },
          { path: '/recipes/:id/edit', element: <RecipeForm /> },
          { path: '/newrecipe', element: <Navigate to="/recipes/new" replace /> },
          { path: '/cookbooks', element: <Cookbooks /> },
          { path: '/cookbooks/:id', element: <CookbookDetail /> },
          { path: '/saved', element: <Saved /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FeedbackProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </FeedbackProvider>
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();

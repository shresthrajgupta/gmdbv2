import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from './redux/store.js';

import "./assets/index.css";

import App from './App.jsx';

import PrivateRoute from './components/PrivateRoute.jsx';

import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignupPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import GameDetailPage from './pages/GameDetailPage.jsx';
import FranchiseDetailPage from './pages/FranchiseDetailPage.jsx';
import PlaylistPage from './pages/PlaylistPage.jsx';
import CompletedListPage from './pages/CompletedListPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index={true} path='/' element={<LoginPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/signup' element={<SignUpPage />} />
      <Route path='/forgotpassword' element={<ForgotPasswordPage />} />

      <Route path='' element={<PrivateRoute />}>
        <Route path='/home' element={<HomePage />}></Route>
        <Route path='/search' element={<SearchPage />}></Route>
        <Route path='/game/guid/:id' element={<GameDetailPage />}></Route>
        <Route path='/franchise/guid/:id' element={<FranchiseDetailPage />}></Route>
        <Route path='/playlist' element={<PlaylistPage />}></Route>
        <Route path='/completedlist' element={<CompletedListPage />}></Route>
      </Route>

      <Route path='*' element={<NotFoundPage />} />
    </Route>
  )
);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);

import { Outlet, useLocation } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Footer from './components/Footer';
import MobileNavigation from './components/MobileNavigation';


function App() {
  const location = useLocation();
  const isAuthPage = (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup');

  return (
    <>
      <main className='pb-14 lg:pb-0'>
        {!isAuthPage && <Header />}
        <div className='min-h-[92vh]'>
          < Outlet />
        </div>
        {!isAuthPage && <Footer />}
        {!isAuthPage && <MobileNavigation />}
      </main>
      <ToastContainer position="top-center" transition={Slide} hideProgressBar autoClose={1500} />
    </>
  );
};

export default App;

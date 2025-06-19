import { useEffect, useState, useRef } from 'react';
import { NavLink, Link, useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { ClipLoader } from 'react-spinners';

import logo from "../assets/logo.png";
import userIcon from "../assets/user2.png";

import { Nav } from '../constants/Navigation.jsx';

import { useLazyGameSearchQuery } from '../redux/slices/async/gamesApiSlice.js';


const Header = () => {
  const navigate = useNavigate();

  const boxRef = useRef(null);

  const [searchInput, setSearchInput] = useState("");
  const [tapUserButton, setTapUserButton] = useState(false);

  const [triggerGameSearch, { data: gameSearchData, isLoading: gameSearchLoading, isFetching: gameSearchFetching }] = useLazyGameSearchQuery();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (searchInput === "")
      navigate("/home");
    else {
      navigate(`/search?q=${searchInput}`);
    }

    setSearchInput("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setTapUserButton(false);
      }
    };

    if (tapUserButton) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tapUserButton]);

  useEffect(() => {
    const delayBounce = setTimeout(async () => {
      try {
        if (searchInput) {
          await triggerGameSearch({ game: searchInput.trim() }).unwrap();
        }
      } catch (err) {
        toast.error(err?.data?.message || err?.error);
      }
    }, 250);

    return () => clearTimeout(delayBounce);
  }, [searchInput]);

  return (
    <header className='fixed top-0 w-full h-16 bg-black/60 z-40 backdrop-blur-xs'>
      <div className='container mx-auto px-3 flex items-center h-full'>
        <Link to={"/home"}>
          <img src={logo} alt='logo' width={70} />
        </Link>

        <nav className='hidden lg:flex items-center gap-1 ml-5'>
          {Nav.map((nav, index) => {
            return (
              <div key={index}>
                <NavLink key={nav.label} to={nav.href} className={({ isActive }) => `px-2 hover:text-white ${isActive && "text-white"}`}>
                  {nav.label}
                </NavLink>
              </div>
            )
          })}
        </nav>

        <div className='ml-auto flex items-center gap-5'>
          <div className='relative'>
            <form className='flex items-center gap-2' onSubmit={handleSubmit}>
              <input type='text' placeholder='Search game' className='bg-transparent px-4 py-1 outline-none border-none' onChange={(e) => { setSearchInput(e.target.value) }} value={searchInput} />
              <button className='text-2xl text-white'>
                <IoSearchOutline />
              </button>
            </form>

            {
              searchInput.length > 0 &&
              <ul className='absolute w-full bg-opacity-90 rounded-lg mt-2 bg-neutral-800'>
                {gameSearchFetching
                  ?
                  <li className='px-4 py-2 flex items-center'> <span className='mx-2'>Loading...</span> <ClipLoader size={20} color='#fff' /> </li>
                  :
                  (gameSearchData?.length === 0 ? <p className='px-4 py-2'>No results found</p> :
                    gameSearchData?.map((result) => (
                      <Link className='px-4 py-2 hover:bg-neutral-600 cursor-pointer rounded block' key={result.id} to={result.url} onClick={() => setSearchInput("")} >{result.name}</Link>
                    )))
                }
              </ul>
            }
          </div>

          <div className='relative w-8 h-8 rounded-full cursor-pointer'>
            <img className='active:scale-90 transition-all' src={userIcon} alt='user' onClick={() => setTapUserButton((tapUserButton) => !tapUserButton)} />

            {
              tapUserButton &&
              <ul className='absolute right-0 bg-opacity-90 rounded-lg mt-2 bg-neutral-800' ref={boxRef}>
                <li className='px-4 py-2 hover:bg-neutral-600 cursor-pointer rounded'>
                  <Link to={"/about"}>About</Link>
                </li>

                <li className='px-4 py-2 hover:bg-neutral-600 cursor-pointer rounded'
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}>
                  <p>Logout</p>
                </li>
              </ul>
            }

          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
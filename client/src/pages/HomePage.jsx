import { useState } from 'react';
import { Link } from "react-router-dom";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

import covers from '../constants/cover';

import HorizontalScroll from '../components/HorizontalScroll';
import Loading from '../components/Loading';

import UnauthorizedPage from "./UnauthorizedPage";

import { useHomepageGamesQuery } from '../redux/slices/async/usersApiSlice';

const len = Object.keys(covers).length;


const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);

  const { data: homepageGamesData, isLoading: homepageGamesLoading, error: homepageGamesErr } = useHomepageGamesQuery();

  const handleNext = () => {
    if (currentImage < len - 1)
      setCurrentImage(val => val + 1);
    else
      setCurrentImage(0);
  };
  const handlePrev = () => {
    if (currentImage > 0)
      setCurrentImage(val => val - 1);
    else
      setCurrentImage(len - 1);
  };

  return (
    homepageGamesErr || true ? <UnauthorizedPage /> :
      <>
        <div>
          <section className='w-full h-full'>
            <div className='flex min-h-full max-h-[95vh] overflow-hidden'>
              {
                Object.keys(covers).map((key) => {
                  const arr = key.split("|");
                  const name = arr[0];
                  let url = arr[1].split("_").join("/");
                  url = url.substring(0, url.length - 5);

                  return (
                    <div key={key} className='lg:min-h-full min-h-[450px] min-w-full overflow-hidden relative group transition-all' style={{ transform: `translateX(-${currentImage * 100}%)` }}>
                      <div className='w-full h-full'>
                        <img
                          src={covers[key]}
                          alt={name}
                          className='w-full h-full object-cover'
                        />
                      </div>

                      <div className='absolute top-0 w-full h-full hidden items-center justify-between px-4 group-hover:lg:flex'>
                        <button onClick={handlePrev} className='bg-white p-1 rounded-full text-xl z-10 text-black'>
                          <FaAngleLeft />
                        </button>
                        <button onClick={handleNext} className='bg-white p-1 rounded-full text-xl z-10 text-black'>
                          <FaAngleRight />
                        </button>
                      </div>

                      <div className='absolute top-0 w-full h-full bg-gradient-to-t from-neutral-900 to-transparent'></div>

                      <div className='container mx-auto'>
                        <div className='absolute bottom-0 max-w-md px-3'>
                          <h2 className='font-bold text-2xl lg:text-4xl text-white drop-shadow-2xl'>{name}</h2>
                          <button className='bg-white px-3 py-2 text-black font-bold rounded mt-4 hover:bg-gradient-to-l from-red-700 to-orange-500 shadow-md transition-all'>
                            <Link to={url}>
                              Go to Game
                            </Link>
                          </button>
                        </div>
                      </div>
                    </div>

                  )
                })
              }
            </div>
          </section>

          {
            homepageGamesLoading ? <Loading /> :
              <>
                {
                  homepageGamesData?.toPlay?.length > 0
                    ?
                    <HorizontalScroll data={homepageGamesData?.toPlay} heading={"Your Playlist"} />
                    :
                    <>
                      <div className='container mx-auto px-4'>
                        <h3 className='text-lg lg:text-3xl font-semibold my-20'>
                          You don't have any games in your playlist
                        </h3>
                      </div>
                    </>
                }
              </>
          }
        </div>
      </>
  );
};

export default Home;
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import moment from "moment";
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

import UnauthorizedPage from "./UnauthorizedPage";

import Loading from '../components/Loading';
import Divider from '../components/Divider';
import StarRating from '../components/StarRating';
import Meta from '../components/Meta';

import gameCover from "../assets/game_cover.webp";

import { useGameDetailsQuery } from '../redux/slices/async/gamesApiSlice';
import { useAddToPlaylistMutation, useDelFromPlaylistMutation, useAddToCompletedListMutation, useDelFromCompletedListMutation } from '../redux/slices/async/usersApiSlice';


const GameDetailPage = () => {
    const params = useParams();
    const guid = params.id;

    const { data: gameDetailsData, isFetching: gameDetailsFetching, error: gameDetailsErr } = useGameDetailsQuery({ guid });
    const [addToPlaylist, { isLoading: addToPlaylistLoading }] = useAddToPlaylistMutation();
    const [delFromPlaylist, { isLoading: delFromPlaylistLoading }] = useDelFromPlaylistMutation();
    const [addToCompletedList, { isLoading: addToCompletedListLoading }] = useAddToCompletedListMutation();
    const [delFromCompletedList, { isLoading: delFromCompletedListLoading }] = useDelFromCompletedListMutation();

    const [playing, setPlaying] = useState(false);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        setPlaying(gameDetailsData?.isPlaying);
        setCompleted(gameDetailsData?.isCompleted);
    }, [gameDetailsData]);

    const changePlaylist = async () => {
        if (!playing) {
            try {
                await addToPlaylist({ gameId: gameDetailsData?._id }).unwrap();
                setPlaying(true);
                setCompleted(false);
                toast.dismiss();
                toast.success("Added to playlist");
            } catch (err) {
                toast.dismiss();
                toast.error(err?.data?.message || err.error);
                return;
            }
        } else {
            try {
                await delFromPlaylist({ gameId: gameDetailsData?._id });
                setPlaying(false);
                toast.dismiss();
                toast.success("Removed from playlist");
            } catch (err) {
                toast.dismiss();
                toast.error(err?.data?.message || err.error);
                return;
            }
        }
    };

    const changeCompletedlist = async () => {
        if (!completed) {
            try {
                await addToCompletedList({ gameId: gameDetailsData?._id });
                setCompleted(true);
                setPlaying(false);
                toast.dismiss();
                toast.success("Added to completed list");
            } catch (err) {
                toast.dismiss();
                toast.error(err?.data?.message || err.error);
                return;
            }
        } else {
            try {
                await delFromCompletedList({ gameId: gameDetailsData?._id });
                setCompleted(false);
                toast.dismiss();
                toast.success("Removed from completed list");
            } catch (err) {
                toast.dismiss();
                toast.error(err?.data?.message || err.error);
                return;
            }
        }
    };

    return (
        <>
            <Meta title={gameDetailsData?.name === undefined ? "Welcome to GMDB" : `${gameDetailsData?.name} - GMDB`} />

            {
                gameDetailsErr ? <UnauthorizedPage /> : (
                    gameDetailsFetching ? <Loading /> :
                        <>
                            <div>
                                <div className='w-full h-[280px] relative hidden lg:block'>
                                    <div className='w-full h-full'>
                                        <img src={gameCover} alt='game_cover' className='h-full w-full object-cover' />
                                    </div>

                                    <div className='absolute w-full h-full top-0 bg-gradient-to-t from-neutral-900 to-transparent'></div>
                                </div>

                                <div className='container mx-auto px-3 py-2 lg:py-0 flex flex-col lg:flex-row gap-5 lg:gap-10'>
                                    <div className='relative mx-auto lg:-mt-28 lg:mx-0 w-fit min-w-60 mt-20'>
                                        <img src={gameDetailsData.poster} alt='poster' className='h-80 w-60 object-cover rounded' />


                                        <button onClick={changePlaylist} className={`mt-4 w-full py-2 text-center text-black rounded font-bold text-lg ${playing ? "bg-gradient-to-l from-red-500 to-orange-500" : "bg-white"} hover:scale-105 transition-all`}> {(!addToPlaylistLoading && !delFromPlaylistLoading) ? "Playlist" : <ClipLoader size={18} color="#000000" />} </button>

                                        <button onClick={changeCompletedlist} className={`mt-4 w-full py-2 text-center text-black rounded font-bold text-lg ${completed ? "bg-gradient-to-l from-red-500 to-orange-500" : "bg-white"} hover:scale-105 transition-all`}> {(!addToCompletedListLoading && !delFromCompletedListLoading) ? "Completed" : <ClipLoader size={18} color="#000000" />} </button>
                                    </div>

                                    <div>
                                        <h2 className='text-2xl lg:text-4xl my-2 font-bold text-white'> {gameDetailsData.name} </h2>
                                        <p className='text-neutral-400'> {gameDetailsData.deck} </p>

                                        <Divider />

                                        {!gameDetailsFetching && <StarRating gameId={gameDetailsData?._id} guid={guid} />}

                                        <Divider />

                                        <div>
                                            {
                                                gameDetailsData?.original_game_rating?.length > 0 && (
                                                    <>
                                                        <p>
                                                            <strong>Ratings: </strong>
                                                            {
                                                                gameDetailsData?.original_game_rating?.map((rating, index) => (
                                                                    <span key={index}>{rating}{index < gameDetailsData?.original_game_rating?.length - 1 ? ' | ' : ''}</span>
                                                                ))
                                                            }
                                                        </p>
                                                        <Divider />
                                                    </>
                                                )
                                            }
                                        </div>

                                        <div>
                                            {
                                                gameDetailsData?.platforms?.length > 0 &&
                                                <>
                                                    <p>
                                                        <strong>Platforms: </strong>
                                                        {gameDetailsData?.platforms?.map((platform, index) => (
                                                            <span key={index}>{platform}{index < gameDetailsData?.platforms?.length - 1 ? ' | ' : ''}</span>
                                                        ))}
                                                    </p>
                                                    <Divider />
                                                </>
                                            }
                                        </div>

                                        <div>
                                            {
                                                (gameDetailsData.expected_release_day || gameDetailsData.expected_release_month || gameDetailsData.expected_release_year) &&
                                                <>
                                                    <p>
                                                        <strong>Expected Release: </strong>
                                                        {
                                                            (gameDetailsData?.expected_release_day || "") + " "
                                                            + (gameDetailsData?.expected_release_month !== null ? moment().month(gameDetailsData?.expected_release_month - 1).format('MMMM') : "") + " "
                                                            + gameDetailsData?.expected_release_year
                                                        }
                                                    </p>
                                                    <Divider />
                                                </>
                                            }

                                            {
                                                gameDetailsData?.original_release_date &&
                                                <>
                                                    <p> <strong>Release Date: </strong> {moment(gameDetailsData?.original_release_date).format("Do MMMM YYYY")}</p>
                                                    <Divider />
                                                </>
                                            }
                                        </div>


                                        <div>
                                            {
                                                gameDetailsData?.developers?.length > 0 &&
                                                <>
                                                    <p>
                                                        <strong>Developers: </strong>
                                                        {gameDetailsData?.developers?.map((dev, index) => (
                                                            <span key={index}>{dev}{index < gameDetailsData?.developers?.length - 1 ? ' | ' : ''}</span>
                                                        ))}
                                                    </p>
                                                    <Divider />
                                                </>
                                            }

                                            {
                                                gameDetailsData?.publishers?.length > 0 &&
                                                <>
                                                    <p>
                                                        <strong>Publishers: </strong>
                                                        {gameDetailsData?.publishers?.map((publisher, index) => (
                                                            <span key={index}>{publisher}{index < gameDetailsData?.publishers?.length - 1 ? ' | ' : ''}</span>
                                                        ))}
                                                    </p>
                                                    <Divider />
                                                </>
                                            }

                                            {
                                                gameDetailsData?.dlcs?.length > 0 &&
                                                <>
                                                    <p>
                                                        <strong>DLCs: </strong>
                                                        {gameDetailsData?.dlcs?.map((dlc, index) => (
                                                            <span key={index}>{dlc}{index < gameDetailsData?.dlcs?.length - 1 ? ' | ' : ''}</span>
                                                        ))}
                                                    </p>
                                                    <Divider />
                                                </>
                                            }

                                            {
                                                gameDetailsData?.genres?.length > 0 &&
                                                <>
                                                    <p>
                                                        <strong>Genres: </strong>
                                                        {gameDetailsData?.genres?.map((genre, index) => (
                                                            <span key={index}>{genre}{index < gameDetailsData?.genres?.length - 1 ? ' | ' : ''}</span>
                                                        ))}
                                                    </p>
                                                    <Divider />
                                                </>
                                            }

                                            {
                                                gameDetailsData?.themes?.length > 0 &&
                                                <>
                                                    <p>
                                                        <strong>Themes: </strong>
                                                        {gameDetailsData?.themes?.map((theme, index) => (
                                                            <span key={index}>{theme}{index < gameDetailsData?.themes?.length - 1 ? ' | ' : ''}</span>
                                                        ))}
                                                    </p>
                                                    <Divider />
                                                </>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    {
                                        gameDetailsData?.franchises?.length > 0 &&
                                        <div className='container mx-auto px-3 my-10'>
                                            <h2 className='text-xl lg:text-2xl font-bold mb-5' >This game is part of the franchise</h2>

                                            <div className='relative'>
                                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10'>
                                                    {
                                                        gameDetailsData?.franchises?.map((franchise, index) => {
                                                            return (
                                                                <Link to={franchise.url} key={index} className='w-full overflow-hidden block rounded relative hover:scale-105 transition-all'>
                                                                    <h4 style={{ color: "#f9af05" }} className='text-ellipsis line-clamp-1 text-md font-semibold'>{franchise.name}</h4>
                                                                </Link>
                                                            );
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>


                                <div>
                                    {
                                        gameDetailsData?.similar_games?.length > 0 &&
                                        <div className='container mx-auto px-3 my-10'>
                                            <h2 className='text-xl lg:text-2xl font-bold mb-5' >Similar Games</h2>

                                            <div className='relative'>
                                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10'>
                                                    {
                                                        gameDetailsData?.similar_games?.map((game, index) => {
                                                            return (
                                                                <Link to={game.url} key={index} className='w-full overflow-hidden block rounded relative hover:scale-105 transition-all'>
                                                                    <h4 style={{ color: "#f9af05" }} className='text-ellipsis line-clamp-1 text-md font-semibold'>{game.name}</h4>
                                                                </Link>
                                                            );
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>

                                <div>
                                    <div className='container mx-auto px-3 my-5'>
                                        <p>Last updated at {moment(gameDetailsData?.updatedAt).format("Do MMMM YYYY")}</p>
                                    </div>
                                </div>
                            </div >
                        </>
                )
            }
        </>
    );
};

export default GameDetailPage;
import { useEffect, useState, useRef, useCallback } from 'react';
import { BeatLoader } from "react-spinners";
import { toast } from 'react-toastify';

import Card from '../components/Card';
import Meta from '../components/Meta';

import UnauthorizedPage from "./UnauthorizedPage";

import { useLazyShowPlaylistQuery } from '../redux/slices/async/usersApiSlice';


const PlaylistPage = () => {
    const totalPage = useRef(0);

    const [pageNo, setPageNo] = useState(1);
    const [data, setData] = useState([]);
    const [isDataEmpty, setIsDataEmpty] = useState(false);

    const [showPlaylist, { data: showPlaylistData, isFetching: showPlaylistFetching, isError: showPlaylistErr }] = useLazyShowPlaylistQuery();

    const handleScroll = useCallback(() => {
        const buffer = 10;

        if (showPlaylistFetching) return;

        if ((window.innerHeight + window.scrollY + buffer) >= document.body.offsetHeight) {
            setPageNo((prev) => {
                if ((prev + 1) > totalPage.current) {
                    return prev;
                } else {
                    return (prev + 1);
                }
            });
        }
    }, [showPlaylistFetching]);

    useEffect(() => {
        if (pageNo < totalPage.current && !showPlaylistFetching) {
            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
        }
    }, [handleScroll, pageNo, showPlaylistFetching]);

    useEffect(() => {
        const handlePagination = async (pageNo) => {
            try {
                if (pageNo === 1) {
                    const res = await showPlaylist({ pageNo }).unwrap();

                    if (res.toPlay.length === 0) {
                        setIsDataEmpty(true);
                    } else {
                        setData([...res.toPlay]);
                        totalPage.current = parseInt(res.totalPages);
                    }
                } else {
                    if (pageNo <= totalPage.current) {
                        const res = await showPlaylist({ pageNo }).unwrap();
                        setData(prev => [...prev, ...res.toPlay]);
                    }
                }
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        };

        handlePagination(pageNo);
    }, [pageNo, showPlaylist]);

    return (
        <>
            <Meta title='Playlist - GMDB' />
            {
                showPlaylistErr ? <UnauthorizedPage /> :
                    <>
                        <div className='py-16'>
                            <div className='container mx-auto'>
                                <h3 className='text-lg lg:text-3xl font-semibold my-5 px-5'>Your Playlist</h3>

                                {
                                    isDataEmpty &&
                                    <div className='flex justify-center items-center mt-16'>
                                        <h3 className='text-lg lg:text-3xl font-semibold my-5 px-5'>No playlist game found</h3>
                                    </div>
                                }

                                <div className='grid grid-cols-[repeat(auto-fit,230px)] gap-6 justify-center lg:justify-start'>
                                    {
                                        data.map((game, index) => <Card data={game} key={game.id + index} />)
                                    }
                                </div>
                            </div>

                            {
                                showPlaylistFetching &&
                                <>
                                    <div className='flex justify-center items-center mt-16'>
                                        <BeatLoader color="#ffffff" size={15} />
                                    </div>
                                </>
                            }
                        </div>
                    </>
            }
        </>
    );
};

export default PlaylistPage;
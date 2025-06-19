import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import moment from "moment";

import UnauthorizedPage from "./UnauthorizedPage";

import Loading from '../components/Loading';
import Divider from '../components/Divider';

import gameCover from "../assets/game_cover.webp";

import { useFranchiseDetailsQuery } from '../redux/slices/async/franchisesApiSlice';

const FranchiseDetailPage = () => {
    const params = useParams();
    const guid = params.id;

    const { data: franchiseDetailsData, isLoading: franchiseDetailsLoading, isError } = useFranchiseDetailsQuery({ guid });

    return (
        false ? <UnauthorizedPage /> : (
            franchiseDetailsLoading ? <Loading /> :
                <>
                    <div>
                        <div className='w-full h-[280px] relative hidden lg:block'>
                            <div className='w-full h-full'>
                                <img src={gameCover} alt='game_cover' className='h-full w-full object-cover' />
                            </div>

                            <div className='absolute w-full h-full top-0 bg-gradient-to-t from-neutral-900 to-transparent'></div>
                        </div>

                        <div className='container mx-auto px-3 py-2 lg:py-0 flex flex-col lg:flex-row gap-5 lg:gap-10'>
                            <div>
                                <h2 className='text-2xl lg:text-4xl my-2 font-bold text-white'> {franchiseDetailsData?.name} </h2>
                                <p className='text-neutral-400'> {franchiseDetailsData?.deck} </p>

                                <Divider />
                            </div>
                        </div>

                        <div>
                            {
                                franchiseDetailsData?.games?.length > 0 &&
                                <div className='container mx-auto px-3 my-10'>
                                    <h2 className='text-xl lg:text-2xl font-bold mb-5' >This franchise has following series of games: </h2>

                                    <div className='relative'>
                                        <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10'>
                                            {
                                                franchiseDetailsData?.games?.map((game, index) => {
                                                    return (
                                                        <Link to={game?.url} key={index} className='w-full overflow-hidden block rounded relative hover:scale-105 transition-all'>
                                                            <h4 style={{ color: "#f9af05" }} className='text-ellipsis line-clamp-1 text-md font-semibold'>{game?.name}</h4>
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
                                <p>Last updated at {moment(franchiseDetailsData?.updatedAt).format("Do MMMM YYYY")}</p>
                            </div>
                        </div>
                    </div>
                </>
        )
    )
}

export default FranchiseDetailPage;
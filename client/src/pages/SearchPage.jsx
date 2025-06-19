import { Link, useSearchParams } from "react-router-dom";

import Loading from '../components/Loading';

import { useGameSearchQuery } from '../redux/slices/async/gamesApiSlice.js';


const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const game = searchParams.get('q');

    const { data: gameSearchData, isFetching: gameSearchFetching } = useGameSearchQuery({ game });


    return (
        gameSearchFetching ? <Loading /> :
            <div className='py-16'>
                <div className='container mx-auto'>
                    <h3 className='capitalize text-lg lg:text-xl font-semibold my-3'>Search Results</h3>

                    <div className="container mx-auto p-4">
                        {gameSearchData.map((game, index) => (
                            <Link to={game.url} key={index} className="flex justify-between games-center p-2 mb-2 max-w-md mx-auto bg-neutral-800 text-white shadow-lg rounded-xl transform transition-transform hover:scale-105 hover:bg-neutral-700" >
                                <span className="text-base font-semibold">{game.name}</span>
                                <span className="text-sm text-gray-400">{game.resource_type}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
    );
};

export default SearchPage;
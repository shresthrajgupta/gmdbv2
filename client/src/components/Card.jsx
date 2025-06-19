import { Link } from 'react-router-dom';


const Card = ({ data }) => {
    return (
        <Link to={data.url} className='w-full min-w-[230px] max-w-[230px] h-80 overflow-hidden block rounded relative hover:scale-105 transition-all'>

            {
                data?.poster
                    ?
                    <img src={data.poster} className='w-full h-full object-cover' />
                    :
                    <div className='bg-neutral-800 h-full w-full flex justify-center items-center'>No image found</div>
            }


            <div className='absolute bottom-0 h-12 backdrop-blur-xs bg-black/40 w-full p-2'>
                <h2 className='text-ellipsis line-clamp-1 text-lg font-semibold'>{data.name}</h2>
            </div>
        </Link >
    );
};

export default Card;
import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';

import { useGetRatingQuery, useChangeRatingMutation } from '../redux/slices/async/ratingsApiSlice';


const StarRating = ({ guid, gameId }) => {
    const [hovered, setHovered] = useState(null);

    const { data: getRatingData, isFetching: getRatingFetching, refetch: getRatingRefetch } = useGetRatingQuery({ guid, gameId });
    const [changeRating, { isLoading: changeRatingLoading }] = useChangeRatingMutation();

    const handleChange = async (value) => {
        try {
            await changeRating({ gameId, score: value });
            getRatingRefetch();
            toast.success("Rating updated");
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    return (
        (getRatingFetching || changeRatingLoading) ? <p className='flex items-center'> <span className='mr-2'>Loading...</span> <ClipLoader size={20} color="#ffffff" /> </p> :
            <>
                <div className="flex space-x- items-center">
                    <strong>Your Rating: </strong>

                    <div className='flex ml-2'>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                                key={star}
                                size={25}
                                className={`cursor-pointer transition-colors duration-200 ${(hovered || getRatingData?.user) >= star ? "text-orange-500" : "text-gray-300"}`}
                                onClick={() => handleChange(star)}
                                onMouseEnter={() => setHovered(star)}
                                onMouseLeave={() => setHovered(null)}
                            />
                        ))}
                    </div>

                    <p className='px-2'> {getRatingData?.average}/5 ({getRatingData?.count})</p>
                </div>
            </>
    );
};

export default StarRating;

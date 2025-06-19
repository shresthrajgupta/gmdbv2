import { useEffect, useState } from 'react';
import { BeatLoader } from "react-spinners";
import { toast } from 'react-toastify';

import Card from '../components/Card';

import UnauthorizedPage from "./UnauthorizedPage";

import { useLazyShowCompletedListQuery } from '../redux/slices/async/usersApiSlice';


const CompletedListPage = () => {
    const [pageNo, setPageNo] = useState(1);
    const [data, setData] = useState([]);
    const [totalPage, setTotalPage] = useState(0);

    const [showCompletedList, { data: showCompletedListData, isFetching: showCompletedListFetching, isError: showCompletedListErr }] = useLazyShowCompletedListQuery();

    const handleScroll = () => {
        const buffer = 10;

        if ((window.innerHeight + window.scrollY + buffer) >= document.body.offsetHeight) {

            setPageNo((prev) => {
                if ((prev + 1) >= totalPage) {
                    window.removeEventListener("scroll", handleScroll);
                }

                return (prev + 1);
            });
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handlePagination = async (pageNo) => {
            try {
                if (pageNo === 1) {
                    const res = await showCompletedList({ pageNo });
                    setData([...res?.data?.finished]);
                    setTotalPage(res?.data?.totalPages);
                } else {
                    if (pageNo <= totalPage) {
                        const res = await showCompletedList({ pageNo });
                        setData(prev => [...prev, ...res?.data?.finished]);
                    }
                }
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        };

        handlePagination(pageNo);
    }, [pageNo]);

    return (
        showCompletedListErr ? <UnauthorizedPage /> :
            <>
                <div className='py-16'>
                    <div className='container mx-auto'>
                        <h3 className='text-lg lg:text-3xl font-semibold my-5 px-5'>Your Completed List</h3>

                        <div className='grid grid-cols-[repeat(auto-fit,230px)] gap-6 justify-center lg:justify-start'>
                            {
                                data.map((game, index) => <Card data={game} key={game.id + index} />)
                            }
                        </div>
                    </div>

                    {
                        (pageNo <= totalPage + 1) && showCompletedListFetching &&
                        <>
                            <div className='flex justify-center items-center mt-16'>
                                <BeatLoader color="#ffffff" size={15} />
                            </div>
                        </>
                    }
                </div>
            </>
    );
};

export default CompletedListPage;
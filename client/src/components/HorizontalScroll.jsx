import { useRef } from 'react';
import Card from './Card';

import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";


const HorizontalScroll = ({ data = [], heading }) => {
    const containerRef = useRef();

    const handleNext = () => {
        containerRef.current.scrollLeft += 252;
    };
    const handlePrev = () => {
        containerRef.current.scrollLeft -= 252;
    };

    return (
        <div className='container mx-auto px-3 my-10'>
            <h2 className='text-xl lg:text-2xl font-bold mb-2' >{heading}</h2>
            <div className='relative'>
                <div ref={containerRef} className='grid grid-cols-[repeat(auto-fit,230px)] gap-6 grid-flow-col overflow-hidden overflow-x-scroll relative z-10 scroll-smooth transition-all scrollbar-none'>
                    {
                        data.map((datum, index) => {
                            return (
                                <Card key={index} data={datum} index={index + 1} />
                            )
                        })
                    }
                </div>

                <div className='absolute top-0 hidden lg:flex justify-between w-full h-full items-center'>
                    <button onClick={handlePrev} className='bg-white p-1 text-black rounded-full -ml-1 z-10'>
                        <FaAngleLeft />
                    </button>
                    <button onClick={handleNext} className='bg-white p-1 text-black rounded-full -mr-1 z-10'>
                        <FaAngleRight />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default HorizontalScroll;
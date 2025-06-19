import { BeatLoader } from "react-spinners";

const Loading = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <BeatLoader color="#ffffff" size={20} />
        </div>
    );
};

export default Loading;
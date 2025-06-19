import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className='text-center bg-neutral-600 bg-opacity-35 text-neutral-400 py-2 mt-5'>
            <div className='flex items-center justify-center gap-4'>
                <Link to={"https://www.github.com/shresthrajgupta"}>GitHub</Link>
                <Link to={"/feedback"}>Feedback</Link>
            </div>
            <p className='text-sm'>Created by Shresth Raj Gupta</p>
        </footer>
    );
};

export default Footer;
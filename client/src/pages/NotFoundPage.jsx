import { Link } from 'react-router-dom';


const NotFoundPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white">
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">404 :(</h1>
                <p className="text-2xl mb-8">Page Not Found</p>
                <Link to="/home" className="text-blue-500 hover:text-blue-400">
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;

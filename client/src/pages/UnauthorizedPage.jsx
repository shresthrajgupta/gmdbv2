import { useEffect } from 'react';


const UnauthorizedPage = () => {
    useEffect(() => {
        localStorage.clear();
    }, []);

    const clearCredentials = () => {
        localStorage.clear();
        window.location.reload();
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white">
            <div className="text-center">
                <p className="text-2xl mb-8">Session expired, Please re-login</p>
                <p className="text-blue-500 hover:text-blue-400 cursor-pointer" onClick={clearCredentials}>
                    Go To Login Page
                </p>
            </div>
        </div>
    );
};

export default UnauthorizedPage;

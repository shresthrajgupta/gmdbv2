import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import logo from "../assets/logo.png";

import { useSignupMutation, useVerifyOtpMutation } from '../redux/slices/async/usersApiSlice';
import { setCredentials } from '../redux/slices/sync/authSlice';

import WarningReload from "../components/WarningReload";


const SignUpPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [retypePassword, setRetypePassword] = useState("");
    const [otp, setOtp] = useState("");

    const [isError, setIsError] = useState(false);
    const [showOtp, setShowOtp] = useState(false);

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    WarningReload(hasUnsavedChanges);

    const [signup, { isLoading: signupLoading }] = useSignupMutation();
    const [verifyOtp, { isLoading: verifyOtpLoading }] = useVerifyOtpMutation();


    const handleSignupSubmit = async (e) => {
        e.preventDefault();

        // if (showOtp) {
        //     const otpError = validateOtp();
        //     if (otpError) {
        //         setServerError(otpError);
        //         setDisabledBtn(false);
        //         return;
        //     }

        //     try {
        //         const response = await axios.post('/user/verify',
        //             { otp: parseInt(otpData.otp) },
        //             {
        //                 headers: {
        //                     'Content-Type': 'application/json',
        //                     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //                 }
        //             }
        //         );

        //         if (response.status === 200) {
        //             localStorage.removeItem('token');
        //             navigate('/login');
        //         }
        //         else {
        //             setServerError('OTP mismatch');
        //         }

        //         setDisabledBtn(false);

        //     } catch (error) {
        //         setServerError(error?.response?.data?.error || 'An error occurred, please try again.');
        //         setDisabledBtn(false);
        //     }
        // }

        if (!name || name.length < 5 || name.length > 15) {
            toast.error("Name must be between 5 to 15 characters");
            setIsError(true);
            return;
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            toast.error("Enter valid email");
            setIsError(true);
            return;
        }
        if (!password || password.length < 5 || password.length > 15) {
            toast.error("Password must be between 5 to 15 characters");
            setIsError(true);
            return;
        }
        if (!retypePassword || retypePassword.length < 5 || retypePassword.length > 15) {
            toast.error("Password must be between 5 to 15 characters");
            setIsError(true);
            return;
        }
        if (password !== retypePassword) {
            toast.error("Passwords do not match");
            setIsError(true);
            return;
        }

        try {
            const res = await signup({ name, email, password }).unwrap();

            if (res?.message === "OTP sent successfully") {
                setShowOtp(true);
                setHasUnsavedChanges(true);
            }
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }

    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await verifyOtp({ otp }).unwrap();
            dispatch(setCredentials({ ...res }));
            navigate("/home");
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="flex flex-col items-center px-6">
                    <img src={logo} alt='Logo' className="w-32" />
                    <p className='text-xl md:text-2xl'>Level up your gaming with GMDB</p>
                    <p className='text-xl md:text-2xl'>Sign up and stay on top of the action!</p>
                </div>

                <div className="p-6 w-full max-w-sm">
                    {showOtp ?
                        (
                            <>
                                <form onSubmit={handleOtpSubmit} >
                                    <h2 className="text-2xl font-bold mb-6 text-center"> Verify OTP</h2>

                                    <div className="mb-4">
                                        <label htmlFor="otp" className="block text-gray-700 dark:text-gray-300">Enter OTP:</label>
                                        <input type="text" id="otp" name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${isError ? 'border-red-500' : 'border-gray-300'} bg-neutral-900`} />
                                    </div>

                                    <button type="submit" disabled={verifyOtpLoading} className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 ${verifyOtpLoading ? 'opacity-50 cursor-not-allowed' : ''}`} > Verify OTP </button>
                                </form>
                            </>
                        )
                        :
                        (
                            <>
                                <form onSubmit={handleSignupSubmit} >
                                    <div className="mb-4">
                                        <label htmlFor="name" className="block">Name:</label>
                                        <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${isError ? 'border-red-500' : 'border-white'} focus:border-blue-500 bg-neutral-900`} placeholder="Shresth Gupta" required />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="email" className="block">Email:</label>
                                        <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${isError ? 'border-red-500' : 'border-white'} focus:border-blue-500 bg-neutral-900`} placeholder="xyz@email.com" required />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="password" className="block">Password:</label>
                                        <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${isError ? 'border-red-500' : 'border-white'} focus:border-blue-500 bg-neutral-900`} placeholder="p@sswOrd" required />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="retypePassword" className="block">Confirm Password:</label>
                                        <input type="password" id="retypePassword" name="retypePassword" value={retypePassword} onChange={(e) => setRetypePassword(e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${isError ? 'border-red-500' : 'border-white'} focus:border-blue-500 bg-neutral-900`} placeholder="p@sswOrd" required />
                                    </div>

                                    <button type="submit" disabled={signupLoading} className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 ${signupLoading ? 'opacity-50 cursor-not-allowed' : ''}`}> Sign Up </button>
                                </form>
                            </>
                        )
                    }
                </div>

                <div> <Link to="/login" className='hover:text-white'> Already have an account? </Link> </div>
            </div>
        </>
    );
};

export default SignUpPage;

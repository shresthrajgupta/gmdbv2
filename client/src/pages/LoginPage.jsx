import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import logo from "../assets/logo.png";

import { useLoginMutation } from '../redux/slices/async/usersApiSlice';
import { setCredentials } from '../redux/slices/sync/authSlice';

const LoginPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isError, setIsError] = useState(false);

    const dispatch = useDispatch();

    const [login, { isLoading: loginLoading }] = useLoginMutation();

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if (userInfo) {
            navigate('/home');
        }
    }, [navigate, userInfo]);

    const validateForm = () => {
        const newErrors = {};
        const { email, password } = formData;

        if (!email || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid Email or Password';
        if (!password || password.length < 5 || password.length > 15) newErrors.password = 'Invalid Email or Password';

        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsError(false);

        if (validateForm()) {
            try {
                const res = await login({ email: formData.email, password: formData.password }).unwrap();
                dispatch(setCredentials({ ...res }));
                navigate("/home");
            } catch (err) {
                toast.error(err?.data?.message);
            }
        } else {
            setIsError(true);
            toast.error("Invalid Email or Password");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="flex flex-col items-center px-6">
                <img src={logo} alt='Logo' className="w-32" />
                <p className='text-xl md:text-2xl'>Log in to GMDB</p>
            </div>

            <div className="p-6 w-full max-w-sm">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block">Email:</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${isError ? 'border-red-500' : 'border-white'} focus:border-blue-500 bg-neutral-900`} placeholder="xyz@email.com" required />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block">Password:</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${isError ? 'border-red-500' : 'border-white'} focus:border-blue-500 bg-neutral-900`} placeholder="p@sswOrd" required />
                    </div>

                    <button type="submit" disabled={loginLoading} className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 ${loginLoading ? 'opacity-50 cursor-not-allowed' : ''}`}> Log In </button>
                </form>
            </div>

            <div> <Link to="/forgot_password" className='hover:text-white'> Forgot Password? </Link> </div>
            <div> <Link to="/signup" className='hover:text-white'> Don't have an account? </Link> </div>
        </div>
    )
}

export default LoginPage;
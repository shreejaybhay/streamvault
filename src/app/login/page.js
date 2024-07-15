"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const router = useRouter();
    const [data, setData] = useState({
        email: '',
        password: ''
    });

    const doLogin = async (e) => {
        e.preventDefault();

        if (data.email.trim() === '' || data.password.trim() === '') {
            toast.info("Please fill in both email and password fields.", {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error("Incorrect email or password. Please check your credentials.", {
                        position: "bottom-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                } else {
                    toast.error("Error logging in. Please try again later.", {
                        position: "bottom-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                }
                return;
            }

            const result = await response.json();
            toast.success("Login Successful!", {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            router.push('/profile');
        } catch (error) {
            console.error("Login Error:", error);
            toast.error("Invalid credentials", {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-68px)] bg-base-300">
            <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-base-200">
                <h2 className="mb-6 text-2xl font-bold text-base-content">Login</h2>
                <form onSubmit={doLogin}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-bold text-base-content" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="w-full px-3 py-2 leading-tight border border-gray-700 rounded shadow appearance-none bg-base-300 text-base-content focus:outline-none focus:shadow-outline"
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={data.email}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-bold text-base-content" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="w-full px-3 py-2 mb-3 leading-tight border border-gray-700 rounded shadow appearance-none bg-base-300 text-base-content focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="******************"
                            value={data.password}
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col items-center w-full gap-2">
                        <button
                            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Sign In
                        </button>
                        <p>Don't Have An Account? <a href="/signup" className='text-blue-500'>Sign Up</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;

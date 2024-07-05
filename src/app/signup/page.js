"use client"
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css'; // Ensure you have this imported to use Toast

const SignUpPage = () => {
  const router = useRouter();
  const [data, setData] = useState({
    username: '',
    email: '',
    password: '',
    profileURL: "https://i.postimg.cc/WzZPrDT4/default-avatar-icon-of-social-media-user-vector.jpg"
  });

  const doSignup = async (e) => {
    e.preventDefault();

    if (data.username.trim() === "" || data.username === null) {
      toast.warning("Please enter a username", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    } else if (data.email.trim() === "" || data.email === null) {
      toast.warning("Please enter an email", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    } else if (data.password.trim() === "" || data.password === null) {
      toast.warning("Please enter a password", {
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
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Signup failed');
      }

      toast.success("User is registered !!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setData({
        username: '',
        email: '',
        password: '',
        avatar: "https://i.postimg.cc/WzZPrDT4/default-avatar-icon-of-social-media-user-vector.jpg"
      });

      router.push('/login');
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error(error.message || "Signup Error !!", {
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
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)] bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-white">Sign Up</h2>
        <form onSubmit={doSignup}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-300" htmlFor="username">
              Username
            </label>
            <input
              className="w-full px-3 py-2 leading-tight text-gray-200 bg-gray-900 border border-gray-700 rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              value={data.username}
              onChange={(e) => setData({ ...data, username: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-300" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-3 py-2 leading-tight text-gray-200 bg-gray-900 border border-gray-700 rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-bold text-gray-300" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-3 py-2 mb-3 leading-tight text-gray-200 bg-gray-900 border border-gray-700 rounded shadow appearance-none focus:outline-none focus:shadow-outline"
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
              Sign Up
            </button>
            <p>Already have an account? <a href="/login" className='text-blue-500'>Login here!</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;

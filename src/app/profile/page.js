/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import { toast } from 'react-toastify';

const Profile = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/currentUser', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUser(data); // Assuming response contains the user object directly
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                router.push('/login'); // Redirect to login if there's an error
            }
        };
        fetchUserData();
    }, [router]);

    const doLogout = async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to log out');
            }

            router.push('/login');
            toast.success('User logged out');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!user) return <Loading />;

    return (
        <div>
            <Head>
                <title>Profile : Work Manager</title>
            </Head>
            <section className="flex items-center justify-center h-[calc(100vh-68px)] bg-base-200">
                <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-base-100">
                    <h2 className="mb-6 text-3xl font-bold text-center text-base-content">User Profile</h2>
                    <div className="mb-4">
                        <img src={user.profileURL || '/default-profile.png'} alt="Profile Picture" className="object-cover w-24 h-24 mx-auto mb-4 rounded-full" />
                        <h3 className="text-2xl text-center text-base-content">{user.username}</h3>
                        <p className="text-center text-gray-400">{user.email}</p>
                        <p className="mt-4 text-center text-gray-300">{user.about}</p>
                    </div>
                    <button
                        onClick={() => router.push(`/editprofile/${user._id}`)}
                        className="w-full px-4 py-2 mt-4 transition duration-300 rounded text-base-content bg-base-200"
                    >
                        Edit Profile
                    </button>
                    <button
                        onClick={doLogout}
                        className="w-full px-4 py-2 mt-4 transition duration-300 rounded text-base-content bg-base-300 "
                    >
                        Logout
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Profile;

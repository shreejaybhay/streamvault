"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const EditProfile = ({ id, username, profileURL }) => {
  const [newUsername, setNewUsername] = useState(username);
  const [newPassword, setNewPassword] = useState("");
  const [newProfileURL, setNewProfileURL] = useState(profileURL);
  const [editField, setEditField] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();

  const handleEditClick = (field) => {
    setEditField(field);
  };

  const handleSubmit = async (e, field) => {
    e.preventDefault();

    if (field === "password" && newPassword.length <= 7) {
      toast.error("Password must be more than 8 characters.");
      return;
    }

    const updateData = {
      [field]:
        field === "profileURL"
          ? newProfileURL
          : field === "password"
          ? newPassword
          : newUsername,
    };

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error(`Failed to update ${field}`);
      }

      console.log(`${field} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setErrorMessage(`Error updating ${field}: ${error.message}`);
    } finally {
      setEditField(null);
    }
  };

  const handleCloseEdit = () => {
    setEditField(null);
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      console.log("Account deleted successfully");

      // Call the logout API
      const logoutRes = await fetch(`/api/logout`, {
        method: "POST",
      });

      if (!logoutRes.ok) {
        throw new Error("Failed to logout after account deletion");
      }

      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setErrorMessage(`Error deleting account: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-center text-white">
          Edit Profile
        </h2>

        {errorMessage && (
          <div className="mb-4 text-sm text-red-500">{errorMessage}</div>
        )}

        <div className="mb-6">
          <label className="block mb-2 text-sm font-bold text-gray-300">
            Profile Pic:
          </label>
          <div className="flex items-center justify-between">
            {newProfileURL && (
              <img
                className="w-12 h-12 rounded-full"
                src={newProfileURL}
                alt="Profile Pic"
              />
            )}
            <button
              className="px-4 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
              onClick={() => handleEditClick("profileURL")}
            >
              Edit
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-bold text-gray-300">
            Username:
          </label>
          <div className="flex items-center justify-between">
            <span className="mr-2">{newUsername}</span>
            <button
              className="px-4 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
              onClick={() => handleEditClick("username")}
            >
              Edit
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-bold text-gray-300">
            Password:
          </label>
          <div className="flex items-center justify-between">
            <p>*********</p>
            <button
              className="px-4 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
              onClick={() => handleEditClick("password")}
            >
              Edit
            </button>
          </div>
        </div>

        <div className="mb-6">
          <button
            className="w-full px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700 focus:outline-none focus:shadow-outline"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>

        {editField && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
              <h2 className="mb-6 text-2xl font-bold text-center text-white">
                Edit{" "}
                {editField === "username"
                  ? "Username"
                  : editField === "password"
                  ? "Password"
                  : "Profile Pic"}
              </h2>
              <form onSubmit={(e) => handleSubmit(e, editField)}>
                {editField === "username" && (
                  <div className="mb-4">
                    <label
                      className="block mb-2 text-sm font-bold text-gray-300"
                      htmlFor="newUsername"
                    >
                      New Username
                    </label>
                    <input
                      className="w-full px-3 py-2 leading-tight text-gray-200 bg-gray-900 border border-gray-700 rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                      id="newUsername"
                      type="text"
                      placeholder="New Username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                    />
                  </div>
                )}

                {editField === "password" && (
                  <div className="mb-4">
                    <label
                      className="block mb-2 text-sm font-bold text-gray-300"
                      htmlFor="newPassword"
                    >
                      New Password
                    </label>
                    <input
                      className="w-full px-3 py-2 leading-tight text-gray-200 bg-gray-900 border border-gray-700 rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                      id="newPassword"
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                )}

                {editField === "profileURL" && (
                  <div className="mb-4">
                    <label
                      className="block mb-2 text-sm font-bold text-gray-300"
                      htmlFor="newProfileURL"
                    >
                      New Profile Pic URL
                    </label>
                    <input
                      className="w-full px-3 py-2 leading-tight text-gray-200 bg-gray-900 border border-gray-700 rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                      id="newProfileURL"
                      type="text"
                      placeholder="New Profile Pic URL"
                      value={newProfileURL}
                      onChange={(e) => setNewProfileURL(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center justify-center">
                  <button
                    className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                    type="submit"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
              <button
                className="absolute top-0 right-0 p-2 m-4 text-gray-300 hover:text-white focus:outline-none"
                onClick={handleCloseEdit}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;

import EditProfile from "@/components/EditProfile";

const getProfileById = async (userId) => {
  try {
    const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const user = await res.json();
    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

const EditTopic = async ({ params }) => {
  const { id } = params;
  const user = await getProfileById(id);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-center text-white">
            User profile not found
          </h2>
          <p className="text-center text-gray-300">
            There was an error fetching the profile. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const { username, password, profileURL } = user;

  return (
    <EditProfile
      id={id}
      username={username}
      password={password}
      profileURL={profileURL}
    />
  );
};

export default EditTopic;

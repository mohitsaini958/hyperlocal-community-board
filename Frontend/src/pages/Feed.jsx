import { useEffect, useState } from "react";
import api from "../api/axios";

const Feed = () => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] =
        useState(true);
    const [error, setError] =
        useState("");

    useEffect(() => {

        const getProfile =
            async () => {

                try {

                    const response =
                        await api.get(
                            "/auth/me"
                        );

                    setUser(
                        response.data.user
                    );

                } catch (error) {
                  console.log(error);
                    setError(
                        error.response?.data
                            ?.message ||
                        "Failed to load profile"
                    );

                } finally {

                    setLoading(false);
                }
            };

        getProfile();

    }, []);

    if (loading) {
        return (
            <h1 className="text-center mt-10">
                Loading...
            </h1>
        );
    }

    if (error) {
        return (
            <h1 className="text-center mt-10 text-red-500">
                {error}
            </h1>
        );
    }

    return (
        <div className="p-10">

            <h1 className="text-3xl font-bold">
                Feed Page
            </h1>

            <div className="mt-6 border p-4 rounded">

                <h2>
                    Username:
                    {" "}
                    {user?.username}
                </h2>

                <h2>
                    Email:
                    {" "}
                    {user?.email}
                </h2>

                <h2>
                    User ID:
                    {" "}
                    {user?._id}
                </h2>

            </div>

        </div>
    );
};

export default Feed;
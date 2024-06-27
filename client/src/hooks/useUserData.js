import { useEffect, useState } from "react";

const SERVER_URL = process.env.REACT_APP_API_URL;

/**
 * Custom hook to fetch user data from the server.
 * 
 * @returns {Object} An object containing the user data and loading state.
 *                  - user: The user object fetched from the server.
 *                  - loading: Boolean indicating whether data is being fetched.
 */
function useUserData() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await fetch(`${SERVER_URL}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                setUser(await response.json())
            } catch (error) {
                // TODO: Handle error if needed
            } finally {
                setLoading(false)
            }
        }

        fetchUserData();
    }, [])

    return { user, loading }
}

export default useUserData
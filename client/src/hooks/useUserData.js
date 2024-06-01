import { useEffect, useState } from "react";

const SERVER_URL = process.env.REACT_APP_API_URL;

/**
 * Custom hook to fetch user data from the server.
 *
 * @returns {Object|null} The user data or null if data fetching is pending or failed.
 */
function useUserData() {
    const [user, setUser] = useState(null);

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
                //console.error("Error fetching user data:", error)
            }
        }

        fetchUserData();
    }, [])

    return user
}

export default useUserData
import { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';

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
                const token = localStorage.getItem('token')
                const decoded = jwtDecode(token)
                const userId = decoded.id
                
                const response = await fetch(`${SERVER_URL}/getUserData`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId })
                });

                const data = await response.json()
                setUser(data)
            } catch (error) {
                // console.log("ERROR: ", error)
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
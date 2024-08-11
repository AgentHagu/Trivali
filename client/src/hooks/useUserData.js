import { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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

    const navigate = useNavigate()

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

                // If user was found, setUser
                if (response.ok) {
                    const data = await response.json()
                    setUser(data)

                // Otherwise, no valid user was found. Redirect to login page and remove token
                } else {
                    toast.dismiss()
                    toast.error("Cannot find user! Redirecting to login page...", {
                        position: "top-center",
                        autoClose: 3000
                    })
                    localStorage.removeItem('token')
                    navigate('/login')
                }
            } catch (error) {
                // console.log("ERROR: ", error)
                // TODO: Handle error if needed
            } finally {
                setLoading(false)
            }
        }

        fetchUserData();
    }, [navigate])

    return { user, loading }
}

export default useUserData
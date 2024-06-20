import { useEffect, useState } from "react";

const SERVER_URL = process.env.REACT_APP_API_URL;

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
                //console.log(response)
                setUser(await response.json())
            } catch (error) {
                // TODO: Handle error if needed
                //console.error("Error fetching user data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserData();
    }, [])

    return { user, loading }
}

export default useUserData
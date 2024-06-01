import { useEffect, useState } from "react";

function useUserData() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await fetch("http://localhost:3001/", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
    
                setUser(await response.json())
            } catch (error) {
                
                //console.error("Error fetching user data:", error)
            }
        }
    
        fetchUserData();
    }, [])

    return user
}

export default useUserData


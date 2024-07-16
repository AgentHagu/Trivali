import { createContext, useContext, useEffect, useState } from "react";

const SERVER_URL = process.env.REACT_APP_API_URL;
const ApiKeysContext = createContext()

export default function ApiKeysProvider({ children }) {
    const [apiKeys, setApiKeys] = useState(null);

    useEffect(() => {
        async function fetchApiKeys() {
            try {
                const response = await fetch(`${SERVER_URL}/api`, {
                    method: 'GET',
                    credentials: 'include'
                })

                const allApiKeys = await response.json()
                // console.log(await response.json());
                setApiKeys(allApiKeys)
            } catch (error) {
                console.error("Error fetching API key: ", error)
            }
        }

        fetchApiKeys();
    }, [])

    return <ApiKeysContext.Provider value={apiKeys}>
        {children}
    </ApiKeysContext.Provider>
}

export const useApiKeys = () => useContext(ApiKeysContext);
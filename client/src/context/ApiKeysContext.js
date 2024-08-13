import { createContext, useContext, useEffect, useState } from "react";

const SERVER_URL = process.env.REACT_APP_API_URL;

const ApiKeysContext = createContext();

/**
 * Provider component to fetch and provide API keys.
 *
 * This component fetches API keys from the server when it mounts
 * and provides them to its children through the `ApiKeysContext`.
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider.
 * @returns {React.ReactElement} The rendered `ApiKeysProvider` component.
 */
export default function ApiKeysProvider({ children }) {
    const [apiKeys, setApiKeys] = useState(null);

    useEffect(() => {
        /**
         * Fetches API keys from the server and updates the state.
         *
         * @async
         * @function
         * @returns {Promise<void>} A promise that resolves when the API keys are fetched and state is updated.
         */
        async function fetchApiKeys() {
            try {
                const response = await fetch(`${SERVER_URL}/api`, {
                    method: 'GET',
                    credentials: 'include'
                })

                const allApiKeys = await response.json()
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
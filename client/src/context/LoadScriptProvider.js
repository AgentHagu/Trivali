import { createContext, useContext } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { useApiKeys } from './ApiKeysContext';

// List of libraries to load with the Google Maps API
const libraries = ['places'];

// Context for managing Google Maps script loading
const LoadScriptContext = createContext();

/**
 * Provider component to load the Google Maps script and manage its state.
 *
 * This component uses the `useLoadScript` hook from `@react-google-maps/api` to
 * load the Google Maps JavaScript API and provides its loading state through the
 * `LoadScriptContext`.
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider.
 * @returns {React.ReactElement} The rendered `LoadScriptProvider` component.
 */
export default function LoadScriptProvider({ children }) {
  const { googleMapsApiKey } = useApiKeys()
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey,
    libraries,
  });

  if (loadError) {
    return <div>Error loading Google Maps script</div>;
  }

  return (
    <LoadScriptContext.Provider value={{ isLoaded }}>
      {isLoaded ? children : <div className="container mt-3 d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>}
    </LoadScriptContext.Provider>
  );
};

export const useLoadScriptContext = () => useContext(LoadScriptContext);
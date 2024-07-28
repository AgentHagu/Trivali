import { createContext, useContext } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { useApiKeys } from './ApiKeysContext';

const libraries = ['places'];

const LoadScriptContext = createContext();

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
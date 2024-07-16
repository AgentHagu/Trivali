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
      {isLoaded ? children : <div>Loading...</div>}
    </LoadScriptContext.Provider>
  );
};

export const useLoadScriptContext = () => useContext(LoadScriptContext);
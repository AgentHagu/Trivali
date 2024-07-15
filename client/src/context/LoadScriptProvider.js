import { createContext, useContext } from 'react';
import { useLoadScript } from '@react-google-maps/api';

const libraries = ['places'];

const LoadScriptContext = createContext();

export default function LoadScriptProvider({ children }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
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
import React, { createContext, useContext, useState, useRef } from 'react';

// Create a context
const ClientContext = createContext();

// Export a custom hook to use the ClientContext
export const useClients = () => useContext(ClientContext);

// Provider component
export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState({});

  const addClient = (socketId, userName) => {
    setClients(prevClients => ({
      ...prevClients,
      [socketId]: {
        userName,
        videoStatus: useState(false),
        videoRef: useRef(null),
      },
    }));
  };

  const updateClient = (socketId, updatedInfo) => {
    setClients(prevClients => ({
      ...prevClients,
      [socketId]: {
        ...prevClients[socketId],
        ...updatedInfo,
      },
    }));
  };

  return (
    <ClientContext.Provider value={{ clients, updateClient, addClient }}>
      {children}
    </ClientContext.Provider>
  );
};

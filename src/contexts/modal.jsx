import React, { createContext, useContext, useState, useMemo } from "react";

// Create the context
const ModalContext = createContext();

// Modal provider component
export const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState({recipes: false, recipe: false});
  const [search, setSearch] = useState('');
  const [node, setNode] = useState();

  const openModal = (name) => {
    console.log('openModal');
    setIsOpen({...isOpen, [name]: true});
  }
  const closeModal = () => setIsOpen({recipes: false, recipe: false});

  const contextValue = useMemo(() => {
    return { 
      isOpen,
      openModal,
      closeModal,
      search,
      setSearch,
      node,
      setNode
    };
  }, [isOpen, search, node]);

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
};

// Custom hook to use modal context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

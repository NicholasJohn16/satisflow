import React, { createContext, useCallback, useContext, useState, useMemo } from "react";

// Create the context
const ModalContext = createContext();

// Modal provider component
export const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState({
    recipes: false,
    recipe: false,
    resourceNode: false,
    powerPlantNode: false,
    connectionNodeType: false,
  });
  const [search, setSearch] = useState('');
  const [recipeFilter, setRecipeFilter] = useState(null);
  const [recipePosition, setRecipePosition] = useState(null);
  const [recipeConnection, setRecipeConnection] = useState(null);
  const [connectionDropOptions, setConnectionDropOptions] = useState(null);
  const [resourceNodeIsNew, setResourceNodeIsNew] = useState(false);
  const [powerPlantNodeIsNew, setPowerPlantNodeIsNew] = useState(false);
  const [node, setNode] = useState();

  const openModal = useCallback((name, options = {}) => {
    if (name === 'recipes') {
      setRecipeFilter(options.recipeFilter ?? null);
      setRecipePosition(options.position ?? null);
      setRecipeConnection(options.connection ?? null);
      setSearch(options.search ?? '');
    }
    if (name === 'connectionNodeType') {
      setConnectionDropOptions(options);
    }
    if (name === 'resourceNode') {
      setResourceNodeIsNew(options.isNew ?? false);
    }
    if (name === 'powerPlantNode') {
      setPowerPlantNodeIsNew(options.isNew ?? false);
    }
    setIsOpen({
      recipes: false,
      recipe: false,
      resourceNode: false,
      powerPlantNode: false,
      connectionNodeType: false,
      [name]: true,
    });
  }, []);
  const closeModal = useCallback(() => {
    setIsOpen({
      recipes: false,
      recipe: false,
      resourceNode: false,
      powerPlantNode: false,
      connectionNodeType: false,
    });
    setRecipeFilter(null);
    setRecipePosition(null);
    setRecipeConnection(null);
    setConnectionDropOptions(null);
    setResourceNodeIsNew(false);
    setPowerPlantNodeIsNew(false);
  }, []);

  const contextValue = useMemo(() => {
    return { 
      isOpen,
      openModal,
      closeModal,
      search,
      setSearch,
      recipeFilter,
      recipePosition,
      recipeConnection,
      connectionDropOptions,
      resourceNodeIsNew,
      powerPlantNodeIsNew,
      node,
      setNode
    };
  }, [closeModal, connectionDropOptions, isOpen, node, openModal, powerPlantNodeIsNew, recipeConnection, recipeFilter, recipePosition, resourceNodeIsNew, search]);

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

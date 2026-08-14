import React, { createContext, useContext, useMemo } from "react";
import data from '../data.json';
const { items, recipes, constructors } = data;

const DataContext = createContext();

export const DataProvider = ({children}) => {

    const getItem = (itemKey) => items[itemKey];

    const contextValue = useMemo(() => {
        return {
            ...data, 
            getItem
        };
    }, []);

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    )
}

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within a DataProvider");
    return context;
}
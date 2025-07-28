"use client"

import React, { createContext, useContext, useState } from 'react';

interface ProductID {
    productID: string | null
    setProductID: (id: string) => void;
}

const ProductDataContext = createContext<ProductID | undefined>(undefined);

export function ProductDataProvider ({ children }: { children: React.ReactNode }) {
    const [productID, setProductID] = useState<string | null>(null);

    return (
        <ProductDataContext.Provider value={{ productID, setProductID }}>
          {children}
        </ProductDataContext.Provider>
    );    
}

export const useProductDataContext = () => {
    const ProductContext = useContext(ProductDataContext);
    if (!ProductContext) throw new Error("No Product Data Available");
    return ProductContext;
};
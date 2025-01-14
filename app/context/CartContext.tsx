"use client";

import React, { createContext, useState, useContext } from "react";

type NumberContextType = {
  number: number;
  setNumber: React.Dispatch<React.SetStateAction<number>>;
};

const NumberContext = createContext<NumberContextType | undefined>(undefined);

export function NumberProvider({ children }: { children: React.ReactNode }) {
  const [number, setNumber] = useState<number>(0);

  return (
    <NumberContext.Provider value={{ number, setNumber }}>
      {children}
    </NumberContext.Provider>
  );
}

export function useNumber() {
  const context = useContext(NumberContext);
  if (context === undefined) {
    throw new Error("useNumber must be used within a NumberProvider");
  }
  return context;
}

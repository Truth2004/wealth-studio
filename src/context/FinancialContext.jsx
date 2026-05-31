import { createContext, useState, useContext } from 'react';

const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
  const [financials, setFinancials] = useState({
    username: '',
    grossSalary: 0,
    fixedCosts: 0,
    monthlyDebt: 0,
    netIncome: 0,
    activeTrack: null,
    
    
    currentSavings: 0,      // Drives Milestone 1 (Emergency Fund)
    currentRA: 0,           // Drives Milestone 2 (Tax Optimization)
    targetHomePrice: 0,     // Drives Milestone 4 (Property Deposit)
  });

  const updateFinancials = (newData) => {
    setFinancials((prev) => ({ ...prev, ...newData }));
  };

  return (
    <FinancialContext.Provider value={{ financials, updateFinancials }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancials = () => {
  return useContext(FinancialContext);
};
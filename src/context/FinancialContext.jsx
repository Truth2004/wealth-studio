import { createContext, useState, useContext, useEffect } from 'react';

const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
  // Initialize state from localStorage (Lazy Initialization)
  const [financials, setFinancials] = useState(() => {
    const savedData = localStorage.getItem('nextgen_financials');
    
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error("Failed to parse financials from local storage:", error);
      }
    }
    
    return {
      username: '',
      grossSalary: 0,
      
      // Breakdown Categories
      housingCosts: 0,
      mobilityCosts: 0,
      lifestyleCosts: 0,
      
      // Debt Tracking
      monthlyDebt: 0, 
      totalDebt: 0,   
      
      netIncome: 0,
      activeTrack: null,
      
      // Advanced Goals / Current Balances
      currentSavings: 0,      
      currentRA: 0,           
      targetHomePrice: 0,     
      currentTFSA: 0,        // New: Total accrued lifetime tax-free balance
      liquidInvestments: 0,  // New: Non-retirement investment capital (ETFs/Brokerage)
    };
  });

  // Automatically sync to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('nextgen_financials', JSON.stringify(financials));
  }, [financials]);

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
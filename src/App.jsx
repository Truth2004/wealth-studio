import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { FinancialProvider } from './context/FinancialContext'; 
import LoginPage from './pages/LoginPage';
import MoneySnapshot from './pages/MoneySnapshot';
import StrategyTracks from './pages/StrategyTracks';
import DebtFreeStarter from './pages/DebtFreeStarter'; 
import PropertySeeker from './pages/PropertySeeker';
import GlobalWealthBuilder from './pages/GlobalWealthBuilder';
import SimulationLab from './pages/SimulationLab';
import CarVsInvestModule from './pages/CarVsInvestModule';
import RentVsBuyModule from './pages/RentVsBuyModule';
import TaxFreeBoosterModule from './pages/TaxFreeBoosterModule';
import Support from './pages/Support';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop'; // Newly added global scroll utility
import './App.css';

// Scroll to top every time a new page is loaded
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Find the specific scrolling layout container
    const mainContent = document.querySelector('.main-content');
    
    // Tell it to scroll to the top rather than the window object
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
  }, [pathname]); // Fires every time the URL path changes[cite: 16]
  
  return null;
};

// Global Layout Frame for Authenticated Views
const MainLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet /> 
        <Footer />
        {/* Rendered globally across all layout views on the platform */}
        <BackToTop />
      </main>
    </div>
  );
};

function App() {
  return (
    <FinancialProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Isolated Login Gateway */}
          <Route path="/" element={<LoginPage />} />

          {/* Core Dashboard Ecosystem Framework */}
          <Route element={<MainLayout />}>
            <Route path="/money-snapshot" element={<MoneySnapshot />} />
            
            {/* Strategy Tracks Routes */}
            <Route path="/strategy-tracks" element={<StrategyTracks />} />
            <Route path="/strategy-tracks/debt-free" element={<DebtFreeStarter />} /> 
            <Route path="/strategy-tracks/property-seeker" element={<PropertySeeker />} />
            <Route path="/strategy-tracks/global-investor" element={<GlobalWealthBuilder />} />
            
            {/* Simulation Lab Routes */}
            <Route path="/simulation-lab" element={<SimulationLab />} />
            <Route path="/simulation-lab/car-vs-invest" element={<CarVsInvestModule />} />
            <Route path="/simulation-lab/rent-vs-buy" element={<RentVsBuyModule />} />
            <Route path="/simulation-lab/tax-free-booster" element={<TaxFreeBoosterModule />} />
            
            {/* Support Layer */}
            <Route path="/support" element={<Support />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FinancialProvider>
  );
}

export default App;
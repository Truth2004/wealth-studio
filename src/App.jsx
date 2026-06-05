import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { FinancialProvider } from './context/FinancialContext'; 
import LoginPage from './pages/LoginPage';
import MoneySnapshot from './pages/MoneySnapshot';
import StrategyTracks from './pages/StrategyTracks';
import ActiveTrackView from './pages/ActiveTrackView'; 
import SimulationLab from './pages/SimulationLab';
import CarVsInvestModule from './pages/CarVsInvestModule';
import RentVsBuyModule from './pages/RentVsBuyModule';
import TaxFreeBoosterModule from './pages/TaxFreeBoosterModule';
import Support from './pages/Support';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import './App.css';

// Scroll to top everytime I load a new page
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // 1. Find the specific scrolling container
    const mainContent = document.querySelector('.main-content');
    
    // 2. Tell IT to scroll to the top, not the window!
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' }); // smooth lets it slide up instead of snapping to the top. I seem to like it more.
    }
  }, [pathname]); // This triggers every time the URL path changes
  
  return null;
};

const MainLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet /> 
        <Footer />
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
          <Route path="/" element={<LoginPage />} />

          <Route element={<MainLayout />}>
            <Route path="/money-snapshot" element={<MoneySnapshot />} />
            <Route path="/strategy-tracks" element={<StrategyTracks />} />
            <Route path="/strategy-tracks/:trackId" element={<ActiveTrackView />} />
            <Route path="/simulation-lab" element={<SimulationLab />} />
            <Route path="/simulation-lab/car-vs-invest" element={<CarVsInvestModule />} />
            <Route path="/simulation-lab/rent-vs-buy" element={<RentVsBuyModule />} />
            <Route path="/simulation-lab/tax-free-booster" element={<TaxFreeBoosterModule />} />
            <Route path="/support" element={<Support />} />
            
          </Route>
        </Routes>
      </BrowserRouter>
    </FinancialProvider>
  );
}

export default App;
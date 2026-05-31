import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Home, Globe, CircleArrowRight, CircleX } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useFinancials } from '../context/FinancialContext'; 
import Explainer from '../components/Explainer';
import '../styles/StrategyTracks.css';

const StrategyTracks = () => {
  const navigate = useNavigate();
  const { updateFinancials } = useFinancials();


  const tracksData = [
    {
      id: 'debt-free',
      title: 'The Debt Free Starter',
      icon: <ShieldCheck className="track-main-icon" />,
      description: 'Ideal for young professionals who want to eliminate high-interest debt and build a rock-solid foundation before upgrading their lifestyle.',
      prioritizes: [
        <>Paying off <Explainer term="high-interest debt" explanation="Debts like credit cards or personal loans that charge a high interest rate, causing the owed amount to compound and grow rapidly if not paid off." /></>,
        <>Building a <Explainer term="1-month emergency fund" explanation="Cash set aside in a highly accessible account specifically to cover unexpected expenses, like medical bills or car repairs, equal to one month of your essential living costs." /></>
      ],
      avoids: [
        'Taking on new debt (store accounts, etc.)',
        'Upgrading lifestyle with unsettled issues'
      ],
      isActive: true
    },
    {
      id: 'property-seeker',
      title: 'The Property Seeker',
      icon: <Home className="track-main-icon" />,
      description: 'Ideal for stable earners looking to buy their first apartment or upgrade to a family home with more room over the next 5 years.',
      prioritizes: [
        <>Saving a <Explainer term="10% cash deposit" explanation="An upfront cash payment made when buying a home. In South Africa, providing a deposit significantly improves your chances of bond approval and secures a lower interest rate." /></>,
        <>Keeping your <Explainer term="credit score" explanation="A three-digit number representing your financial reliability to lenders. A pristine score is the single most important factor when banks calculate your mortgage interest rate." /> pristine</>
      ],
      avoids: [
        'Moving cash into risky, locked-in investments'
      ],
      isActive: false
    },
    {
      id: 'global-investor',
      title: 'The Aggressive Global Investor',
      icon: <Globe className="track-main-icon" />,
      description: 'Ideal for high earners who want to rent, stay mobile, and aggressively build wealth in the global stock market.',
      prioritizes: [
        <>Maxing out the <Explainer term="R36,000 TFSA limit" explanation="Tax-Free Savings Account. You can contribute up to R36,000 per year in SA. All capital growth, dividends, and withdrawals are 100% exempt from SARS." /></>,
        <>Moving money <Explainer term="offshore" explanation="Investing your capital in international markets (like the US S&P 500) to protect your wealth from local currency depreciation and economic instability." /></>
      ],
      avoids: [
        <>Buying property or taking on <Explainer term="bond debt" explanation="Also known as a mortgage. This is a massive, long-term loan (usually 20-30 years) provided by a bank specifically to purchase real estate." /></>
      ],
      isActive: false
    }
  ];

  const handleSelectTrack = (trackId) => {
    updateFinancials({ activeTrack: trackId });
    navigate(`/strategy-tracks/${trackId}`);
  };

  return (
    <>
      <TopBar title="STRATEGY TRACKS" icon={<TrendingUp className="header-icon" />} />
      <div className="page-content">
        
        <div className="tracks-header-container">
          <div className="tracks-subtitle">Your very own virtual financial sandbox</div>
          <h1 className="tracks-title">
            Choose your <span className="highlight-gold">5-year focus</span>. You can change at <span className="highlight-gold">any time.</span>
          </h1>
          <p className="tracks-desc">
            Step into a risk-free environment to test-drive your biggest financial decisions. The Strategy tracks use real-world data to instantly project how the choices you make today will shape your actual net worth over the next five years.
          </p>
        </div>

        <div className="tracks-grid">
          {tracksData.map((track) => (
            <div className="track-card" key={track.id}>
              
              <div className="track-icon-wrapper">
                {track.icon}
              </div>
              
              <h3>{track.title}</h3>
              
              <p className="track-desc">{track.description}</p>
              
              {/*Prioritizes section*/}
              <div className="track-section-label push-down">What it prioritizes</div>
              <ul className="track-list">
                {track.prioritizes.map((item, index) => (
                  <li key={index}>
                    <CircleArrowRight className="list-icon-green" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Avoids Section (Red Circular X's) */}
              <div className="track-section-label">What it avoids</div>
              <ul className="track-list last">
                {track.avoids.map((item, index) => (
                  <li key={index}>
                    <CircleX className="list-icon-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button 
                className="select-button" 
                onClick={() => handleSelectTrack(track.id)}
                disabled={!track.isActive}
              >
                {track.isActive ? 'Select this track' : 'Still in development'}
              </button>
            </div>
          ))}
        </div>

      </div>
    </>
  );
};

export default StrategyTracks;
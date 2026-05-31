import { useNavigate } from 'react-router-dom';
import { FlaskConical, Home, CarFront, Receipt, CheckCircle2 } from 'lucide-react';
import TopBar from '../components/TopBar';
import Explainer from '../components/Explainer';
import '../styles/SimulationLab.css';

const SimulationLab = () => {
  const navigate = useNavigate();

  const simulationModules = [
    {
      id: 'rent-vs-buy',
      title: 'Renting vs Buying in JHB',
      icon: <Home className="module-icon" />,
      description: <>Analyze the <Explainer term="opportunity cost" explanation="The potential financial benefit you lose out on when choosing one option over another. E.g., The investment returns you lose by tying your cash up in a house deposit." /> of homeownership in the Johannesburg market including rates, taxes, and maintenance vs. rental equity investment.</>,
      learnItems: [
        <>Projected <Explainer term="Equity" explanation="The portion of the property's value that you actually 'own' outright. Calculated as the current market value of the home minus the remaining balance on your bond." /> at Year 5</>,
        'Hidden Costs of JHB Ownership'
      ],
      inputs: ['MONTHLY RENT', 'PURCHASE PRICE', 'DEPOSIT'],
      isActive: false // Set to false
    },
    {
      id: 'car-vs-invest',
      title: 'Luxury Car vs Invest the Difference',
      icon: <CarFront className="module-icon" />,
      description: <>A direct showdown: The 'Golf R' or 'BMW' depreciation curve vs. the historical compounding of the <Explainer term="S&P 500 Index" explanation="A stock market index tracking the stock performance of 500 of the largest companies listed on stock exchanges in the United States. It is a standard benchmark for global wealth growth." /> over the same period.</>,
      learnItems: [
        <>The Real Cost of <Explainer term="Depreciation" explanation="The drop in an asset's value over time. Cars are highly depreciating assets, often losing 20-30% of their value in the first year alone." /></>,
        'Compounding Opportunity Loss'
      ],
      inputs: ['VEHICLE PRICE', 'TERM', 'INDEX FUND'],
      isActive: true // Set to true!
    },
    {
      id: 'tax-free-booster',
      title: 'Tax-Free Account Booster',
      icon: <Receipt className="module-icon" />,
      description: 'Maximize your tax-free growth. Compare a standard savings account against the R36,000 annual limit in an ABSA Tax-Free Savings Account.',
      learnItems: [
        'Total tax savings over 5 years',
        <><Explainer term="Capital gains tax" explanation="A tax placed by SARS on the profit made from the sale of an asset (like stocks or property). Tax-Free Savings Accounts are legally exempt from this tax." /> exemptions</>
      ],
      inputs: ['CONTRIBUTION', 'RETURN RATE', 'TAX BRACKET'],
      isActive: false
    }
  ];

  const handleSelectModule = (moduleId) => {
    navigate(`/simulation-lab/${moduleId}`);
  };

  return (
    <>
      <TopBar title="SIMULATION LAB" icon={<FlaskConical className="header-icon" />} />
      <div className="page-content">
        
        {/* Header section */}
        <div className="sim-header-container">
          <div className="sim-subtitle">Your very own virtual financial sandbox</div>
          <h1 className="sim-title">
            Simulate your <span className="text-gold">choices</span>. Secure your <span className="text-gold">wealth</span>.
          </h1>
          <p className="sim-desc">
            Step into a risk-free environment to test-drive your biggest financial decisions. The Simulation Lab uses real-world data to instantly project how the choices you make today will shape your actual net worth over the next five years.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="sim-grid">
          {simulationModules.map((mod) => (
            <div className="sim-card" key={mod.id}>
              <div className="sim-icon-wrapper">
                {mod.icon}
              </div>
              
              <h3>{mod.title}</h3>
              <p className="sim-card-desc">{mod.description}</p>
              
              {/* What You'll Learn Section (With Green Checkmarks) */}
              <div className="sim-section-label">What You'll Learn</div>
              <ul className="sim-list">
                {mod.learnItems.map((item, index) => (
                  <li key={index}>
                    <CheckCircle2 className="check-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Inputs Needed Section (With Gray Pills) */}
              <div className="sim-section-label">Inputs Needed</div>
              <div className="input-tags-container">
                {mod.inputs.map((input, index) => (
                  <div key={index} className="input-tag">{input}</div>
                ))}
              </div>

              <button 
                className="sim-button" 
                onClick={() => handleSelectModule(mod.id)}
                disabled={!mod.isActive}
              >
                {mod.isActive ? 'Run Simulation' : 'Still in development'}
              </button>
            </div>
          ))}
        </div>

      </div>
    </>
  );
};

export default SimulationLab;
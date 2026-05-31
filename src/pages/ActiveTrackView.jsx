import { Link, useParams } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Star, ArrowRight, Shield, Landmark, Palmtree } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useFinancials } from '../context/FinancialContext'; 
import Explainer from '../components/Explainer'; // <-- Imported the Explainer!
import '../styles/ActiveTrackView.css';

const ActiveTrackView = () => {
  const { trackId } = useParams();
  const { financials } = useFinancials();

  const formatZAR = (amount) => amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // --- MATH VARIABLES ---
  const currentDebtPayment = financials.monthlyDebt || 0;
  const currentDisposable = Math.max(0, (financials.netIncome || 0) - (financials.fixedCosts || 0) - currentDebtPayment);
  const projectedDisposable = currentDisposable + currentDebtPayment;

  const currentSavings = financials.currentSavings || 0; 
  const emergencyFundTarget = (financials.fixedCosts || 0) * 3; 
  const fundProgressPercent = emergencyFundTarget > 0 ? Math.min(100, Math.round((currentSavings / emergencyFundTarget) * 100)) : 0;

  // === DYNAMIC NOTIFICATION LOGIC ===
  const dynamicNotifications = [];

  // Alert 1: Emergency Fund
  if (fundProgressPercent < 100) {
    dynamicNotifications.push({
      title: 'Action Required: Liquidity',
      message: `Your emergency fund is only at ${fundProgressPercent}%. Redirect free cash flow to reach your 3-month target of R ${formatZAR(emergencyFundTarget)}.`
    });
  } else {
    dynamicNotifications.push({
      title: 'Milestone Achieved',
      message: 'Your 3-month emergency fund is fully funded! You are ready to aggressively attack high-interest debt.'
    });
  }

  // Alert 2: Debt-to-Income Warning
  const netIncome = financials.netIncome || 1; // prevent div by 0
  if ((currentDebtPayment / netIncome) > 0.3) {
    dynamicNotifications.push({
      title: 'High Debt Burden',
      message: 'Your monthly debt obligations exceed 30% of your net income. This track is critical for your financial health.'
    });
  }

  // Alert 3: Future Projection Motivation
  if (currentDebtPayment > 0) {
    dynamicNotifications.push({
      title: 'Future Cash Flow Unlock',
      message: `Staying on track and eliminating this debt will permanently unlock an extra R ${formatZAR(currentDebtPayment)} per month.`
    });
  }

  // ==========================================
  // TIMELINE DATA
  // ==========================================
  const milestonesData = [
    {
      id: 1,
      date: "YEAR 1",
      title: "Emergency Fund Build",
      description: (
        <div className="milestone-section">
          <div className="progress-labels">
            <span>R {formatZAR(currentSavings)} / R {formatZAR(emergencyFundTarget)}</span>
            <span className="progress-percentage">{fundProgressPercent}%</span>
          </div>
          <div className="progress-track">
            {/* Width remains inline because it specifically requires JavaScript state injection */}
            <div className="progress-fill" style={{ width: `${fundProgressPercent}%` }}></div>
          </div>
          <span className="progress-subtext">
            3 Months <Explainer term="liquidity buffer" explanation="Cash readily available to cover unexpected expenses without having to sell investments or take on debt." />
          </span>
        </div>
      ),
      status: "active"
    },
    {
      id: 2,
      date: "YEAR 2",
      title: "RA Top-up & SARS Tax Rebate",
      description: (
        <div className="milestone-section">
          <p className="milestone-text-top">Maximizing retirement contributions for 2025</p>
          <span className="feature-badge">
            <span className="feature-icon-box" style={{ display: 'flex', alignItems: 'center' }}>
              <Shield size={16} />
            </span> 
            Optimized Tax
          </span>
        </div>
      ),
      status: "future"
    },
    {
      id: 3,
      date: "YEAR 3",
      title: "First Overseas Holiday",
      description: (
        <div className="milestone-section">
          <p className="milestone-text">Europe vs Bali</p>
          <div className="comparison-grid">
            <div className="comparison-card">
              <div className="comparison-icon"><Landmark size={28} color="#666" /></div>
              <strong className="comparison-title">Europe</strong>
              <span className="comparison-desc">International experience, high value</span>
            </div>
            <div className="comparison-card">
              <div className="comparison-icon"><Palmtree size={28} color="#666" /></div>
              <strong className="comparison-title">Bali</strong>
              <span className="comparison-desc">International experience, high value</span>
            </div>
          </div>
        </div>
      ),
      status: "future"
    },
    {
      id: 4,
      date: "YEAR 4",
      title: "Home Loan Deposit Target",
      description: <p className="milestone-text-top">Goal: 20% down payment on primary residence</p>,
      status: "future"
    },
    {
      id: 5,
      date: "YEAR 5",
      title: "Balanced Portfolio Review",
      description: <p className="milestone-text-top">Transitioning from high-growth to balanced-income</p>,
      status: "future"
    }
  ];

  // ==========================================
  // ABSA SUGGESTIONS DATA
  // ==========================================
  const absaSuggestions = [
    {
      id: 1,
      tag: "FOR YEAR 1 GROWTH",
      title: "ABSA Tax-Free Savings Account",
      description: <>Invest up to R36,000 per year without paying any tax on interest or <Explainer term="capital gains" explanation="A tax placed by SARS on the profit made from the sale of an asset. Tax-Free Savings Accounts are legally exempt from this tax." />.</>,
      cta: "Learn More"
    },
    {
      id: 2,
      tag: "FOR YEAR 2 OPTIMIZATION",
      title: "Absa Retirement Annuity",
      description: <>Minimize your tax liability and maximize <Explainer term="SARS rebates" explanation="A tax deduction provided by the South African Revenue Service. Contributing to an RA legally lowers your taxable income, often resulting in a tax refund." /> while securing your future.</>,
      cta: "Explore RA"
    },
    {
      id: 3,
      tag: "FOR LIFESTYLE MANAGEMENT",
      title: "Multi-Currency Account",
      description: <>Prepare for Year 3 Bali trip by holding funds in USD, EUR, or GBP to <Explainer term="hedge FX" explanation="Protecting your money against the risk of the South African Rand losing value compared to foreign currencies (Foreign Exchange)." /> risk.</>,
      cta: "Open Wallet"
    },
    {
      id: 4,
      tag: "FOR LIFESTYLE MANAGEMENT",
      title: "Consultations",
      description: <>We've noticed you're 12% above the expected income trajectory. Seize this chance by talking to a professional.</>,
      cta: "Book consultation"
    }
  ];

  if (trackId !== 'debt-free') return (<div>In Development...</div>);

  return (
    <>
      {/* Notifications passed directly to TopBar */}
      <TopBar 
        title="ACTIVE TRACK" 
        icon={<ShieldCheck className="header-icon" />} 
        notifications={dynamicNotifications}
      />
      <div className="page-content">
        
        {/* Use the same sim-back-link class we created for the simulation lab */}
        <Link to="/strategy-tracks" className="sim-back-link">
          <ArrowLeft className="back-arrow-icon" /> Back to Strategy Tracks
        </Link>

        {/* HEADER */}
        <div className="strategy-header-container">
          <div>
            <h1 className="strategy-title">
              The <span className="text-gold">Debt Free</span> Starter
            </h1>
            <p className="strategy-subtitle">
              This 5-year timeline is customized based on your Money Snapshot. It shows your projected milestones if you aggressively target your <Explainer term="high-interest debt" explanation="Debts like credit cards or personal loans that charge a high interest rate, causing the owed amount to compound and grow rapidly if not paid off." />.
            </p>
          </div>
        </div>

        {/* 3-COLUMN LAYOUT */}
        <div className="layout-split">
          
          <div className="track-summary">
            <div className="summary-card">
              <h3 className="summary-title">Your 5-Year Projection</h3>
              <div className="status-badge">● ON TRACK</div>
              
              <div className="stat-group">
                <div className="stat-label">Current Monthly Debt</div>
                <div className="stat-value text-red">R {formatZAR(currentDebtPayment)}</div>
              </div>

              <div className="stat-group">
                <div className="stat-label">Current Disposable Income</div>
                <div className="stat-value">R {formatZAR(currentDisposable)}</div>
              </div>

              <hr className="summary-divider" />

              <div className="stat-group">
                <div className="stat-label">Projected Disposable (Year 5)</div>
                <div className="stat-value text-green">R {formatZAR(projectedDisposable)}</div>
              </div>
            </div>
          </div>

          <div className="timeline-container">
            {milestonesData.map((milestone) => (
              <div key={milestone.id} className={`timeline-item ${milestone.status}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-date">{milestone.date}</div>
                  <h3>{milestone.title}</h3>
                  <div>{milestone.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="suggestions-sidebar">
            <div className="suggestions-header">
              <Star size={20} fill="#1a1a1a" color="#1a1a1a" /> 
              ABSA SUGGESTIONS
            </div>

            {absaSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="suggestion-card">
                <div className="suggestion-tag">{suggestion.tag}</div>
                <div className="suggestion-title">{suggestion.title}</div>
                <div className="suggestion-desc">{suggestion.description}</div>
                <div className="suggestion-cta">
                  {suggestion.cta} <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default ActiveTrackView;
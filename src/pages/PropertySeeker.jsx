import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Star, ArrowRight, Shield, CheckSquare, Square, FileText } from 'lucide-react';
import confetti from 'canvas-confetti'; // <-- 1. Imported confetti
import TopBar from '../components/TopBar';
import { useFinancials } from '../context/FinancialContext'; 
import Explainer from '../components/Explainer';
import '../styles/PropertySeeker.css';

const PropertySeeker = () => {
  const { financials } = useFinancials();
  const [manualChecks, setManualChecks] = useState({});

  const formatZAR = (amount) => amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // === DATA-DRIVEN MATH & PROJECTIONS ===
  const netIncome = financials.netIncome || 45000;
  const fixedCosts = financials.fixedCosts || 18000;
  const monthlyDebt = financials.monthlyDebt || 4000;
  const currentSavings = financials.currentSavings || 0;
  
  // Property specific targets
  const targetHomePrice = financials.targetHomePrice || 1800000;
  const depositPercent = 0.10; 
  const transferCostPercent = 0.05; 

  const depositRequired = targetHomePrice * depositPercent;
  const transferCosts = targetHomePrice * transferCostPercent;
  const totalCashNeeded = depositRequired + transferCosts;
  
  // Calculate Savings Timeline
  const currentDisposable = Math.max(0, netIncome - fixedCosts - monthlyDebt);
  const houseSavingsAllocation = currentDisposable * 0.4; 
  
  const cashShortfall = Math.max(0, totalCashNeeded - currentSavings);
  const monthsToTarget = houseSavingsAllocation > 0 ? Math.ceil(cashShortfall / houseSavingsAllocation) : 0;
  const yearsToTarget = (monthsToTarget / 12).toFixed(1);
  
  const savingsProgressPercent = totalCashNeeded > 0 ? Math.min(100, Math.round((currentSavings / totalCashNeeded) * 100)) : 0;

  // Calculate Affordability (Est 11.75% over 20 years)
  const principalLoan = targetHomePrice - depositRequired;
  const monthlyRate = 0.1175 / 12;
  const totalMonths = 240;
  const estBondPayment = (principalLoan * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  
  const isAffordable = estBondPayment <= (netIncome * 0.35);

  // === DYNAMIC COMPLETION LOGIC ===
  const autoCompleted = {
    1: monthlyDebt <= (netIncome * 0.15), 
    2: currentSavings >= totalCashNeeded, 
    3: false, 
    4: false, 
    5: false  
  };

  const isMilestoneCompleted = (id) => autoCompleted[id] || manualChecks[id];

  // <-- 2. Updated toggle function to fire confetti
  const toggleMilestone = (id) => {
    const alreadyDone = isMilestoneCompleted(id);

    // Only pop confetti if we are marking it as done for the first time
    if (!alreadyDone) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#dc0032', '#d4af37', '#2e7d32'] // Absa Red, Gold, Green
      });
    }

    setManualChecks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // ==========================================
  // TIMELINE DATA
  // ==========================================
  const rawMilestones = [
    {
      id: 1,
      date: "STEP 1 (PREPARATION)",
      title: "Credit & Affordability Check",
      description: (
        <div className="milestone-section">
          <p className="milestone-text">Before applying for a home loan, you must ensure your <Explainer term="Debt-to-Income ratio" explanation="The percentage of your gross monthly income that goes toward paying debts. Banks use this to determine your borrowing risk." /> is healthy. Pay down high-interest debt to boost your credit score.</p>
          <div className="data-box">
            <div className="data-row">
              <span>Your Target Purchase:</span>
              <span className="bold">R {formatZAR(targetHomePrice)}</span>
            </div>
            <div className="data-row">
              <span>Est. Bond Repayment:</span>
              <span>R {formatZAR(estBondPayment)}/mo</span>
            </div>
            <div className="data-row bold">
              <span>Affordability Status:</span>
              <span className={isAffordable ? "text-green" : "text-red"}>
                {isAffordable ? "Within Budget (< 35% Income)" : "High Risk (> 35% Income)"}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      date: `STEP 2 (MONTHS 1-${monthsToTarget})`,
      title: "The Sinking Fund",
      description: (
        <div className="milestone-section">
          <p className="milestone-text">To avoid 100% bonds (which carry higher interest rates) and to cover mandatory attorney fees, you need to save 15% of the purchase price. We project this will take <strong>{yearsToTarget} years</strong> if you allocate 40% of your disposable income.</p>
          
          <div className="data-box">
            <div className="data-row">
              <span>10% Deposit:</span>
              <span>R {formatZAR(depositRequired)}</span>
            </div>
            <div className="data-row">
              <span>5% Transfer & Bond Costs:</span>
              <span>R {formatZAR(transferCosts)}</span>
            </div>
            <div className="data-row bold">
              <span>Total Cash Required:</span>
              <span className="text-red">R {formatZAR(totalCashNeeded)}</span>
            </div>
          </div>

          <div className="progress-labels">
            <span>R {formatZAR(currentSavings)} / R {formatZAR(totalCashNeeded)}</span>
            <span className="progress-percentage">{isMilestoneCompleted(2) ? '100' : savingsProgressPercent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${isMilestoneCompleted(2) ? 100 : savingsProgressPercent}%` }}></div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      date: `STEP 3 (MONTH ${monthsToTarget + 1})`,
      title: "Absa Pre-Approval",
      description: (
        <div className="milestone-section">
          <p className="milestone-text">With your deposit ready, get an official Absa Home Loan Pre-Approval certificate. This proves to estate agents and sellers that you are a serious, backed buyer.</p>
          <div className="feature-badge">
            <span className="feature-icon-box"><FileText size={16} /></span> 
            Valid for 90 days
          </div>
        </div>
      )
    },
    {
      id: 4,
      date: "STEP 4",
      title: "House Hunting & The Offer",
      description: (
        <div className="milestone-section">
          <p className="milestone-text-top">Find the perfect property and submit an <Explainer term="Offer to Purchase (OTP)" explanation="A legally binding contract between the buyer and seller outlining the terms and price of the property sale." />. Ensure you include a 'subject to bond approval' suspensive condition.</p>
        </div>
      )
    },
    {
      id: 5,
      date: "STEP 5",
      title: "Registration & Move-In",
      description: (
        <div className="milestone-section">
          <p className="milestone-text-top">The attorneys will register the bond at the Deeds Office (this takes about 6-8 weeks). Once registered, the property is legally yours. Welcome home.</p>
          <div className="feature-badge ps-mt-12">
            <span className="feature-icon-box"><Home size={16} color="#2e7d32" /></span> 
            Track Complete
          </div>
        </div>
      )
    }
  ];

  // Map raw data into layout logic
  let foundActive = false;
  const processedMilestones = rawMilestones.map(milestone => {
    const isCompleted = isMilestoneCompleted(milestone.id);
    let derivedStatus = "future";

    if (isCompleted) {
      derivedStatus = "completed";
    } else if (!foundActive) {
      derivedStatus = "active";
      foundActive = true; 
    }

    return { ...milestone, isCompleted, status: derivedStatus };
  });

  // Calculate Overall Progress
  const completedCount = processedMilestones.filter(m => m.isCompleted).length;
  const overallProgressPercent = Math.round((completedCount / rawMilestones.length) * 100);

  // === DYNAMIC NOTIFICATION LOGIC ===
  const dynamicNotifications = [];
  if (!isAffordable) {
    dynamicNotifications.push({
      title: 'Affordability Warning',
      message: `A bond for R ${formatZAR(targetHomePrice)} requires an estimated R ${formatZAR(estBondPayment)}/mo. This exceeds the recommended 35% of your net income. Consider a lower target price.`
    });
  }
  if (currentSavings >= totalCashNeeded && isAffordable) {
    dynamicNotifications.push({
      title: 'Ready to Buy',
      message: 'You have the required cash on hand and fit the affordability criteria. You are ready to apply for Pre-Approval!'
    });
  }

  // ==========================================
  // ABSA SUGGESTIONS DATA
  // ==========================================
  const absaSuggestions = [
    {
      id: 1,
      tag: "FOR STEP 1 & 2",
      title: "Absa Notice Deposit Account",
      description: "While saving your deposit over the next few years, keep it in an Absa 32-Day Notice account to earn higher interest without risking stock market volatility.",
      cta: "View Rates"
    },
    {
      id: 2,
      tag: "FOR STEP 3",
      title: "Get Pre-Approved Online",
      description: "Don't guess your affordability. Use the Absa online portal to get a legally valid pre-approval certificate in minutes without affecting your credit score.",
      cta: "Start Application"
    },
    {
      id: 3,
      tag: "FOR STEP 5",
      title: "Eco Home Loan Discount",
      description: "If your target home has solar panels, solar geysers, or an eco-friendly certification, you may qualify for a lower interest rate with our Green Home Loan.",
      cta: "Learn More"
    }
  ];

  return (
    <>
      <TopBar 
        title="ACTIVE TRACK" 
        icon={<Home className="header-icon" />} 
        notifications={dynamicNotifications}
      />
      <div className="page-content">
        
        <Link to="/strategy-tracks" className="back-link">
          <ArrowLeft size={16} /> Back to Strategy Tracks
        </Link>

        {/* HEADER */}
        <div className="strategy-header-container">
          <div>
            <h1 className="strategy-title">
              The <span className="text-gold">Property</span> Seeker
            </h1>
            <p className="strategy-subtitle">
              Ideal for stable earners preparing for homeownership. This track calculates your exact savings timeline and evaluates affordability based on your current Money Snapshot data.
            </p>
          </div>
        </div>

        {/* 3-COLUMN LAYOUT */}
        <div className="layout-split">
          
          {/* COLUMN 1: FINANCIAL IMPACT SUMMARY */}
          <div className="track-summary">
            <div className="summary-card">
              <h3 className="summary-title">Acquisition Overview</h3>
              <div className={`status-badge ${isAffordable ? '' : 'warning'}`}>
                {isAffordable ? '● AFFORDABLE' : '● BUDGET STRAINED'}
              </div>
              
              <div className="stat-group">
                <div className="stat-label">Target Purchase Price</div>
                <div className="stat-value">R {formatZAR(targetHomePrice)}</div>
              </div>

              <div className="stat-group">
                <div className="stat-label">Required Upfront Cash</div>
                <div className="stat-value text-red">R {formatZAR(totalCashNeeded)}</div>
                <div className="stat-subtext">10% Deposit + 5% Fees</div>
              </div>

              <hr className="summary-divider" />

              <div className="stat-group">
                <div className="stat-label">Projected Buying Window</div>
                <div className="stat-value text-green">Year {Math.ceil(yearsToTarget)}</div>
                <div className="stat-subtext">Based on current savings rate</div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: THE TIMELINE */}
          <div>
            {/* MASTER PROGRESS BAR */}
            <div className="track-overall-progress">
              <div className="track-progress-header">
                <h4 className="track-progress-title">Track Progression</h4>
                <div className="track-progress-value">{overallProgressPercent}%</div>
              </div>
              <div className="track-progress-bar-bg">
                <div className="track-progress-bar-fill" style={{ width: `${overallProgressPercent}%` }}></div>
              </div>
            </div>

            <div className="timeline-container">
              {processedMilestones.map((milestone) => (
                <div key={milestone.id} className={`timeline-item ${milestone.status}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-date">{milestone.date}</div>
                    
                    <div className="milestone-header">
                      <h3>{milestone.title}</h3>
                      <button 
                        className={`milestone-check-btn ${milestone.isCompleted ? 'completed' : ''}`}
                        onClick={() => toggleMilestone(milestone.id)}
                      >
                        {milestone.isCompleted ? (
                          <><CheckSquare size={18} /> Done</>
                        ) : (
                          <><Square size={18} /> Mark Done</>
                        )}
                      </button>
                    </div>

                    <div>{milestone.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 3: SIDEBAR */}
          <div className="suggestions-sidebar">
            <div className="suggestions-header">
              <Star size={20} fill="#1a1a1a" color="#1a1a1a" /> 
              ABSA ACCELERATORS
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

export default PropertySeeker;
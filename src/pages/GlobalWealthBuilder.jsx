import { Link } from 'react-router-dom';
import { Globe, ArrowLeft, Star, ArrowRight, Shield, CheckSquare, Square, TrendingDown, Compass, Landmark } from 'lucide-react';
import confetti from 'canvas-confetti'; 
import TopBar from '../components/TopBar';
import { useFinancials } from '../context/FinancialContext'; 
import Explainer from '../components/Explainer';
import '../styles/GlobalWealthBuilder.css';

const GlobalWealthBuilder = () => {
  const { financials, updateFinancials } = useFinancials();

  // Read persistent checks from the global context instead of local state
  const manualChecks = financials.completedMilestones || {};

  const formatZAR = (amount) => amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // === DATA-DRIVEN MATH & PROJECTIONS ===
  const netIncome = financials.netIncome || 0;
  
  const housing = financials.housingCosts || 0;
  const mobility = financials.mobilityCosts || 0;
  const lifestyle = financials.lifestyleCosts || 0;
  const totalFixedCosts = housing + mobility + lifestyle;

  const monthlyDebt = financials.monthlyDebt || 0; 
  const currentSavings = financials.currentSavings || 0;

  const currentDisposable = Math.max(0, netIncome - totalFixedCosts - monthlyDebt);
  const wealthAllocation = currentDisposable * 0.75; 
  
  const tfsaMonthlyTarget = 3000; 
  const tfsaProgressPercent = Math.min(100, Math.round((wealthAllocation / tfsaMonthlyTarget) * 100));
  
  const offshoreSurplus = Math.max(0, wealthAllocation - tfsaMonthlyTarget);

  const monthlyRate = 0.11 / 12;
  const totalMonths = 60;
  let projectedPortfolio = currentSavings;
  for (let i = 0; i < totalMonths; i++) {
    projectedPortfolio = (projectedPortfolio + wealthAllocation) * (1 + monthlyRate);
  }

  // === DYNAMIC COMPLETION LOGIC ===
  const autoCompleted = {
    1: currentSavings >= (totalFixedCosts * 2), 
    2: wealthAllocation >= tfsaMonthlyTarget, 
    3: offshoreSurplus > 2000, 
    4: false, 
    5: false  
  };

  const toggleMilestone = (id) => {
    const milestoneKey = `gwb_${id}`; // Unique ID so tracks don't clash
    const alreadyDone = isMilestoneCompleted(id);

    if (!alreadyDone) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#dc0032', '#d4af37', '#9333ea'] 
      });
    }

    // Update global context, triggering a save to localStorage
    updateFinancials({
      completedMilestones: {
        ...manualChecks,
        [milestoneKey]: !manualChecks[milestoneKey]
      }
    });
  };

  const isMilestoneCompleted = (id) => autoCompleted[id] || manualChecks[`gwb_${id}`];

  // ==========================================
  // TIMELINE DATA
  // ==========================================
  const rawMilestones = [
    {
      id: 1,
      date: "STEP 1 (MOBILITY BASE)",
      title: "The Mobility Runway",
      description: (
        <div className="milestone-section">
          <p className="milestone-text">Because you avoid buying property, you don't tie up cash. Step 1 requires a strict 2-month cash runway to handle short-notice lease changes, travel bookings, or digital nomad relocation setups.</p>
          <div className="data-box">
            <div className="data-row">
              <span>Required Cash Buffer:</span>
              <span>R {formatZAR(totalFixedCosts * 2)}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      date: "STEP 2 (ANNUAL CYCLE)",
      title: "Maxing out the R36,000 TFSA",
      description: (
        <div className="milestone-section">
          <p className="milestone-text">Your first financial target every year is to saturate your <Explainer term="TFSA" explanation="Tax-Free Savings Account. A government wrapper where all growth is 100% exempt from SARS income tax, dividend withholding tax, and CGT." /> allocation to avoid local dividend and growth taxes completely.</p>
          <div className="progress-labels">
            <span>R {formatZAR(Math.min(wealthAllocation, tfsaMonthlyTarget))} / R {formatZAR(tfsaMonthlyTarget)} Monthly Target</span>
            <span className="progress-percentage">{isMilestoneCompleted(2) ? '100' : tfsaProgressPercent}%</span>
          </div>
          <progress 
            className="gwb-step-progress" 
            value={isMilestoneCompleted(2) ? 100 : tfsaProgressPercent} 
            max="100"
          ></progress>
        </div>
      )
    },
    {
      id: 3,
      date: "STEP 3 (EXTERNALIZATION)",
      title: "The Global Asset Spillway",
      description: (
        <div className="milestone-section">
          <p className="milestone-text">With the local tax shelter completely filled, your remaining monthly balance is systematically externalized out of the South African Rand into direct USD or EUR global index assets.</p>
          <div className="data-box">
            <div className="data-row">
              <span>Your Monthly Offshore Feed Rate:</span>
              <span className="text-purple bold">R {formatZAR(offshoreSurplus)} / mo</span>
            </div>
            <div className="data-row">
              <span>Primary Allocation Target:</span>
              <span>Global Equities (MSCI World / S&P 500)</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      date: "STEP 4",
      title: "SARS Clearance Setup",
      description: (
        <div className="milestone-section">
          <p className="milestone-text-top">Once your velocity outpaces your R1 Million annual Single Discretionary Allowance (SDA), automate your applications for an offshore AIT (Approved International Transfer) tax clearance status with SARS to secure boundless externalization limits.</p>
        </div>
      )
    },
    {
      id: 5,
      date: "STEP 5 (THE VELOCITY APEX)",
      title: "Location Sovereignty",
      description: (
        <div className="milestone-section">
          <p className="milestone-text-top">Your paper asset compound interest machine now operates on autopilot. Your liquid global portfolio yields completely hedge or outpace your domestic rental overheads, unlocking geographical flexibility.</p>
          <div className="feature-badge gwb-mt-12">
            <span className="feature-icon-box"><Compass size={16} className="icon-purple" /></span> 
            Track Complete: Global Nomad Status achieved
          </div>
        </div>
      )
    }
  ];

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

  const completedCount = processedMilestones.filter(m => m.isCompleted).length;
  const overallProgressPercent = Math.round((completedCount / rawMilestones.length) * 100);

  const dynamicNotifications = [];
  if (monthlyDebt > 0) {
    dynamicNotifications.push({
      title: 'Structural Friction Detected',
      message: `You have R ${formatZAR(monthlyDebt)} in debt tracking. To achieve high-velocity global mobility, target a 100% debt-free profile.`
    });
  }
  if (netIncome > 0 && wealthAllocation >= tfsaMonthlyTarget) {
    dynamicNotifications.push({
      title: 'TFSA Shield Fully Covered',
      message: 'Excellent. Your current surplus comfortably fills the annual local tax protection limit. The spillway is ready for offshore routing.'
    });
  }

  const absaSuggestions = [
    {
      id: 1,
      tag: "FOR STEP 2",
      title: "Absa Tax-Free Savings",
      description: "Automate your R36,000 annual TFSA allocation directly through your banking app to ensure you never miss your maximum tax shield.",
      cta: "Setup TFSA"
    },
    {
      id: 2,
      tag: "FOR STEP 3",
      title: "Absa Global Trading",
      description: "Externalize your wealth. Use our platform to invest directly in international markets, buying USD and EUR denominated ETFs.",
      cta: "Open Account"
    }
  ];

  return (
    <>
      <TopBar 
        title="ACTIVE TRACK" 
        icon={<Globe className="header-icon" />} 
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
              The <span className="text-gold">Global Wealth</span> Builder
            </h1>
            <p className="strategy-subtitle">
              Engineered exclusively for high earners prioritizing zero debt, location flexibility, and hyper-aggressive wealth creation within global equity instruments.
            </p>
          </div>
        </div>

        {/* 3-COLUMN LAYOUT */}
        <div className="layout-split">
          
          {/* COLUMN 1: FINANCIAL IMPACT SUMMARY */}
          <div className="track-summary">
            <div className="summary-card">
              <h3 className="summary-title">Velocity Overview</h3>
              <div className="status-badge">● PURE PAPER GROWTH</div>
              
              <div className="stat-group">
                <div className="stat-label">Monthly Investment Surplus</div>
                <div className="stat-value text-green">R {formatZAR(wealthAllocation)}</div>
                <div className="stat-subtext">75% of net disposable income deployed</div>
              </div>

              <div className="stat-group">
                <div className="stat-label">Offshore Spillway Capacity</div>
                <div className="stat-value text-purple">R {formatZAR(offshoreSurplus)} / mo</div>
                <div className="stat-subtext">Direct foreign diversification scale</div>
              </div>

              <hr className="summary-divider" />

              <div className="stat-group">
                <div className="stat-label">Projected 5-Year Capitalization</div>
                <div className="stat-value text-gold">R {formatZAR(projectedPortfolio)}</div>
                <div className="stat-subtext">Assuming 11% compounded global performance</div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: THE TIMELINE */}
          <div>
            <div className="track-overall-progress">
              <div className="track-progress-header">
                <h4 className="track-progress-title">Track Progression</h4>
                <div className="track-progress-value">{overallProgressPercent}%</div>
              </div>
              <progress 
                className="gwb-main-progress" 
                value={overallProgressPercent} 
                max="100"
              ></progress>
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
              <Star size={20} className="icon-dark-fill" /> 
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

export default GlobalWealthBuilder;
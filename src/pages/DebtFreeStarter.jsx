import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Star, ArrowRight, Shield, CheckSquare, Square, TrendingDown, Target } from 'lucide-react';
import confetti from 'canvas-confetti'; 
import TopBar from '../components/TopBar';
import { useFinancials } from '../context/FinancialContext'; 
import Explainer from '../components/Explainer';
import '../styles/DebtFreeStarter.css'; 

const DebtFreeStarter = () => {
  const { financials, updateFinancials } = useFinancials();

  // Read persistent checks from the global context
  const manualChecks = financials.completedMilestones || {};

  const formatZAR = (amount) => amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // === DATA-DRIVEN MATH & PROJECTIONS ===
  const netIncome = financials.netIncome || 0;
  
  const housing = financials.housingCosts || 0;
  const mobility = financials.mobilityCosts || 0;
  const lifestyle = financials.lifestyleCosts || 0;
  const totalFixedCosts = housing + mobility + lifestyle;
  
  const currentSavings = financials.currentSavings || 0;
  
  const totalDebt = financials.totalDebt || 0; 
  const minDebtPayment = financials.monthlyDebt || 0;
  const currentDisposable = Math.max(0, netIncome - totalFixedCosts - minDebtPayment);

  // Accelerated Debt Plan Math
  const extraDebtPayment = currentDisposable * 0.5; 
  const acceleratedMonthlyPayment = minDebtPayment + extraDebtPayment;
  const monthsToFreedom = acceleratedMonthlyPayment > 0 ? Math.ceil(totalDebt / acceleratedMonthlyPayment) : 0;
  const yearsToFreedom = (monthsToFreedom / 12).toFixed(1);

  // Buffer Goals
  const baseBufferTarget = totalFixedCosts * 1; 
  const baseBufferProgress = baseBufferTarget > 0 ? Math.min(100, Math.round((currentSavings / baseBufferTarget) * 100)) : 0;
  
  const fullFundTarget = totalFixedCosts * 3; 
  
  // Post-Debt Wealth Rate
  const projectedMonthlyInvestment = currentDisposable + minDebtPayment; 

  // === DYNAMIC COMPLETION LOGIC ===
  const autoCompleted = {
    1: baseBufferProgress >= 100,
    2: totalDebt <= 0, 
    3: currentSavings >= fullFundTarget,
    4: false, 
    5: false  
  };

  const isMilestoneCompleted = (id) => autoCompleted[id] || manualChecks[`dfs_${id}`];

  const toggleMilestone = (id) => {
    const milestoneKey = `dfs_${id}`;
    const alreadyDone = isMilestoneCompleted(id);

    if (!alreadyDone) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#dc0032', '#d4af37', '#2e7d32'] 
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

  // ==========================================
  // TIMELINE DATA
  // ==========================================
  const rawMilestones = [
    {
      id: 1,
      date: "STEP 1 (WEEKS 1-4)",
      title: "The Starter Buffer",
      description: (
        <div className="milestone-section">
          <p className="milestone-text">Before attacking debt aggressively, you need a basic 1-month safety net to prevent relying on credit cards for sudden emergencies.</p>
          <div className="progress-labels">
            <span>R {formatZAR(currentSavings)} / R {formatZAR(baseBufferTarget)} Target</span>
            <span className="progress-percentage">{isMilestoneCompleted(1) ? '100' : baseBufferProgress}%</span>
          </div>
          <progress 
            className="dfs-step-progress" 
            value={isMilestoneCompleted(1) ? 100 : baseBufferProgress} 
            max="100"
          ></progress>
        </div>
      )
    },
    {
      id: 2,
      date: `STEP 2 (MONTHS 1-${monthsToFreedom})`,
      title: "Aggressive Debt Elimination",
      description: (
        <div className="milestone-section">
          <p className="milestone-text">Using the <Explainer term="Avalanche Method" explanation="Paying off debts with the highest interest rates first to mathematically save the most money over time." />, we apply 50% of your disposable income toward your debt to rapidly kill the compounding interest.</p>
          
          <div className="data-box">
            <div className="data-row">
              <span>Total Current Debt:</span>
              <span className="text-red">R {formatZAR(totalDebt)}</span>
            </div>
            <div className="data-row">
              <span>Minimum Payment:</span>
              <span>R {formatZAR(minDebtPayment)}/mo</span>
            </div>
            <div className="data-row">
              <span>+ Strategic Extra Payment:</span>
              <span className="text-green">R {formatZAR(extraDebtPayment)}/mo</span>
            </div>
            <div className="data-row bold">
              <span>Target Debt-Free Date:</span>
              <span>{yearsToFreedom} Years</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      date: `STEP 3 (MONTH ${monthsToFreedom + 1} ONWARD)`,
      title: "Fully Funded Safety Net",
      description: (
        <div className="milestone-section">
          <p className="milestone-text">With zero debt draining your account, immediately redirect your R {formatZAR(acceleratedMonthlyPayment)} accelerated payment back into your savings until you hit a strict 3-month <Explainer term="liquidity buffer" explanation="Cash readily available to cover unexpected expenses without having to sell investments or take on debt." />.</p>
          <div className="feature-badge">
            <span className="feature-icon-box"><Shield size={16} /></span> 
            Target Buffer: R {formatZAR(fullFundTarget)}
          </div>
        </div>
      )
    },
    {
      id: 4,
      date: "STEP 4",
      title: "The Wealth Flip",
      description: (
        <div className="milestone-section">
          <p className="milestone-text-top">You are now legally debt-free with a full emergency fund. It is time to open an investment portfolio (like a TFSA or ETF) and set up an automatic debit order for your new surplus.</p>
          <div className="feature-badge dfs-mt-12">
            <span className="feature-icon-box"><TrendingDown size={16} className="icon-green" /></span> 
            Monthly Investment Rate: R {formatZAR(projectedMonthlyInvestment)}
          </div>
        </div>
      )
    },
    {
      id: 5,
      date: "STEP 5",
      title: "Lifestyle Unlock",
      description: (
        <div className="milestone-section">
          <p className="milestone-text-top">You have structurally secured your finances. Allocate 15% of your free cashflow purely to guilt-free lifestyle spending, hobbies, or a major savings goal.</p>
          <div className="feature-badge dfs-mt-12">
            <span className="feature-icon-box"><Target size={16} /></span> 
            Track Complete
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
  if (netIncome > 0 && (minDebtPayment / netIncome) > 0.3) {
    dynamicNotifications.push({
      title: 'High Debt Burden',
      message: 'Your monthly debt obligations exceed 30% of your net income. Committing to this track is critical for your financial health.'
    });
  }
  if (currentDisposable < 1000 && netIncome > 0) {
    dynamicNotifications.push({
      title: 'Cashflow Warning',
      message: 'Your disposable income is very tight. Consider reviewing your fixed costs to accelerate your timeline.'
    });
  }

  const absaSuggestions = [
    {
      id: 1,
      tag: "FOR STEP 2",
      title: "ABSA Debt Consolidation",
      description: "If you have multiple high-interest debts, consolidating them into a single Absa personal loan at a lower fixed interest rate could shave months off your timeline.",
      cta: "Calculate Savings"
    },
    {
      id: 2,
      tag: "FOR STEP 4",
      title: "ABSA Tax-Free Savings",
      description: "Once you reach the Wealth Flip, open an Absa TFSA directly in your app to begin compounding your new free cash flow tax-free.",
      cta: "View TFSA"
    }
  ];

  return (
    <>
      <TopBar 
        title="ACTIVE TRACK" 
        icon={<ShieldCheck className="header-icon" />} 
        notifications={dynamicNotifications}
      />
      <div className="page-content">
        
        <Link to="/strategy-tracks" className="back-link">
          <ArrowLeft size={16} /> Back to Strategy Tracks
        </Link>

        <div className="strategy-header-container">
          <div>
            <h1 className="strategy-title">
              The <span className="text-gold">Debt Free</span> Starter
            </h1>
            <p className="strategy-subtitle">
              This mathematical timeline is strictly customized to your Money Snapshot. It calculates your exact timeline to R0 debt if you systematically redirect 50% of your current free cashflow. Mark off steps as you complete them to progress.
            </p>
          </div>
        </div>

        <div className="layout-split">
          
          <div className="track-summary">
            <div className="summary-card">
              <h3 className="summary-title">Financial Impact</h3>
              <div className="status-badge">● CALCULATED</div>
              
              <div className="stat-group">
                <div className="stat-label">Current Minimum Payments</div>
                <div className="stat-value text-red">R {formatZAR(minDebtPayment)}</div>
                <div className="stat-subtext">Money currently lost to banks monthly</div>
              </div>

              <div className="stat-group">
                <div className="stat-label">Calculated Freedom Date</div>
                <div className="stat-value">{yearsToFreedom} Years</div>
                <div className="stat-subtext">With aggressive strategy applied</div>
              </div>

              <hr className="summary-divider" />

              <div className="stat-group">
                <div className="stat-label">New Wealth Creation Rate</div>
                <div className="stat-value text-green">R {formatZAR(projectedMonthlyInvestment)} / mo</div>
                <div className="stat-subtext">Cash unlocked for Step 4 investments</div>
              </div>
            </div>
          </div>

          <div>
            <div className="track-overall-progress">
              <div className="track-progress-header">
                <h4 className="track-progress-title">Track Progression</h4>
                <div className="track-progress-value">{overallProgressPercent}%</div>
              </div>
              <progress 
                className="dfs-main-progress" 
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

export default DebtFreeStarter;
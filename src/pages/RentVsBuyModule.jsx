import { useState } from 'react';
import { createPortal } from 'react-dom'; 
import { Link } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Sparkles, CheckCircle2, Info, ChevronRight, X, LayoutList } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import TopBar from '../components/TopBar';
import Explainer from '../components/Explainer';
import { useFinancials } from '../context/FinancialContext'; 
import '../styles/RentVsBuy.css';

ChartJS.register(ArcElement, Tooltip, CategoryScale, LinearScale, BarElement);

const RentVsBuyModule = () => {
  const { financials } = useFinancials(); 

  const [propertyPrice, setPropertyPrice] = useState(financials.targetHomePrice || 1600000);
  const [interestRate, setInterestRate] = useState(11.75);
  const [rentPrice, setRentPrice] = useState(10000);
  const [horizon, setHorizon] = useState(5);
  const [showFormulas, setShowFormulas] = useState(false);

  const formatZAR = (amount) => amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatMillions = (amount) => (amount / 1000000).toFixed(2);

  // === DYNAMIC FINANCIAL MATH ===
  const propertyGrowthRate = 0.06; 
  const investGrowthRate = 0.08; 

  const deposit = propertyPrice * 0.10; 
  const loanAmount = propertyPrice - deposit;
  const monthlyRate = (interestRate / 100) / 12;
  const totalMonthsBond = 240; 
  
  const monthlyBond = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonthsBond));
  
  const monthsPassed = horizon * 12;
  const estPropertyValue = propertyPrice * Math.pow(1 + propertyGrowthRate, horizon);
  const totalBondCost = monthlyBond * monthsPassed;
  const totalRentSunk = rentPrice * monthsPassed;

  const remainingLoan = loanAmount * (Math.pow(1 + monthlyRate, totalMonthsBond) - Math.pow(1 + monthlyRate, monthsPassed)) / (Math.pow(1 + monthlyRate, totalMonthsBond) - 1);
  const equityBuilt = estPropertyValue - remainingLoan;

  const monthlySavingsForRenters = monthlyBond - rentPrice; 
  let finalInvestValue = deposit * Math.pow(1 + investGrowthRate, horizon); 

  if (monthlySavingsForRenters > 0) {
    const monthlyInvestRate = investGrowthRate / 12;
    const fvMonthly = monthlySavingsForRenters * ((Math.pow(1 + monthlyInvestRate, monthsPassed) - 1) / monthlyInvestRate);
    finalInvestValue += fvMonthly;
  }

  const ownershipWins = equityBuilt > finalInvestValue;
  const winDelta = Math.abs(equityBuilt - finalInvestValue);
  const winStatusClass = ownershipWins ? 'buy-wins' : 'rent-wins';
  
  const equityPercent = Math.min(100, Math.max(0, Math.round((equityBuilt / estPropertyValue) * 100)));
  const remainingPercent = 100 - equityPercent;
  
  const maxWealth = Math.max(equityBuilt, finalInvestValue);
  const minWealth = Math.max(1, Math.min(equityBuilt, finalInvestValue)); 
  const wealthMultiplier = (maxWealth / minWealth).toFixed(1);

  // === EXPLANATION VARIABLES ===
  const propertyAppreciation = estPropertyValue - propertyPrice;
  const capitalPaidOff = loanAmount - remainingLoan;
  const pureInterestPaid = totalBondCost - capitalPaidOff;
  const monthlyInvestDelta = Math.max(0, monthlySavingsForRenters);

  // === CHARTS ===
  const doughnutData = {
    labels: ['Owned Equity', 'Remaining Bank Debt'],
    datasets: [{
      data: [equityPercent, remainingPercent],
      backgroundColor: ['#6b21a8', '#94a3b8'], 
      borderWidth: 0,
    }]
  };

  const doughnutOptions = {
    cutout: '85%',
    plugins: { tooltip: { enabled: true } },
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeOutQuart' }
  };

  const horizonBarData = {
    labels: ['OWNERSHIP', 'RENTAL+INVEST'],
    datasets: [
      {
        label: 'Achieved Wealth',
        data: [equityBuilt, finalInvestValue],
        backgroundColor: ['#1a1a1a', '#94a3b8'], 
        barThickness: 32,
      },
      {
        label: 'Missed Gain',
        data: [ownershipWins ? 0 : winDelta, ownershipWins ? winDelta : 0],
        backgroundColor: 'rgba(255, 255, 255, 0)', 
        borderColor: ownershipWins ? '#1e8e3e' : '#9333ea', 
        borderWidth: 2,
        borderDash: [4, 4], 
        barThickness: 32,
      }
    ]
  };

  const horizonBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (context) => ` R ${formatMillions(context.raw)}m` } }
    },
    scales: {
      x: { stacked: true, grid: { display: false, drawBorder: false }, ticks: { font: { family: 'Lexend', size: 10, weight: '700' }, color: '#666' } },
      y: { stacked: true, display: false }
    }
  };

  return (
    <>
      <TopBar title="SIMULATION LAB - Rent vs Buy" notifications={[]} />
      
      {showFormulas && createPortal(
        <div className="rvb-modal-overlay" onClick={() => setShowFormulas(false)}>
          <div className="rvb-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="rvb-modal-header">
              <h2 className="rvb-modal-title">Simulation Formulas</h2>
              <button className="rvb-close-btn" onClick={() => setShowFormulas(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="rvb-formula-group">
              <div className="rvb-formula-desc">1. Mortgage Amortization (Monthly Installment)</div>
              <div className="rvb-formula-block">
                M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1 ]<br/><br/>
                P = Principal Loan (R {formatZAR(loanAmount)})<br/>
                i = Monthly Interest Rate ({(monthlyRate * 100).toFixed(3)}%)<br/>
                n = Total Months (240)
              </div>
            </div>

            <div className="rvb-formula-group">
              <div className="rvb-formula-desc">2. Compound Interest (Renter's Portfolio)</div>
              <div className="rvb-formula-block">
                FV = P(1 + r/n)^(nt) + PMT × [ ((1 + r/n)^(nt) - 1) / (r/n) ]<br/><br/>
                P = Initial Deposit (R {formatZAR(deposit)})<br/>
                PMT = Monthly Savings vs Bond (R {formatZAR(Math.max(0, monthlySavingsForRenters))})<br/>
                r = Annual Market Return (8%)<br/>
                t = Time Horizon ({horizon} Years)
              </div>
            </div>
          </div>
        </div>,
        document.body 
      )}

      <div className="page-content">
        <Link to="/simulation-lab" className="sim-back-link rvb-back-link">
          <ArrowLeft className="back-arrow-icon" /> Back to Simulations
        </Link>

        {/* HEADER AREA */}
        <div className="rvb-page-header">
          <div>
            <div className="rvb-subtitle">WEALTH ARCHITECTURE SIMULATION</div>
            <h1 className="rvb-title">
              The Rent vs. Buy <span className="text-red">Equilibrium</span>
            </h1>
            <p className="rvb-desc">
              Compare the long-term wealth impact of <Explainer term="property ownership" explanation="Building equity through forced savings and asset appreciation." /> against strategic rental investment over a {horizon}-year horizon.
            </p>
          </div>
          <div className="rvb-market-status">
            <Sparkles className="rvb-market-icon" size={24} />
            <div>
              <div className="rvb-market-label">MARKET STATUS</div>
              <div className="rvb-market-value">Interest Rates: {interestRate}%</div>
            </div>
          </div>
        </div>

        <div className="rvb-main-grid">
          
          {/* LEFT COLUMN */}
          <div className="rvb-col-left">
            <div className="rvb-inputs-card">
              <div className="rvb-inputs-header">
                <SlidersHorizontal size={20} color="#dc0032" />
                Scenario Inputs
              </div>
              
              <div className="rvb-slider-group">
                <div className="rvb-slider-labels">
                  <span className="rvb-slider-title">Property Price</span>
                  <span className="rvb-slider-val">R{formatZAR(propertyPrice)}</span>
                </div>
                <input 
                  type="range" min="800000" max="5000000" step="50000" 
                  value={propertyPrice} onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  className="rvb-range-input"
                />
              </div>

              <div className="rvb-slider-group">
                <div className="rvb-slider-labels">
                  <span className="rvb-slider-title">
                    <Explainer term="Interest Rate" explanation="The cost of borrowing. Usually linked to the SA Reserve Bank's Prime Rate." /> (Prime +)
                  </span>
                  <span className="rvb-slider-val">{interestRate}%</span>
                </div>
                <input 
                  type="range" min="7" max="15" step="0.25" 
                  value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="rvb-range-input"
                />
              </div>

              <div className="rvb-slider-group">
                <div className="rvb-slider-labels">
                  <span className="rvb-slider-title">Alternative Rent</span>
                  <span className="rvb-slider-val">R{formatZAR(rentPrice)}</span>
                </div>
                <input 
                  type="range" min="5000" max="30000" step="500" 
                  value={rentPrice} onChange={(e) => setRentPrice(Number(e.target.value))}
                  className="rvb-range-input"
                />
              </div>

              <div className="rvb-slider-group rvb-mb-0">
                <div className="rvb-slider-labels rvb-mb-4">
                  <span className="rvb-slider-title">Time Horizon</span>
                  <span className="rvb-slider-val">{horizon} Years</span>
                </div>
                <div className="rvb-pills">
                  {[3, 5, 10, 20].map(y => (
                    <button 
                      key={y} 
                      className={`rvb-pill ${horizon === y ? 'active' : ''}`}
                      onClick={() => setHorizon(y)}
                    >
                      {y}Y
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rvb-advisor-card">
              <div className="rvb-advisor-profile">
              
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80" alt="Advisor" className="rvb-advisor-avatar" />
                <div>

                  <img  />
                  <div className="rvb-advisor-role">Your Wealth Lead</div>
                  <h4 className="rvb-advisor-name">Monica Coetzee</h4>
                </div>
              </div>
              <p className="rvb-advisor-quote">
                "Based on your profile, you're eligible for a prime-linked rate of <span>{interestRate}%</span>. Ready to secure your equity?"
              </p>
              <button className="rvb-btn-primary">
                Get Pre-Approved Now <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="rvb-col-right">
            
            {/* TOP VERDICT */}
            <div className="rvb-verdict-card">
              <div className="rvb-verdict-left">
                <div className={`rvb-badge ${winStatusClass}`}>
                  <CheckCircle2 size={14} /> Studio Verdict: {ownershipWins ? 'BUY' : 'RENT'}
                </div>
                <h2 className="rvb-verdict-title">{ownershipWins ? 'Ownership Wins by' : 'Renting Wins by'}</h2>
                <h2 className={`rvb-verdict-amount ${winStatusClass}`}>
                  R{formatZAR(winDelta)}
                </h2>
                
                <div className="rvb-verdict-text">
                  <p className="rvb-verdict-text-p">
                    {ownershipWins 
                      ? `At a prime-linked rate of ${interestRate}%, your bond payments force you to slowly build equity. Over ${horizon} years, your property appreciates by R${formatMillions(propertyAppreciation)}m. Because your alternative rent (R${formatZAR(rentPrice)}) doesn't leave enough monthly surplus to outpace this asset growth in the stock market, buying is the superior wealth-building vehicle.` 
                      : `By choosing to rent at R${formatZAR(rentPrice)}, you unlock R${formatZAR(monthlyInvestDelta)} in surplus cash flow every month compared to a home loan at ${interestRate}%. Investing this difference, along with your initial deposit, into a market yielding 8% aggressively compounds your wealth, outperforming the slow early-equity build of property ownership over a ${horizon}-year timeline.`}
                  </p>
                  
                  {/* CLEAN, NEW IMPACT BOX STYLING */}
                  <div className="rvb-impact-box">
                    <div className="rvb-impact-header">
                      <LayoutList size={16} color="#dc0032" />
                      <h4 className="rvb-impact-title">Key Impact Factors</h4>
                    </div>
                    <ul className="rvb-impact-list">
                      <li><strong>Cost of Debt:</strong> Of your R{formatMillions(totalBondCost)}m total bond payments, an immense <strong>R{formatMillions(pureInterestPaid)}m</strong> goes purely to bank interest.</li>
                      <li><strong>Opportunity Cost:</strong> Renting frees up <strong>R{formatZAR(monthlyInvestDelta)}/mo</strong> to invest directly into the compounding stock market.</li>
                      <li><strong>Time Horizon:</strong> A {horizon}-year period is {horizon <= 7 ? "relatively short, making it difficult to offset the heavy initial interest payments of a 20-year bond." : "long enough for the massive compounding effects of property appreciation to take hold."}</li>
                    </ul>
                  </div>
                </div>

                <div className="rvb-stats-row">
                  <div className="rvb-stat-box">
                    <div className="rvb-stat-box-label">Total Bond Cost</div>
                    <div className="rvb-stat-box-val">R{formatMillions(totalBondCost)}m</div>
                  </div>
                  <div className="rvb-stat-box">
                    <div className="rvb-stat-box-label">Est. Property Value</div>
                    <div className="rvb-stat-box-val">R{formatMillions(estPropertyValue)}m</div>
                  </div>
                </div>
              </div>

              <div className="rvb-chart-wrapper">
                <Doughnut data={doughnutData} options={doughnutOptions} />
                <div className="rvb-chart-center">
                  <div className="rvb-chart-center-label">OWNED EQUITY</div>
                  <div className="rvb-chart-center-val">{equityPercent}%</div>
                  <div className="rvb-chart-center-sub text-purple">
                    <Explainer term="Of Total Value" explanation="The percentage of the home you actually own vs what the bank still owns." />
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM SPLIT */}
            <div className="rvb-split-row">
              
              <div className="rvb-sub-card">
                <h4 className="rvb-sub-title">Asset Dynamics</h4>
                
                <div className="rvb-bar-container">
                  <div className="rvb-bar-top">
                    <span>Rent (<Explainer term="Sunk Costs" explanation="Money spent that cannot be recovered." />)</span>
                    <span>R{formatZAR(totalRentSunk)}</span>
                  </div>
                  <div className="rvb-thick-bar">
                    <div className="rvb-fill-sunk" style={{ width: `${Math.min(100, (totalRentSunk / Math.max(totalRentSunk, equityBuilt)) * 100)}%` }}></div>
                  </div>
                  <div className="rvb-bar-subtext">Money departed from net worth.</div>
                </div>

                <div className="rvb-bar-container rvb-mb-0">
                  <div className="rvb-bar-top">
                    <span><Explainer term="Home Equity" explanation="Current market value minus bond balance." /> Built</span>
                    <span className="green">R{formatZAR(equityBuilt)}</span>
                  </div>
                  <div className="rvb-thick-bar">
                    <div className="rvb-fill-green" style={{ width: `${Math.min(100, (equityBuilt / Math.max(totalRentSunk, equityBuilt)) * 100)}%` }}></div>
                  </div>
                  <div className="rvb-bar-subtext">Wealth retained in property asset.</div>
                </div>
              </div>

              <div className="rvb-sub-card">
                <div className="rvb-gain-header">
                  <h4 className="rvb-sub-title rvb-m-0">
                    Net Worth <Explainer term="Horizon" explanation="A head-to-head visualization of your final, total net worth at the end of the selected timeframe based on the two different paths." />
                  </h4>
                  <div className="rvb-gain-right">
                    <div className="rvb-gain-label">The Gain</div>
                    <div className={`rvb-gain-value ${winStatusClass}`}>+ R{formatMillions(winDelta)}m</div>
                  </div>
                </div>
                
                <div className="rvb-horizon-wrapper">
                  <Bar data={horizonBarData} options={horizonBarOptions} />
                </div>

                <div className="rvb-horizon-footer">
                  <div className={`rvb-red-dot ${winStatusClass}`}></div>
                  <div>{ownershipWins ? 'Buying' : 'Renting'} allows for <strong>{wealthMultiplier}x</strong> higher wealth acceleration.</div>
                </div>
              </div>

            </div>

            {/* FOOTER */}
            <div className="rvb-footer-banner">
              <div className="rvb-footer-left">
                <Info size={16} />
                Calculations assume 6% property growth and 8% stock market return for rental delta investment.
              </div>
              <div className="rvb-footer-link" onClick={() => setShowFormulas(true)}>VIEW FORMULAS</div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default RentVsBuyModule;
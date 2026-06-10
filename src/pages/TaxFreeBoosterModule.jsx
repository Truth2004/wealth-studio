import { useState } from 'react';
import { createPortal } from 'react-dom'; 
import { Link } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, ShieldCheck, CheckCircle2, Info, ChevronRight, X, LayoutList } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import TopBar from '../components/TopBar';
import { useFinancials } from '../context/FinancialContext'; // Connected to your upgraded global state
import Explainer from '../components/Explainer';
import '../styles/TaxFree.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler);

const TaxFreeBoosterModule = () => {
  const { financials } = useFinancials();

  // === STATE ===
  const [monthlyContribution, setMonthlyContribution] = useState(3000);
  const [expectedReturn, setExpectedReturn] = useState(10);
  const [marginalTaxRate, setMarginalTaxRate] = useState(31);
  const [horizon, setHorizon] = useState(15);
  const [showFormulas, setShowFormulas] = useState(false);

  const formatZAR = (amount) => amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatMillions = (amount) => (amount / 1000000).toFixed(2);

  // === STRICT SA TAX & TFSA MATH ===
  const lifetimeLimit = 500000;
  const annualExclusionCGT = 40000;
  const cgtInclusionRate = 0.40;
  const taxDrag = 0.015; 

  // Pull existing ecosystem values dynamically from Money Snapshot
  const initialPrincipal = financials.currentTFSA || 0; 
  const remainingLifetimeRoom = Math.max(0, lifetimeLimit - initialPrincipal);

  const monthsPassed = horizon * 12;
  const monthlyRateTFSA = expectedReturn / 100 / 12;
  const monthlyRateTaxable = (expectedReturn / 100 - taxDrag) / 12;

  // 1. Calculate the capping point accounting for existing context balances
  const monthsToMax = Math.floor(remainingLifetimeRoom / monthlyContribution);
  const actualContributingMonths = Math.min(monthsPassed, monthsToMax);
  const passiveMonths = monthsPassed - actualContributingMonths;
  const totalNewContributions = actualContributingMonths * monthlyContribution;
  const totalAggregateContributions = initialPrincipal + totalNewContributions;
  const isCapped = monthsPassed > monthsToMax;

  // 2. Future Values (Upgraded to Principal + Annuity Compounding)
  const tfsaPhase1 = (initialPrincipal * Math.pow(1 + monthlyRateTFSA, actualContributingMonths)) + 
                     (monthlyContribution * ((Math.pow(1 + monthlyRateTFSA, actualContributingMonths) - 1) / monthlyRateTFSA));
                     
  const taxablePhase1 = (initialPrincipal * Math.pow(1 + monthlyRateTaxable, actualContributingMonths)) + 
                        (monthlyContribution * ((Math.pow(1 + monthlyRateTaxable, actualContributingMonths) - 1) / monthlyRateTaxable));

  const tfsaFV = tfsaPhase1 * Math.pow(1 + monthlyRateTFSA, passiveMonths);
  const taxableGrossFV = taxablePhase1 * Math.pow(1 + monthlyRateTaxable, passiveMonths);

  // 3. Liquidation Capital Gains Tax
  const taxableProfit = taxableGrossFV - totalAggregateContributions;
  const taxableCapitalGain = Math.max(0, taxableProfit - annualExclusionCGT);
  const cgtTax = taxableCapitalGain * cgtInclusionRate * (marginalTaxRate / 100);
  const finalTaxableValue = taxableGrossFV - cgtTax;

  // 4. The Results
  const taxSaved = tfsaFV - finalTaxableValue;
  const tfsaGrowth = tfsaFV - totalAggregateContributions;
  const taxableGrowthAfterTax = finalTaxableValue - totalAggregateContributions;

  // === CHART.JS DATA GENERATION ===
  const labels = [];
  const tfsaData = [];
  const taxableData = [];

  for (let year = 1; year <= horizon; year++) {
    labels.push(`Year ${year}`);
    let m = year * 12;
    let actMonths = Math.min(m, monthsToMax);
    let pasMonths = m - actMonths;
    
    let t1 = (initialPrincipal * Math.pow(1 + monthlyRateTFSA, actMonths)) + 
             (monthlyContribution * ((Math.pow(1 + monthlyRateTFSA, actMonths) - 1) / monthlyRateTFSA));
    let valTFSA = t1 * Math.pow(1 + monthlyRateTFSA, pasMonths);
    
    let tx1 = (initialPrincipal * Math.pow(1 + monthlyRateTaxable, actMonths)) + 
              (monthlyContribution * ((Math.pow(1 + monthlyRateTaxable, actMonths) - 1) / monthlyRateTaxable));
    let valTaxGross = tx1 * Math.pow(1 + monthlyRateTaxable, pasMonths);
    
    let currentNewContrib = actMonths * monthlyContribution;
    let cgt = Math.max(0, (valTaxGross - (initialPrincipal + currentNewContrib)) - annualExclusionCGT) * cgtInclusionRate * (marginalTaxRate / 100);
    
    tfsaData.push(valTFSA);
    taxableData.push(valTaxGross - cgt);
  }

  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'TFSA Value',
        data: tfsaData,
        borderColor: '#1e8e3e',
        backgroundColor: 'rgba(30, 142, 62, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: 'Taxable Account',
        data: taxableData,
        borderColor: '#9333ea',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (context) => ` R ${formatZAR(context.raw)}` }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Lexend', size: 10 } } },
      y: { display: false }
    }
  };

  return (
    <>
      <TopBar title="SIMULATION LAB - Tax-Free Booster" notifications={[]} />
      
      {showFormulas && createPortal(
        <div className="tf-modal-overlay" onClick={() => setShowFormulas(false)}>
          <div className="tf-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="tf-modal-header">
              <h2 className="tf-modal-title">Tax Mathematics (SA Law)</h2>
              <button className="tf-close-btn" onClick={() => setShowFormulas(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="tf-formula-group">
              <div className="tf-formula-desc">1. Capped Contribution Logic</div>
              <div className="tf-formula-block">
                SA Lifetime Limit = R 500,000<br/>
                Existing Accrued Balance (P) = R {formatZAR(initialPrincipal)}<br/>
                Remaining Lifetime Room = R {formatZAR(remainingLifetimeRoom)}<br/>
                Months to Cap = FLOOR({remainingLifetimeRoom} / {monthlyContribution}) = {monthsToMax} months<br/>
                {isCapped ? `Status: CAPPED (Portfolio compounds passively for final ${passiveMonths} months)` : 'Status: UNCAPPED (Within lifetime limit)'}
              </div>
            </div>

            <div className="tf-formula-group">
              <div className="tf-formula-desc">2. Capital Gains Tax (Liquidation)</div>
              <div className="tf-formula-block">
                Total Profit = Gross FV - (Initial Balance + New Contributions)<br/>
                Taxable Gain = MAX(0, Total Profit - R40,000 Annual Exclusion)<br/>
                CGT = Taxable Gain × 40% Inclusion Rate × Marginal Tax Rate ({marginalTaxRate}%)<br/><br/>
                CGT Triggered = R {formatZAR(cgtTax)}
              </div>
            </div>
          </div>
        </div>,
        document.body 
      )}

      <div className="page-content">
        <Link to="/simulation-lab" className="tf-back-link">
          <ArrowLeft className="back-arrow-icon" /> Back to Simulations
        </Link>

        {/* HEADER AREA */}
        <div className="tf-page-header">
          <div>
            <div className="tf-subtitle">WEALTH ARCHITECTURE SIMULATION</div>
            <h1 className="tf-title">
              The Tax-Free <span className="text-red">Booster</span>
            </h1>
            <p className="tf-desc">
              Visualize the mathematical phenomenon of "Tax Alpha". Compare a standard brokerage account against a <Explainer term="TFSA" explanation="Tax-Free Savings Account. A government-regulated wrapper where all interest, dividends, and capital gains are 100% tax-free." /> under strict South African tax law.
            </p>
          </div>
          <div className="tf-market-status">
            <ShieldCheck className="tf-market-icon" size={24} />
            <div>
              <div className="tf-market-label">TFSA LEGISLATION</div>
              <div className="tf-market-value">Max R36,000 / Year</div>
            </div>
          </div>
        </div>

        <div className="tf-main-grid">
          
          {/* LEFT COLUMN */}
          <div className="tf-col-left">
            <div className="tf-inputs-card">
              <div className="tf-inputs-header">
                <SlidersHorizontal size={20} color="#dc0032" />
                Scenario Inputs
              </div>
              
              <div className="tf-slider-group">
                <div className="tf-slider-labels">
                  <span className="tf-slider-title">Monthly Deposit</span>
                  <span className="tf-slider-val">R{formatZAR(monthlyContribution)}</span>
                </div>
                <input 
                  type="range" min="500" max="3000" step="100" 
                  value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="tf-range-input"
                />
              </div>

              <div className="tf-slider-group">
                <div className="tf-slider-labels">
                  <span className="tf-slider-title">Expected Market Return</span>
                  <span className="tf-slider-val">{expectedReturn}%</span>
                </div>
                <input 
                  type="range" min="6" max="15" step="1" 
                  value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="tf-range-input"
                />
              </div>

              <div className="tf-slider-group">
                <div className="tf-slider-labels">
                  <span className="tf-slider-title"><Explainer term="Marginal Tax Rate" explanation="Your personal income tax bracket. Determines your CGT weighting." /></span>
                  <span className="tf-slider-val">{marginalTaxRate}%</span>
                </div>
                <input 
                  type="range" min="18" max="45" step="1" 
                  value={marginalTaxRate} onChange={(e) => setMarginalTaxRate(Number(e.target.value))}
                  className="tf-range-input"
                />
              </div>

              <div className="tf-slider-group tf-mb-0">
                <div className="tf-slider-labels tf-mb-4">
                  <span className="tf-slider-title">Time Horizon</span>
                  <span className="tf-slider-val">{horizon} Years</span>
                </div>
                <div className="tf-pills">
                  {[5, 10, 15, 25].map(y => (
                    <button 
                      key={y} 
                      className={`tf-pill ${horizon === y ? 'active' : ''}`}
                      onClick={() => setHorizon(y)}
                    >
                      {y}Y
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="tf-advisor-card">
              <div className="tf-advisor-profile">
                <img 
  src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=150&q=80" 
  alt="Advisor" 
  className="tf-advisor-avatar" 
/>
                <div>
                  <div className="tf-advisor-role">Tax Strategist</div>
                  <h4 className="tf-advisor-name">Sipho Ndlovu</h4>
                </div>
              </div>
              <p className="tf-advisor-quote">
                "Many South Africans underestimate the drag of Dividend Withholding Tax and CGT. By shifting this R{formatZAR(monthlyContribution)} into a TFSA, you secure an automatic <span className="text-white font-bold">0%</span> tax environment."
              </p>
              <button className="tf-btn-primary">
                Open TFSA Account <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="tf-col-right">
            
            {/* TOP VERDICT */}
            <div className="tf-verdict-card">
              <div className="tf-badge">
                <CheckCircle2 size={14} /> Studio Verdict: Maximize TFSA
              </div>
              <h2 className="tf-verdict-title">The "Tax Alpha" Gap:</h2>
              <h2 className="tf-verdict-amount">
                + R{formatZAR(taxSaved)}
              </h2>
              
              <p className="tf-verdict-text-p">
                By shielding your investments from South Africa's 40% Capital Gains inclusion rate and the annual tax drags on yields, the TFSA aggressively outpaces a standard account. Over {horizon} years, the pure compounding effect of a 0% tax environment creates an additional <strong>R{formatZAR(taxSaved)}</strong> in free wealth.
              </p>
              
              <div className="tf-impact-box">
                <div className="tf-impact-header">
                  <LayoutList size={16} color="#dc0032" />
                  <h4 className="tf-impact-title">Key SA Tax Impacts</h4>
                </div>
                <ul className="tf-impact-list">
                  {isCapped ? (
                    <li><strong className="text-green">The R500k Ceiling Hit:</strong> With an existing base of R{formatZAR(initialPrincipal)} and your new contribution rate, you hit the lifetime limit in <strong>Year {(monthsToMax/12).toFixed(1)}</strong>. After this, your portfolio enters a pure, passive tax-free compounding phase.</li>
                  ) : (
                    <li><strong className="text-green">Contribution Room:</strong> You will add R{formatZAR(totalNewContributions)} in new deposits over this period, leaving room before hitting the R500,000 lifetime limit.</li>
                  )}
                  <li><strong>CGT Shield:</strong> If you liquidated the standard account at Year {horizon}, SARS would claim <strong className="text-purple">R{formatZAR(cgtTax)}</strong> in Capital Gains Tax. Your TFSA protects this entirely.</li>
                  <li><strong>Annual Tax Drag Avoided:</strong> Standard accounts lose roughly ~1.5% of growth annually to dividend and interest taxes, suppressing compound interest.</li>
                </ul>
              </div>

              {/* The Growth Curve Chart */}
              <div>
                <div className="tf-chart-header">
                  <div className="tf-chart-title">TFSA vs Taxable Divergence</div>
                  <div className="tf-chart-legend">
                    <span className="tf-legend-item"><div className="tf-legend-dot-tfsa"></div> TFSA</span>
                    <span className="tf-legend-item"><div className="tf-legend-line-taxable"></div> Taxable</span>
                  </div>
                </div>
                <div className="tf-chart-wrapper">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>

            </div>

            {/* BOTTOM SPLIT - PORTFOLIO BREAKDOWN */}
            <div className="tf-split-row">
              
              <div className="tf-sub-card">
                <h4 className="tf-sub-title">Taxable Account Build</h4>
                
                <div className="tf-bar-container">
                  <div className="tf-bar-top"><span>Total Capital Base</span><span>R{formatZAR(totalAggregateContributions)}</span></div>
                  <div className="tf-thick-bar"><div className="tf-fill-base tf-w-100"></div></div>
                </div>

                <div className="tf-bar-container">
                  <div className="tf-bar-top"><span>Growth (After Tax)</span><span className="text-purple">R{formatZAR(taxableGrowthAfterTax)}</span></div>
                  <div className="tf-thick-bar"><div className="tf-fill-growth-taxable tf-w-100"></div></div>
                </div>

                <div className="tf-bar-container tf-mb-0">
                  <div className="tf-bar-top"><span>Lost to SARS</span><span className="text-red">R{formatZAR(cgtTax)}</span></div>
                  <div className="tf-thick-bar"><div className="tf-fill-tax-loss tf-w-100"></div></div>
                </div>
              </div>

              <div className="tf-sub-card">
                <h4 className="tf-sub-title">TFSA Build</h4>
                
                <div className="tf-bar-container">
                  <div className="tf-bar-top"><span>Total Capital Base</span><span>R{formatZAR(totalAggregateContributions)}</span></div>
                  <div className="tf-thick-bar"><div className="tf-fill-base tf-w-100"></div></div>
                </div>

                <div className="tf-bar-container">
                  <div className="tf-bar-top"><span>Tax-Free Growth</span><span className="text-green">R{formatZAR(tfsaGrowth)}</span></div>
                  <div className="tf-thick-bar"><div className="tf-fill-growth-tfsa tf-w-100"></div></div>
                </div>

                <div className="tf-bar-container tf-mb-0">
                  <div className="tf-bar-top"><span>Lost to SARS</span><span className="text-green">R 0</span></div>
                  <div className="tf-thick-bar"><div className="tf-fill-protected tf-w-100">100% PROTECTED</div></div>
                </div>
              </div>

            </div>

            {/* FOOTER */}
            <div className="tf-footer-banner">
              <div className="tf-footer-left">
                <Info size={16} />
                Calculations strictly follow current South African Revenue Service (SARS) legislation.
              </div>
              <div className="tf-footer-link" onClick={() => setShowFormulas(true)}>VIEW FORMULAS</div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default TaxFreeBoosterModule;
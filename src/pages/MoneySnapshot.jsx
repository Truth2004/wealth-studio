import { useState } from 'react';
import { Database, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Info, Activity } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import TopBar from '../components/TopBar';
import { useFinancials } from '../context/FinancialContext'; 
import Explainer from '../components/Explainer';
import '../styles/MoneySnapshot.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const MoneySnapshot = () => {
  const { financials, updateFinancials } = useFinancials();

  const [inputs, setInputs] = useState({
    grossSalary: financials.grossSalary || '',
    housingCosts: financials.housingCosts || '',
    mobilityCosts: financials.mobilityCosts || '',
    lifestyleCosts: financials.lifestyleCosts || '',
    monthlyDebt: financials.monthlyDebt || '',
    totalDebt: financials.totalDebt || '', 
    currentSavings: financials.currentSavings || '',
    currentRA: financials.currentRA || '',
    targetHomePrice: financials.targetHomePrice || '',
    currentTFSA: financials.currentTFSA || '',         
    liquidInvestments: financials.liquidInvestments || '' 
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [takeHomePay, setTakeHomePay] = useState(financials.netIncome || 0);
  
  const [disposableIncome, setDisposableIncome] = useState(
    (financials.netIncome || 0) - 
    (financials.housingCosts || 0) - 
    (financials.mobilityCosts || 0) - 
    (financials.lifestyleCosts || 0) - 
    (financials.monthlyDebt || 0)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: Number(value) || '' 
    }));
  };

  const calculateSnapshot = (e) => {
    if (e) e.preventDefault();

    const gross = Number(inputs.grossSalary) || 0;
    const housing = Number(inputs.housingCosts) || 0;
    const mobility = Number(inputs.mobilityCosts) || 0;
    const lifestyle = Number(inputs.lifestyleCosts) || 0;
    const monthlyDebt = Number(inputs.monthlyDebt) || 0;
    const totalDebt = Number(inputs.totalDebt) || 0;

    let taxRate = 0;
    const annualSalary = gross * 12;
    if (annualSalary > 0) {
      if (annualSalary <= 370500) taxRate = 0.18;
      else if (annualSalary <= 512800) taxRate = 0.31; 
      else if (annualSalary <= 673000) taxRate = 0.36; 
      else taxRate = 0.39;
    }

    const estimatedTax = gross * taxRate;
    const netPay = gross - estimatedTax;
    const leftover = netPay - housing - mobility - lifestyle - monthlyDebt;

    setTakeHomePay(netPay);
    setDisposableIncome(leftover);

    updateFinancials({
      grossSalary: gross,
      housingCosts: housing,
      mobilityCosts: mobility,
      lifestyleCosts: lifestyle,
      monthlyDebt: monthlyDebt,
      totalDebt: totalDebt,
      netIncome: netPay,
      currentSavings: Number(inputs.currentSavings) || 0,
      currentRA: Number(inputs.currentRA) || 0,
      targetHomePrice: Number(inputs.targetHomePrice) || 0,
      currentTFSA: Number(inputs.currentTFSA) || 0,
      liquidInvestments: Number(inputs.liquidInvestments) || 0
    });
  };

  const formatZAR = (amount) => amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const housingValue = Number(inputs.housingCosts) || 0;
  const mobilityValue = Number(inputs.mobilityCosts) || 0;
  const lifestyleValue = Number(inputs.lifestyleCosts) || 0;
  const debtValue = Number(inputs.monthlyDebt) || 0;
  const leftoverValue = Math.max(0, disposableIncome); 

  // === KEY FINANCIAL METRICS MATH ===
  const grossVal = Number(inputs.grossSalary) || 0;
  const dtiRatio = grossVal > 0 ? ((debtValue / grossVal) * 100).toFixed(1) : 0;
  const lifestyleRate = takeHomePay > 0 ? ((lifestyleValue / takeHomePay) * 100).toFixed(1) : 0;
  const savingsRate = takeHomePay > 0 ? ((leftoverValue / takeHomePay) * 100).toFixed(1) : 0;
  const effectiveTaxRate = grossVal > 0 ? (((grossVal - takeHomePay) / grossVal) * 100).toFixed(1) : 0;

  // === DYNAMIC INSIGHTS ENGINE ===
  const generateInsights = () => {
    if (grossVal === 0) return [];
    const insights = [];

    // Tax Insight
    insights.push({
      id: 'tax',
      title: "Tax Conversion",
      desc: `Your estimated effective tax rate is ${effectiveTaxRate}%. This converts your R ${formatZAR(grossVal)} gross salary to R ${formatZAR(takeHomePay)} net monthly.`,
      type: "neutral",
      icon: <Info size={18} />
    });

    // DTI Insight
    if (dtiRatio > 36) {
      insights.push({ id: 'dti', title: "High Debt Burden", desc: `Your Debt-to-Income ratio is ${dtiRatio}%. This is considered high risk by SA lenders. The Debt Free Starter track is highly recommended.`, type: "warning", icon: <AlertTriangle size={18} /> });
    } else if (dtiRatio > 0) {
      insights.push({ id: 'dti', title: "Healthy Debt Levels", desc: `Your Debt-to-Income ratio is ${dtiRatio}%, which is well within the healthy lending threshold (< 36%).`, type: "positive", icon: <CheckCircle2 size={18} /> });
    } else {
      insights.push({ id: 'dti', title: "Zero Debt Profile", desc: `You have a 0% Debt-to-Income ratio. This is the ultimate foundation for rapid wealth building and loan approvals.`, type: "positive", icon: <CheckCircle2 size={18} /> });
    }

    // Lifestyle Insight
    if (lifestyleRate > 30) {
      insights.push({ id: 'lifestyle', title: "Lifestyle Inflation", desc: `You are allocating ${lifestyleRate}% of your net income to lifestyle, which is higher than the standard 30% baseline. Watch for lifestyle creep.`, type: "warning", icon: <AlertTriangle size={18} /> });
    } else {
      insights.push({ id: 'lifestyle', title: "Optimized Lifestyle", desc: `You are allocating ${lifestyleRate}% to lifestyle, typical for your income band and keeping you perfectly within the 50/30/20 rule.`, type: "positive", icon: <CheckCircle2 size={18} /> });
    }

    // Savings Insight
    if (savingsRate >= 20) {
      insights.push({ id: 'savings', title: "Strong Savings Velocity", desc: `Your potential savings rate is ${savingsRate}%. You have excellent free cashflow to deploy into investments or property deposits.`, type: "positive", icon: <Activity size={18} /> });
    } else {
      insights.push({ id: 'savings', title: "Low Liquidity", desc: `Your potential savings rate is only ${savingsRate}%. Consider reviewing your fixed housing and mobility costs to unlock more capital.`, type: "warning", icon: <AlertTriangle size={18} /> });
    }

    return insights;
  };

  const insightsList = generateInsights();

  const chartData = {
    labels: ['Housing', 'Mobility', 'Lifestyle', 'Debts', 'Savings'],
    datasets: [{
      data: [housingValue, mobilityValue, lifestyleValue, debtValue, leftoverValue],
      backgroundColor: ['#dc0032', '#d4af37', '#9333ea', '#1a1a1a', '#2e7d32'], 
      borderWidth: 0,
      hoverOffset: 4
    }],
  };

  const chartOptions = { cutout: '75%', maintainAspectRatio: false, plugins: { legend: { display: false } } };

  return (
    <>
      <TopBar title="MONEY SNAPSHOT" icon={<Database size={24} />} />
      <div className="page-content">
        
        <div className="snapshot-welcome">
          <h2 className="snapshot-welcome-subtitle">Your very own virtual financial sandbox</h2>
          <h1 className="snapshot-welcome-title">Welcome back, <span className="text-gold">{financials.username || 'Guest'}</span>!</h1>
          <p className="snapshot-welcome-desc">Financial architecture and disposable income analysis.</p>
        </div>

        <div className="blueprint-section">
          <div className="blueprint-header">
            <h2 className="blueprint-title">Your Blueprint Begins Here.</h2>
            <p className="blueprint-intro">
              NextGen Wealth Studio is a detailed financial sandbox designed to remove the guesswork from building wealth. Our goal is to empower you to test-drive your biggest financial decisions in a risk-free environment before committing your actual capital. By combining real-time financial data with interactive simulations and customized Strategy Tracks, we aim to help translate complex numbers into clear, actionable paths.
            </p>
          </div>
          <div className="blueprint-grid">
            <div className="blueprint-column">
              <h3>The Foundation</h3>
              <p>
                As a virtual financial sandbox, the NextGen Wealth app is designed to bridge the gap between your current reality and your ultimate goals. By recording everything from your monthly fixed costs to your high-interest debt, this tool transforms overwhelming numbers into a clear baseline. Take the first step toward controlling your capital before exploring new strategies or simulating your future.
              </p>
            </div>
            
            <div className="blueprint-column">
              <h3>The Sandbox</h3>
              <p>
                Wealth building is a discovery process. Whether you’re balancing monthly cash flow, saving for a property, or analyzing opportunity costs, we see simulation as a way to learn what works. Your net worth is more than just a static balance; it’s a living ecosystem of numbers. Seeing all these moving parts laid out transforms financial anxiety and uncertainty into strategic awareness.
              </p>
            </div>
            
            <div className="blueprint-column">
              <h3>The Impact</h3>
              <p>
                Financial freedom is built by strategy, not by chance. We aim to lead by creating a secure, intuitive space for you to explore, learn, and grow your net worth. We believe in aligning around a common vision: achieving your ultimate financial independence. We build trust through mathematical truths and foster an environment of transparency where experimenting with your financial choices is encouraged.
              </p>
            </div>
          </div>
        </div>

        {/* --- FULL WIDTH DASHBOARD METRICS ROW --- */}
        <div className="dashboard-metrics-row">
          <div className="result-card">
            <div>
              <div className="card-label">
                <Explainer 
                  term="Take Home Pay" 
                  explanation="Also known as Net Income. This is the actual cash that lands in your bank account after SARS deductions like PAYE and UIF are subtracted." 
                />
              </div>
              <h2 className="card-amount">R {formatZAR(takeHomePay)}</h2>
            </div>
            <div className="card-subtext">EST. MONTHLY AFTER TAX</div>
          </div>

          <div className="result-card primary">
            <div>
              <div className="card-label">
                <Explainer 
                  term="Disposable Income" 
                  explanation="Your financial ammunition. This is the money left over after essential needs and debts are paid. Use this pool to invest, save, or upgrade your lifestyle." 
                  isDarkTheme={true}
                />
              </div>
              <h2 className="card-amount">R {formatZAR(disposableIncome)}</h2>
            </div>
            <div className="card-subtext">LEFTOVER POOL</div>
          </div>

          <div className="result-card">
            <div>
              <div className="card-label">Debt-To-Income</div>
              <h2 className={`card-amount ${dtiRatio > 36 ? 'text-red' : ''}`}>{dtiRatio}%</h2>
            </div>
            <div className="card-subtext">RISK THRESHOLD: 36%</div>
          </div>

          <div className="result-card">
            <div>
              <div className="card-label">Savings Capacity</div>
              <h2 className={`card-amount ${savingsRate >= 20 ? 'text-green' : ''}`}>{savingsRate}%</h2>
            </div>
            <div className="card-subtext">TARGET MINIMUM: 20%</div>
          </div>
        </div>
    
        {/* --- SPLIT LAYOUT GRID --- */}
        <div className="snapshot-grid">
          
          {/* LEFT SIDE: INPUT FORM */}
          <div className="input-card h-fit">
            <h3>Input Your Financials</h3>
            <form onSubmit={calculateSnapshot}>
              <div className="form-group">
                <label>
                  <Explainer 
                    term="Monthly Gross Salary" 
                    explanation="Your total monthly earnings before tax, UI, or any other deductions are removed. This is the top-line number on your payslip." 
                  />
                </label>
                <div className="input-wrapper">
                  <span className="currency-symbol">R</span>
                  <input type="number" name="grossSalary" className="financial-input" placeholder="0.00" value={inputs.grossSalary} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Explainer 
                    term="Housing Costs" 
                    explanation="Rent, bond repayments, levies, rates, and home maintenance." 
                  />
                </label>
                <div className="input-wrapper">
                  <span className="currency-symbol">R</span>
                  <input type="number" name="housingCosts" className="financial-input" placeholder="0.00" value={inputs.housingCosts} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Explainer 
                    term="Mobility Costs" 
                    explanation="Car installments, fuel, vehicle insurance, and public transport or ride-shares." 
                  />
                </label>
                <div className="input-wrapper">
                  <span className="currency-symbol">R</span>
                  <input type="number" name="mobilityCosts" className="financial-input" placeholder="0.00" value={inputs.mobilityCosts} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Explainer 
                    term="Lifestyle Costs" 
                    explanation="Groceries, dining out, subscriptions, and entertainment." 
                  />
                </label>
                <div className="input-wrapper">
                  <span className="currency-symbol">R</span>
                  <input type="number" name="lifestyleCosts" className="financial-input" placeholder="0.00" value={inputs.lifestyleCosts} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Explainer 
                    term="Monthly Debt Installment" 
                    explanation="The minimum required payments on money you owe. This includes personal loans and credit card installments (excluding home/car loans mentioned above)." 
                  />
                </label>
                <div className="input-wrapper">
                  <span className="currency-symbol">R</span>
                  <input type="number" name="monthlyDebt" className="financial-input" placeholder="0.00" value={inputs.monthlyDebt} onChange={handleChange} />
                </div>
              </div>

              <div 
                className="advanced-toggle-btn"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Optional: Advanced Goals
              </div>

              {showAdvanced && (
                <div className="advanced-inputs-panel">
                  <div className="form-group">
                    <label>
                      <Explainer 
                        term="Total Outstanding Debt" 
                        explanation="The complete overall balance you still owe across all loans combined (credit cards, personal loans, car loans). This dictates your timeline to freedom." 
                      />
                    </label>
                    <div className="input-wrapper">
                      <span className="currency-symbol">R</span>
                      <input type="number" name="totalDebt" className="financial-input" placeholder="0.00" value={inputs.totalDebt} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <Explainer 
                        term="Total Current Savings" 
                        explanation="Liquid cash readily available in a savings or checking account. This acts as your emergency fund buffer." 
                      />
                    </label>
                    <div className="input-wrapper">
                      <span className="currency-symbol">R</span>
                      <input type="number" name="currentSavings" className="financial-input" placeholder="0.00" value={inputs.currentSavings} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <Explainer 
                        term="Existing TFSA Balance" 
                        explanation="The total amount of money you currently have sitting inside all Tax-Free Savings Accounts combined. Helps gauge your remaining lifetime limit allowance." 
                      />
                    </label>
                    <div className="input-wrapper">
                      <span className="currency-symbol">R</span>
                      <input type="number" name="currentTFSA" className="financial-input" placeholder="0.00" value={inputs.currentTFSA} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <Explainer 
                        term="Taxable Investments" 
                        explanation="Total value of standard trading portfolios, shares, and ETFs held outside of retirement and tax-free structures. Vulnerable to regular tax drag." 
                      />
                    </label>
                    <div className="input-wrapper">
                      <span className="currency-symbol">R</span>
                      <input type="number" name="liquidInvestments" className="financial-input" placeholder="0.00" value={inputs.liquidInvestments} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <Explainer 
                        term="Current Monthly RA" 
                        explanation="Money you deposit into a Retirement Annuity each month. These contributions are tax-deductible up to 27.5% of your income." 
                      />
                    </label>
                    <div className="input-wrapper">
                      <span className="currency-symbol">R</span>
                      <input type="number" name="currentRA" className="financial-input" placeholder="0.00" value={inputs.currentRA} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group mb-0">
                    <label>Target Home Price</label>
                    <div className="input-wrapper">
                      <span className="currency-symbol">R</span>
                      <input type="number" name="targetHomePrice" className="financial-input" placeholder="0.00" value={inputs.targetHomePrice} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="calc-button">Calculate Snapshot</button>
            </form>
          </div>

          {/* RIGHT SIDE: ANALYTICS & INSIGHTS */}
          <div className="results-column">
            
            <div className="chart-card">
              <h3>Spending Distribution</h3>
              <div className="chart-layout">
                <div className="chart-container">
                  {takeHomePay > 0 ? (
                    <Doughnut data={chartData} options={chartOptions} />
                  ) : (
                    <div className="chart-empty-state">
                      Calculate to see breakdown
                    </div>
                  )}
                </div>

                <div className="chart-breakdown">
                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <div className="color-dot bg-housing"></div>
                      <span className="breakdown-label text-housing">Housing</span>
                    </div>
                    <span className="breakdown-amount">R {formatZAR(housingValue)}</span>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <div className="color-dot bg-mobility"></div>
                      <span className="breakdown-label text-mobility">Mobility</span>
                    </div>
                    <span className="breakdown-amount">R {formatZAR(mobilityValue)}</span>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <div className="color-dot bg-lifestyle"></div>
                      <span className="breakdown-label text-lifestyle">Lifestyle</span>
                    </div>
                    <span className="breakdown-amount">R {formatZAR(lifestyleValue)}</span>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <div className="color-dot bg-debt"></div>
                      <span className="breakdown-label text-debt">Debt Obligations</span>
                    </div>
                    <span className="breakdown-amount">R {formatZAR(debtValue)}</span>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <div className="color-dot bg-savings"></div>
                      <span className="breakdown-label text-savings">Disposable / Savings</span>
                    </div>
                    <span className="breakdown-amount">R {formatZAR(leftoverValue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PREMIUM EXECUTIVE SUMMARY */}
            {insightsList.length > 0 && (
              <div className="executive-insights-card">
                <div className="executive-header">
                  <h3 className="executive-title">Executive Summary</h3>
                  <span className="executive-subtitle">Automated Audit</span>
                </div>
                <div className="executive-list">
                  {insightsList.map(insight => (
                    <div key={insight.id} className={`executive-item type-${insight.type}`}>
                      <div className="executive-icon-wrapper">{insight.icon}</div>
                      <div className="executive-content">
                        <div className="executive-item-title">{insight.title}</div>
                        <div className="executive-item-desc">{insight.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default MoneySnapshot;
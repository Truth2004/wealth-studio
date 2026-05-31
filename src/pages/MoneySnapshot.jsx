import { useState } from 'react';
import { Database, ChevronDown, ChevronUp } from 'lucide-react';
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
    fixedCosts: financials.fixedCosts || '',
    monthlyDebt: financials.monthlyDebt || '',
    currentSavings: financials.currentSavings || '',
    currentRA: financials.currentRA || '',
    targetHomePrice: financials.targetHomePrice || ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [takeHomePay, setTakeHomePay] = useState(financials.netIncome || 0);
  const [disposableIncome, setDisposableIncome] = useState(
    (financials.netIncome || 0) - (financials.fixedCosts || 0) - (financials.monthlyDebt || 0)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: Number(value) || '' 
    }));
  };

  const calculateSnapshot = (e) => {
    e.preventDefault();

    const gross = Number(inputs.grossSalary) || 0;
    const fixed = Number(inputs.fixedCosts) || 0;
    const debt = Number(inputs.monthlyDebt) || 0;

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
    const leftover = netPay - fixed - debt;

    setTakeHomePay(netPay);
    setDisposableIncome(leftover);

    updateFinancials({
      grossSalary: gross,
      fixedCosts: fixed,
      monthlyDebt: debt,
      netIncome: netPay,
      currentSavings: Number(inputs.currentSavings) || 0,
      currentRA: Number(inputs.currentRA) || 0,
      targetHomePrice: Number(inputs.targetHomePrice) || 0
    });
  };

  const formatZAR = (amount) => amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const needsValue = Number(inputs.fixedCosts) || 0;
  const debtValue = Number(inputs.monthlyDebt) || 0;
  const leftoverValue = Math.max(0, disposableIncome); 

  const chartData = {
    labels: ['Needs', 'Debts', 'Leftover'],
    datasets: [{
      data: [needsValue, debtValue, leftoverValue],
      backgroundColor: ['#dc0032', '#d4af37', '#00a2e8'],
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
                As a virtual financial sandbox, the NextGen Wealth app is designed to bridge the gap between your current reality and your ultimate goals. By recording everything from your monthly fixed costs to your high-interest debt, this tool transforms overwhelming numbers into a clear baseline. Take the first step toward controlling your capital before exploring new strategies or simulating your future. We thrive on data-driven planning and believe the best outcomes come from fully understanding your exact starting point.
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
    

        <div className="snapshot-grid">
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
                    term="Total Fixed Costs" 
                    explanation="Essential recurring expenses you must pay every month to survive. This includes rent, groceries, electricity, and basic insurance." 
                  />
                </label>
                <div className="input-wrapper">
                  <span className="currency-symbol">R</span>
                  <input type="number" name="fixedCosts" className="financial-input" placeholder="0.00" value={inputs.fixedCosts} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Explainer 
                    term="Total Monthly Debt" 
                    explanation="The minimum required payments on money you owe. This includes personal loans, vehicle finance, and minimum credit card installments." 
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
                        term="Current Monthly RA Contribution" 
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
                    <div className="color-dot bg-needs"></div>
                    <span className="breakdown-label">Essential Costs (Needs)</span>
                  </div>
                  <span className="breakdown-amount">R {formatZAR(needsValue)}</span>
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
                    <div className="color-dot bg-leftover"></div>
                    <span className="breakdown-label text-leftover">Disposable / Savings</span>
                  </div>
                  <span className="breakdown-amount">R {formatZAR(leftoverValue)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default MoneySnapshot;
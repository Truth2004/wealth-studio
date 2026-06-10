import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, ArrowLeft, Info, SlidersHorizontal } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import TopBar from '../components/TopBar';
import Explainer from '../components/Explainer';
import '../styles/SimulationModule.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CarVsInvestModule = () => {
  const [carPrice, setCarPrice] = useState(300000);
  const [loanTerm, setLoanTerm] = useState(72);

  const interestRate = 0.1175; 
  const investRate = 0.10; 
  const depreciationRate = 0.15; 

  const formatZAR = (amount) => amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const monthlyInterestRate = interestRate / 12;
  const monthlyPayment = (carPrice * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -loanTerm));

  const labels = ['YR 1', 'YR 2', 'YR 3', 'YR 4', 'YR 5'];
  const carValues = [];
  const investValues = [];

  let currentCarValue = carPrice;
  let currentInvestValue = 0;

  for (let year = 1; year <= 5; year++) {
    currentCarValue = currentCarValue * (1 - depreciationRate);
    carValues.push(currentCarValue);

    for (let month = 1; month <= 12; month++) {
      currentInvestValue = (currentInvestValue + monthlyPayment) * (1 + (investRate / 12));
    }
    investValues.push(currentInvestValue);
  }

  const totalPaid5Years = monthlyPayment * 60;
  const finalCarValue = carValues[4];
  const finalInvestValue = investValues[4];
  const opportunityCost = finalInvestValue - finalCarValue;


  const dynamicNotifications = [];
  
  if (carPrice >= 1000000) {
    dynamicNotifications.push({
      title: 'Luxury Asset Warning',
      message: 'Vehicles over R1M experience aggressive initial depreciation and higher insurance premiums.'
    });
  }
  if (loanTerm > 60) {
    dynamicNotifications.push({
      title: 'Extended Loan Term',
      message: 'Loan terms beyond 60 months significantly increase your total interest paid to the bank.'
    });
  }
  if (opportunityCost >= 500000) {
    dynamicNotifications.push({
      title: 'High Opportunity Cost',
      message: `You are sacrificing over R ${formatZAR(500000)} in potential compounding wealth.`
    });
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Car Value',
        data: carValues,
        backgroundColor: '#ffb3c1', 
        borderRadius: 4,
      },
      {
        label: 'Investment Value',
        data: investValues,
        backgroundColor: '#dc0032', 
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { boxWidth: 12, usePointStyle: true, pointStyle: 'rect' }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` R ${formatZAR(context.raw)}`
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { display: true, color: '#f4f4f5' }, 
        border: { display: false }, 
        ticks: { callback: (value) => `R${value / 1000}k` } 
      },
      x: { 
        grid: { display: false }, 
        border: { display: false } 
      }
    }
  };

  return (
    <>
      <TopBar 
        title="SIMULATION LAB - Luxury Car vs Invest the Difference" 
        icon={<FlaskConical className="header-icon" />} 
        notifications={dynamicNotifications}
      />
      <div className="page-content">
        
        <Link to="/simulation-lab" className="sim-back-link">
          <ArrowLeft className="back-arrow-icon" /> Back to Simulations
        </Link>

        <div className="module-header-container">
          <div className="module-subtitle">Your very own virtual financial sandbox</div>
          <h1 className="module-title">
            <span className="text-gold">Luxury</span> Car vs <br/>Invest the <span className="text-gold">Difference.</span>
          </h1>
          <p className="module-desc">
            Wireframe analysis of <Explainer term="capital allocation" explanation="The strategic process of deciding where to put your money (e.g., buying a car vs. investing in stocks) to achieve your financial goals." />: <Explainer term="Depreciating Asset" explanation="An item that actively loses value over time. Vehicles are notoriously fast-depreciating assets." /> vs <Explainer term="Compounding" explanation="When your investment earnings generate their own earnings. Over time, this creates massive exponential growth." /> Market Instrument.
          </p>
        </div>

        <div className="module-layout-split">
          
          <div className="controls-column">
            <div className="control-card">
              
              {/* NEW SCENARIO INPUTS HEADER */}
              <div className="module-inputs-header">
                <SlidersHorizontal size={20} color="#dc0032" />
                Scenario Inputs
              </div>

              <div className="control-group">
                <div className="control-label-row">
                  <span className="control-label">Car Purchase Price</span>
                  <span className="control-value">R {formatZAR(carPrice)}</span>
                </div>
                <input 
                  type="range" 
                  min="100000" 
                  max="1500000" 
                  step="50000" 
                  value={carPrice} 
                  onChange={(e) => setCarPrice(Number(e.target.value))}
                  className="custom-slider"
                />
                <div className="slider-limits">
                  <span>R 100K</span>
                  <span>R 1.5M</span>
                </div>
              </div>

              <div className="control-group control-separator">
                <div className="control-label-row">
                  <span className="control-label">Loan Term (Months)</span>
                </div>
                <div className="input-wrapper">
                  <input 
                    type="number" 
                    value={loanTerm} 
                    onChange={(e) => setLoanTerm(Number(e.target.value) || 0)}
                    className="number-input"
                  />
                  <div className="input-suffix">MO</div>
                </div>
              </div>

              <div className="info-box">
                <Info className="info-icon" />
                <div>
                  <span className="info-text-label">Market Context</span>
                  <span className="info-text-value">
                    <Explainer term="SA Prime Lending Rate" explanation="The benchmark interest rate at which South African banks lend to their most favored clients. Most car loans are linked to this rate." />: 11.75%
                  </span>
                </div>
              </div>
            </div>

            <div className="verdict-card">
              <div className="verdict-title">Studio Verdict</div>
              <p className="verdict-text">
                By purchasing the R {formatZAR(carPrice)} vehicle, you are committing to a monthly payment of <span className="verdict-highlight">R {formatZAR(monthlyPayment)}</span>. 
                <br/><br/>
                If you instead invested that identical monthly amount into an <Explainer term="index fund" explanation="A low-cost investment portfolio that tracks a broad market index, like the JSE Top 40 or the S&P 500, offering instant diversification." /> returning 10%, you would possess <span className="verdict-highlight">R {formatZAR(opportunityCost)}</span> more in total wealth after 5 years.
              </p>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title">
                <Explainer term="Opportunity Cost" explanation="The potential financial benefit you lose out on when choosing to buy the car instead of investing." /> Projection
              </div>
              <div className="chart-subtitle">Asset Value vs Portfolio Growth (60 Mo)</div>
            </div>
            <div className="chart-container">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

        </div>

        <div className="breakdown-card">
          <div className="breakdown-title">Simulation Breakdown (5 Year Mark)</div>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <div className="breakdown-label">
                <Explainer term="Total Capital Deployed" explanation="The absolute total amount of cash that left your bank account over the 5 years (Monthly Payment × 60 months)." />
              </div>
              <div className="breakdown-value">R {formatZAR(totalPaid5Years)}</div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-label">Remaining Car Value</div>
              <div className="breakdown-value red">R {formatZAR(finalCarValue)}</div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-label">Index Fund Value</div>
              <div className="breakdown-value green">R {formatZAR(finalInvestValue)}</div>
            </div>
            <div className="breakdown-item dark">
              <div className="breakdown-label dark">
                <Explainer 
                  term="Net Wealth Difference" 
                  explanation="The final mathematical difference in your net worth depending on which path you choose. This is the true cost of the vehicle." 
                  isDarkTheme={true} 
                />
              </div>
              <div className="breakdown-value gold">+ R {formatZAR(opportunityCost)}</div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default CarVsInvestModule;
const categories = [
  'Stock Market Data',
  'Energy',
  'Precious & Industrial Metals',
  'Agriculture & Soft Commodities',
  'Currencies & FX',
  'Fixed Income & Credit',
  'Trade & Global Supply Chains',
  'Macroeconomic Indicators',
  'Banking & Financial Health',
  'Corporate Fundamentals',
  'Real Estate & Housing',
  'Alternative & Geospatial Data',
  'Energy Transition & ESG',
  'Policy, News & Events',
  'Metadata & Quality'
];

const examplePlots = {
  'Stock Market Data': [
    'Index level with 30/200-day moving averages',
    'Sector normalized cumulative returns vs benchmark',
    'Intraday candlestick & volume (selected ticker)'
  ],
  'Energy': [
    'Crude oil production vs consumption (monthly)',
    'Weekly inventory levels (U.S.)',
    'Brent vs WTI spread over time'
  ],
  'Precious & Industrial Metals': [
    'Spot price and rolling returns (gold, silver, copper)',
    'Exchange warehouse stocks vs price'
  ],
  'Agriculture & Soft Commodities': [
    'Crop production vs stocks-to-use ratio',
    'Futures curve and roll yield'
  ],
  'Currencies & FX': [
    'Spot FX heatmap (percent change)',
    'Real effective exchange rate with policy rate overlay'
  ],
  'Fixed Income & Credit': [
    'Yield curve snapshot and time-series of 2y/10y/30y',
    'Corporate spread vs sovereign'
  ],
  'Trade & Global Supply Chains': [
    'Monthly export/import by commodity',
    'Freight rate indices (Baltic Dry)'
  ],
  'Macroeconomic Indicators': [
    'Quarterly GDP YoY and QoQ',
    'CPI monthly and core vs headline'
  ],
  'Banking & Financial Health': [
    'Non-performing loans ratio',
    'Domestic credit to private sector (YoY)'
  ],
  'Corporate Fundamentals': [
    'Revenue & net income (quarterly) with margins',
    'EPS vs consensus beats over time'
  ],
  'Real Estate & Housing': [
    'Housing starts and permits',
    'House Price Index and affordability'
  ],
  'Alternative & Geospatial Data': [
    'Nightlight radiance index by region',
    'Vessel traffic counts and AIS heatmap'
  ],
  'Energy Transition & ESG': [
    'Renewable capacity installed (annual)',
    'CO2 emissions by sector'
  ],
  'Policy, News & Events': [
    'Policy rate timeline with event markers',
    'Daily news event counts and sentiment'
  ],
  'Metadata & Quality': [
    'Data latency timeline per source',
    'Missing-data heatmap (series × time)'
  ]
};

const $ = (selector, root = document) => root.querySelector(selector);
const tabs = $('#tabs');
const content = $('#content');
let plotContainer = null;
function makeTab(name, idx){
  const btn = document.createElement('button');
  btn.className = 'tab';
  btn.textContent = name;
  btn.onclick = ()=>{document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); btn.classList.add('active'); showContent(name)};
  if(idx===0) btn.classList.add('active');
  return btn;
}

function showContent(name){
  content.innerHTML = '';
  const h = document.createElement('h2'); h.textContent = name; content.appendChild(h);
  if(name === 'Stock Market Data' && plotContainer){
    content.appendChild(plotContainer);
  }
}

// build tabs
categories.forEach((c,i)=>tabs.appendChild(makeTab(c,i)));
// show first
showContent(categories[0]);

// Keep every plot's defaults together so adding or tuning a plot stays readable.
const PLOT_CONFIGS = [
  {id: 'plot-one', label: 'Long-Term SPY Plot', title: 'SPY Closing Price Over 10 Years (2016 to 2026)', symbols: ['SPY'], start: '2016-01-01', end: '2026-09-06'},
  {id: 'plot-two', label: 'Big-Cap Tech Comparison', title: '7 Big-Cap Tech Stocks vs SPY Over 5 Years (2021 to 2026)', symbols: ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'SPY'], start: '2021-01-01', end: '2026-09-06'}
];

plotContainer = $('#plot-container');
PLOT_CONFIGS.forEach((config) => plotContainer.appendChild(new PlotCard(config).element));
showContent(categories[0]);

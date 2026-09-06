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
const plotCards = [];
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
  const headingRow = document.createElement('div');
  headingRow.className = 'content-heading-row';
  const h = document.createElement('h2'); h.textContent = name === 'Stock Market Data' ? 'Stock Market Price Data' : name; headingRow.appendChild(h);
  if(name === 'Stock Market Data'){
    const sourceUrl = document.createElement('div');
    sourceUrl.className = 'market-source-url';
    sourceUrl.textContent = 'url: https://query1.finance.yahoo.com/v7/finance/download/{symbol}?period1={period1}&period2={period2}&interval=1d&events=history&includeAdjustedClose=true';
    const lastUpdated = document.createElement('div');
    lastUpdated.className = 'market-last-updated';
    lastUpdated.textContent = 'Last updated: Sep 2026';
    content.appendChild(headingRow);
    content.appendChild(lastUpdated);
    content.appendChild(sourceUrl);
  } else {
    content.appendChild(headingRow);
  }
  if(name === 'Stock Market Data'){
    const executeAll = document.createElement('button');
    executeAll.id = 'execute-all';
    executeAll.className = 'tab';
    executeAll.type = 'button';
    executeAll.textContent = 'Execute All';
    executeAll.addEventListener('click', async () => {
      executeAll.disabled = true;
      executeAll.textContent = 'Executing...';
      await Promise.all(plotCards.map((plotCard) => plotCard.execute()));
      executeAll.disabled = false;
      executeAll.textContent = 'Execute All';
    });
    headingRow.appendChild(executeAll);
  }
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
  {id: 'plot-one', label: 'Title', title: 'SPY Closing Price Over 10 Years (2016 to 2026)', symbols: ['SPY'], start: '2016-01-01', end: '2026-09-06'},
  {id: 'plot-two', label: 'Title', title: 'Big-Cap Technology Stocks vs SPY Over 5 Years (2021 to 2026)', symbols: ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'SPY'], start: '2021-01-01', end: '2026-09-06'},
  {id: 'plot-three', label: 'Title', title: 'Big-Cap Financial Stocks vs SPY Over 5 Years (2021 to 2026)', symbols: ['JPM', 'BAC', 'GS', 'MS', 'C', 'V', 'MA', 'SPY'], start: '2021-01-01', end: '2026-09-06'},
  {id: 'plot-four', label: 'Title', title: 'Big-Cap Industrial Stocks vs SPY Over 5 Years (2021 to 2026)', symbols: ['CAT', 'GE', 'HON', 'UNP', 'RTX', 'DE', 'UPS', 'SPY'], start: '2021-01-01', end: '2026-09-06'},
  {id: 'plot-five', label: 'Title', title: 'Big-Cap Consumer Cyclical Stocks vs SPY Over 5 Years (2021 to 2026)', symbols: ['TSLA', 'AMZN', 'HD', 'MCD', 'NKE', 'LOW', 'TJX', 'SPY'], start: '2021-01-01', end: '2026-09-06'},
  {id: 'plot-six', label: 'Title', title: 'Big-Cap Healthcare Stocks vs SPY Over 5 Years (2021 to 2026)', symbols: ['LLY', 'UNH', 'JNJ', 'ABBV', 'MRK', 'PFE', 'TMO', 'SPY'], start: '2021-01-01', end: '2026-09-06'},
  {id: 'plot-seven', label: 'Title', title: 'Big-Cap Communication Services Stocks vs SPY Over 5 Years (2021 to 2026)', symbols: ['META', 'GOOG', 'NFLX', 'DIS', 'CMCSA', 'T', 'VZ', 'SPY'], start: '2021-01-01', end: '2026-09-06'},
  {id: 'plot-eight', label: 'Title', title: 'Big-Cap Energy Stocks vs SPY Over 5 Years (2021 to 2026)', symbols: ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'OXY', 'PSX', 'SPY'], start: '2021-01-01', end: '2026-09-06'},
  {id: 'plot-nine', label: 'Title', title: 'Big-Cap Consumer Defensive Stocks vs SPY Over 5 Years (2021 to 2026)', symbols: ['WMT', 'COST', 'PG', 'KO', 'PEP', 'PM', 'MO', 'SPY'], start: '2021-01-01', end: '2026-09-06'},
  {id: 'plot-ten', label: 'Title', title: 'Big-Cap Basic Materials Stocks vs SPY Over 5 Years (2021 to 2026)', symbols: ['LIN', 'SHW', 'APD', 'ECL', 'NEM', 'FCX', 'NUE', 'SPY'], start: '2021-01-01', end: '2026-09-06'},
  {id: 'plot-eleven', label: 'Title', title: 'Big-Cap Real Estate Stocks vs SPY Over 5 Years (2021 to 2026)', symbols: ['PLD', 'AMT', 'EQIX', 'CCI', 'SPG', 'O', 'PSA', 'SPY'], start: '2021-01-01', end: '2026-09-06'},
  {id: 'plot-twelve', label: 'Title', title: 'Big-Cap Utilities Stocks vs SPY Over 5 Years (2021 to 2026)', symbols: ['NEE', 'DUK', 'SO', 'AEP', 'SRE', 'D', 'EXC', 'SPY'], start: '2021-01-01', end: '2026-09-06'}
];

plotContainer = $('#plot-container');
PLOT_CONFIGS.forEach((config) => {
  const plotCard = new PlotCard(config);
  plotCards.push(plotCard);
  plotContainer.appendChild(plotCard.element);
});
showContent(categories[0]);

let addedPlotNumber = 1;
$('#add-plot').addEventListener('click', () => {
  const config = {
    id: `plot-added-${addedPlotNumber}`,
    label: 'Title',
    title: 'New Stock Price Plot',
    symbols: ['SPY'],
    start: '2021-01-01',
    end: '2026-09-06'
  };
  addedPlotNumber += 1;
  const plotCard = new PlotCard(config);
  plotCards.push(plotCard);
  plotContainer.appendChild(plotCard.element);
});

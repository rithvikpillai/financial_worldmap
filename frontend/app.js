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

function $(sel){return document.querySelector(sel)}
const tabs = $('#tabs');
const content = $('#content');
const controlsEl = $('#controls');
const originalControlsParent = controlsEl.parentNode;
const originalControlsNextSibling = controlsEl.nextSibling;
const plotContainerEl = $('#plot-container');
const originalPlotParent = plotContainerEl.parentNode;
const originalPlotNextSibling = plotContainerEl.nextSibling;
// Load tickers from a local CSV file (`frontend/data/tickers.csv`) with a fallback list
const suggestionsEl = $('#ticker-suggestions');
const toggleBtn = $('#ticker-toggle');
const selectedTickersEl = $('#selected-tickers') || (() => {
  const el = document.createElement('div');
  el.id = 'selected-tickers';
  el.className = 'selected-tickers';
  el.setAttribute('aria-live', 'polite');
  const input = $('#ticker');
  if(input && input.parentNode){
    input.parentNode.insertBefore(el, input);
  }
  return el;
})();
let tickers = [];
const selectedTickers = [];
const CHIP_COLORS = ['#d62728','#1f77b4','#2ca02c','#ff7f0e','#9467bd','#17becf','#8c564b','#e377c2','#bcbd22','#7f7f7f'];
const FALLBACK_TICKERS = [
  {symbol:'SPY', name:'SPDR S&P 500'},
  {symbol:'AAPL', name:'Apple Inc.'},
  {symbol:'MSFT', name:'Microsoft Corp.'},
  {symbol:'GOOG', name:'Alphabet Inc.'},
  {symbol:'GOOGL', name:'Alphabet Class A'},
  {symbol:'AMZN', name:'Amazon.com Inc.'},
  {symbol:'TSLA', name:'Tesla, Inc.'},
  {symbol:'NVDA', name:'NVIDIA Corp.'},
  {symbol:'BRK.B', name:'Berkshire Hathaway'},
  {symbol:'JPM', name:'JPMorgan Chase & Co.'},
  {symbol:'BAC', name:'Bank of America Corp.'},
  {symbol:'WMT', name:'Walmart Inc.'},
  {symbol:'DIS', name:'Walt Disney Co.'},
  {symbol:'NFLX', name:'Netflix, Inc.'},
  {symbol:'INTC', name:'Intel Corp.'},
  {symbol:'CSCO', name:'Cisco Systems'},
  {symbol:'XOM', name:'Exxon Mobil Corp.'},
  {symbol:'CVX', name:'Chevron Corp.'},
  {symbol:'PFE', name:'Pfizer Inc.'},
  {symbol:'MRK', name:'Merck & Co.'},
  {symbol:'IBM', name:'IBM'},
  {symbol:'V', name:'Visa Inc.'},
  {symbol:'MA', name:'Mastercard Inc.'},
  {symbol:'ADBE', name:'Adobe Inc.'},
  {symbol:'PYPL', name:'PayPal Holdings'}
];

async function loadTickers(){
  try{
    const resp = await fetch('data/tickers.csv');
    if(!resp.ok){
      console.warn('Local tickers.csv not found, using fallback list');
      tickers = FALLBACK_TICKERS.slice();
      return;
    }
    const text = await resp.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    // remove header if present
    if(lines[0].toLowerCase().startsWith('symbol')) lines.shift();
    tickers = lines.map(l=>{
      // split on first comma to allow names containing commas
      const idx = l.indexOf(',');
      if(idx === -1) return {symbol: l.trim(), name: ''};
      const sym = l.slice(0, idx).replace(/^"|"$/g,'').trim();
      const name = l.slice(idx+1).replace(/^"|"$/g,'').trim();
      return {symbol: sym, name};
    });
    console.log('Loaded tickers from data/tickers.csv count=', tickers.length);
  }catch(e){
    console.error('Failed to load local tickers.csv', e);
    tickers = FALLBACK_TICKERS.slice();
  }
}

// Move suggestions list to document.body to avoid clipping by parent containers
function detachSuggestionsToBody(){
  if(suggestionsEl && suggestionsEl.parentNode !== document.body){
    document.body.appendChild(suggestionsEl);
    // use fixed positioning to avoid being covered by other positioned parents
    suggestionsEl.style.position = 'fixed';
    suggestionsEl.style.zIndex = 10000;
    suggestionsEl.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
    suggestionsEl.style.background = '#ffffff';
    suggestionsEl.style.borderRadius = '4px';
    suggestionsEl.style.maxHeight = '300px';
    suggestionsEl.style.overflow = 'auto';
    suggestionsEl.style.padding = '0';
    suggestionsEl.style.margin = '0';
    suggestionsEl.style.border = '1px solid #000';
  }
}

function positionSuggestions(){
  const rect = tickerInput.getBoundingClientRect();
  // when fixed, use viewport coordinates directly
  suggestionsEl.style.left = rect.left + 'px';
  suggestionsEl.style.top = (rect.bottom + 6) + 'px';
  suggestionsEl.style.minWidth = rect.width + 'px';
  suggestionsEl.style.width = rect.width + 'px';
  suggestionsEl.style.overflowY = 'auto';
  // ensure scrollbar shows if needed
  suggestionsEl.style.maxHeight = '360px';
  try{ suggestionsEl.scrollTop = 0; }catch(e){}
}

function parseTickerSelection(raw){
  if(!raw) return [];
  return [...new Set(raw.split(',').map(part => part.trim()).filter(Boolean))];
}

function getSelectedTickers(){
  return [...selectedTickers];
}

function getTickerColor(symbol){
  const total = symbol.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return CHIP_COLORS[total % CHIP_COLORS.length];
}

function renderSelectedTickers(){
  if(!selectedTickersEl) return;
  selectedTickersEl.innerHTML = '';
  if(!selectedTickers.length){
    selectedTickersEl.hidden = true;
    return;
  }
  selectedTickersEl.hidden = false;
  selectedTickers.forEach((symbol) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'selected-ticker-chip';
    chip.textContent = symbol;
    const color = getTickerColor(symbol);
    chip.style.borderColor = color;
    chip.style.color = color;
    chip.style.background = `${color}20`;
    chip.title = `Remove ${symbol}`;
    chip.addEventListener('click', () => {
      const idx = selectedTickers.indexOf(symbol);
      if(idx >= 0){
        selectedTickers.splice(idx, 1);
      }
      renderSelectedTickers();
      showTickerSuggestions(tickerInput.value);
    });
    selectedTickersEl.appendChild(chip);
  });
}

function addTickerSelection(symbol){
  const normalized = symbol.toUpperCase();
  const idx = selectedTickers.indexOf(normalized);
  if(idx >= 0){
    selectedTickers.splice(idx, 1);
  } else {
    selectedTickers.unshift(normalized);
  }
  tickerInput.value = '';
  renderSelectedTickers();
  showTickerSuggestions('');
  tickerInput.focus();
}

function showTickerSuggestions(filter){
  suggestionsEl.innerHTML='';
  if(!filter) filter='';
  const q = filter.trim().toUpperCase();
  const selected = getSelectedTickers().map(s => s.toUpperCase());
  // If empty query, show first 50 tickers directly to avoid unexpected filter behavior
  let matches = [];
  if(q === ''){
    matches = tickers.slice(0, 50);
  } else {
    matches = tickers.filter(t=> t.symbol.toUpperCase().includes(q) || t.name.toUpperCase().includes(q)).slice(0,50);
  }
  console.log('showTickerSuggestions matches=', matches.length);
  if(matches.length===0){ suggestionsEl.hidden = true; return }
  const ordered = [...matches].sort((a, b) => {
    const aSelected = selected.includes(a.symbol.toUpperCase()) ? 0 : 1;
    const bSelected = selected.includes(b.symbol.toUpperCase()) ? 0 : 1;
    if(aSelected !== bSelected) return aSelected - bSelected;
    return 0;
  });
  ordered.forEach(m=>{
    const li = document.createElement('li');
    const isSelected = selected.includes(m.symbol.toUpperCase());
    li.textContent = `${m.symbol} — ${m.name}`;
    li.dataset.symbol = m.symbol;
    if(isSelected){
      li.style.fontWeight = '700';
      li.style.background = '#f2f2f2';
    }
    suggestionsEl.appendChild(li);
  });
  // ensure suggestions are visible and positioned
  detachSuggestionsToBody();
  // ensure any inline display override shows the list when requested
  suggestionsEl.style.display = 'block';
  positionSuggestions();

  // DEBUG: log layout & sizing info for inspection
  try{
    const box = suggestionsEl;
    console.log('DEBUG: suggestions scroll/client:', box.scrollHeight, '/', box.clientHeight);
    console.log('DEBUG: suggestions rect:', box.getBoundingClientRect());
    const items = box.querySelectorAll('li');
    console.log('DEBUG: items count:', items.length);
    if(items.length>0){
      console.log('DEBUG: first item rect:', items[0].getBoundingClientRect());
    }
    if(items.length>1){
      console.log('DEBUG: second item rect:', items[1].getBoundingClientRect());
    }
    if(items.length>2){
      console.log('DEBUG: last item rect:', items[items.length-1].getBoundingClientRect());
    }
    if(items.length>0){
      const csItem = getComputedStyle(items[0]);
      console.log('DEBUG: first item computed:', csItem.display, csItem.height, csItem.visibility, csItem.opacity, csItem.fontSize);
    }
    const cs = getComputedStyle(box);
    console.log('DEBUG: box computed overflowY/zIndex/maxHeight:', cs.overflowY, cs.zIndex, cs.maxHeight);
  }catch(e){ console.error('DEBUG log failed', e); }

  suggestionsEl.hidden = false;
  tickerInput.setAttribute('aria-expanded', 'true');
}

function closeSuggestions(){
  if(!suggestionsEl.hidden){
    suggestionsEl.hidden = true;
    // also remove any inline display so CSS [hidden] rules reliably hide it
    try{ suggestionsEl.style.display = 'none'; }catch(e){}
    tickerInput.setAttribute('aria-expanded', 'false');
  }
}

// hook up input events
const tickerInput = $('#ticker');
selectedTickers.push('SPY');
renderSelectedTickers();
tickerInput.addEventListener('input', ()=> showTickerSuggestions(tickerInput.value));
// Open suggestions when the input is clicked (not on focus) to avoid reopening during tab switches
tickerInput.addEventListener('click', ()=> showTickerSuggestions(tickerInput.value));
suggestionsEl.addEventListener('click', (ev)=>{
  const li = ev.target.closest('li');
  if(li && li.dataset && li.dataset.symbol){
    ev.stopPropagation();
    addTickerSelection(li.dataset.symbol);
  }
});
document.addEventListener('click', (ev)=>{ if(!ev.target.closest('#controls') && !ev.target.closest('#ticker-suggestions')) closeSuggestions(); });

// Close suggestions when focus moves outside controls or suggestions
document.addEventListener('focusin', (ev)=>{
  if(!ev.target.closest('#controls') && !ev.target.closest('#ticker-suggestions')){
    closeSuggestions();
  }
});

// Close suggestions when pressing Escape anywhere
document.addEventListener('keydown', (ev)=>{
  if(ev.key === 'Escape'){
    if(!suggestionsEl.hidden){
      closeSuggestions();
      try{ tickerInput.focus(); }catch(e){}
    }
  }
});

// toggle button opens/closes suggestions
if(toggleBtn){
  toggleBtn.addEventListener('click', (ev)=>{
    ev.preventDefault();
    if(suggestionsEl.hidden){
      // show full list regardless of current input value
      showTickerSuggestions('');
    } else {
      closeSuggestions();
    }
    tickerInput.focus();
  });
}

// reposition suggestions on window resize/scroll
window.addEventListener('resize', ()=>{ if(!suggestionsEl.hidden) positionSuggestions(); });
window.addEventListener('scroll', ()=>{ if(!suggestionsEl.hidden) positionSuggestions(); });

// Keyboard: ArrowDown opens suggestions and focuses first item; Enter selects when an item is focused
tickerInput.addEventListener('keydown', (ev)=>{
  if(ev.key === 'ArrowDown'){
    ev.preventDefault();
    showTickerSuggestions(tickerInput.value);
    const first = suggestionsEl.querySelector('li');
    if(first) first.focus();
  }
});

suggestionsEl.addEventListener('keydown', (ev)=>{
  const cur = document.activeElement;
  if(ev.key === 'ArrowDown'){
    ev.preventDefault();
    const next = cur.nextElementSibling || suggestionsEl.querySelector('li');
    if(next) next.focus();
  } else if(ev.key === 'ArrowUp'){
    ev.preventDefault();
    const prev = cur.previousElementSibling || suggestionsEl.querySelector('li:last-child');
    if(prev) prev.focus();
  } else if(ev.key === 'Enter'){
    ev.preventDefault();
    if(cur && cur.dataset && cur.dataset.symbol){
      addTickerSelection(cur.dataset.symbol);
    }
    tickerInput.focus();
  } else if(ev.key === 'Escape'){
    closeSuggestions(); tickerInput.focus();
  }
});

// Make suggestion items focusable when added
const observer = new MutationObserver(()=>{
  suggestionsEl.querySelectorAll('li').forEach(li=>{ li.tabIndex = 0; });
});
observer.observe(suggestionsEl, {childList:true});

// load tickers in background
loadTickers();

function makeTab(name, idx){
  const btn = document.createElement('button');
  btn.className = 'tab';
  btn.textContent = name;
  btn.onclick = ()=>{document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); btn.classList.add('active'); showContent(name)};
  // ensure clicking tabs closes any open suggestions
  btn.addEventListener('mousedown', ()=>{ closeSuggestions(); });
  if(idx===0) btn.classList.add('active');
  return btn;
}

function showContent(name){
  content.innerHTML = '';
  // close suggestions when switching tabs and remove focus from input
  closeSuggestions();
  try{ tickerInput.blur(); }catch(e){}
  const h = document.createElement('h2'); h.textContent = name; content.appendChild(h);
  const card = document.createElement('div'); card.className='card';
  const titleRow = document.createElement('div');
  titleRow.style.display = 'flex';
  titleRow.style.alignItems = 'center';
  titleRow.style.gap = '8px';
  titleRow.style.flexWrap = 'wrap';
  const label = document.createElement('strong');
  label.textContent = 'Timeseries Stock Price Plot:';
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.id = 'plot-title';
  titleInput.value = 'SPY Closing Price Over Two Years';
  titleInput.placeholder = 'Enter plot title';
  titleInput.style.width = '280px';
  titleInput.style.border = '1px solid #000';
  titleInput.style.background = '#fff';
  titleInput.style.padding = '4px 6px';
  titleRow.appendChild(label);
  titleRow.appendChild(titleInput);
  card.appendChild(titleRow);

  // If this is the Stock Market Data tab, move the controls and plot into this card
  if(name === 'Stock Market Data'){
    if(controlsEl.parentNode !== card) card.appendChild(controlsEl);
    if(plotContainerEl.parentNode !== card) card.appendChild(plotContainerEl);
  } else {
    // ensure controls are back in their original position if they were moved
    if(controlsEl.parentNode !== originalControlsParent){
      originalControlsParent.insertBefore(controlsEl, originalControlsNextSibling);
    }
    // restore plot container to its original place
    if(plotContainerEl.parentNode !== originalPlotParent){
      originalPlotParent.insertBefore(plotContainerEl, originalPlotNextSibling);
    }
  }

  content.appendChild(card);
}

// build tabs
categories.forEach((c,i)=>tabs.appendChild(makeTab(c,i)));
// show first
showContent(categories[0]);

// -- Controls: wiring execute button to backend /api/plot
function setDefaultDates(){
  const end = new Date();
  const start = new Date(2021, 0, 1);
  $('#end').value = end.toISOString().slice(0,10);
  $('#start').value = start.toISOString().slice(0,10);
}

setDefaultDates();

async function executeQuery(){
  const symbols = getSelectedTickers();
  const start = $('#start').value;
  const end = $('#end').value;
  if(!symbols.length){ alert('Please select at least one ticker'); return }
  if(!start||!end){ alert('Please select start and end dates'); return }
  $('#status').textContent = 'Running...';
  try{
    const payload = {symbols, start, end};
    if(symbols.length === 1) payload.symbol = symbols[0];
    const plotTitle = $('#plot-title')?.value?.trim() || 'Timeseries Stock Price Plot';
    payload.title = plotTitle;
    const body = JSON.stringify(payload);
    console.log('executeQuery ->', body);
    const resp = await fetch('http://localhost:5000/api/plot', {
      method:'POST', headers: {'Content-Type':'application/json'},
      body, cache: 'no-store'
    });
    console.log('response status', resp.status, resp.statusText);
    if(!resp.ok){ const err = await resp.json().catch(()=>null); $('#status').textContent = err?.error || `Error: ${resp.status}`; return }
    const blob = await resp.blob();
    console.log('received blob size', blob.size);
    // revoke any previously created object URL to avoid stale images and memory leaks
    if(window.lastPlotUrl){ try{ URL.revokeObjectURL(window.lastPlotUrl); }catch(e){} window.lastPlotUrl = null }
    const url = URL.createObjectURL(blob);
    window.lastPlotUrl = url;
    const img = document.createElement('img'); img.src = url; img.alt = `${symbols.join(', ')} plot`; img.style.maxWidth='100%';
    const container = document.getElementById('plot-container'); container.innerHTML=''; container.appendChild(img);
    if(window.plotTitleText){
      try{ window.plotTitleText.textContent = $('#plot-title')?.value?.trim() || 'Timeseries Stock Price Plot'; }catch(e){}
    }
    $('#status').textContent = `Done (${blob.size} bytes)`;
  }catch(e){
    console.error(e); $('#status').textContent = 'Error';
  }
}

$('#execute').addEventListener('click', executeQuery);

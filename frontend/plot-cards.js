const CHIP_COLORS = ['#d62728','#1f77b4','#2ca02c','#ff7f0e','#9467bd','#17becf','#8c564b','#e377c2','#bcbd22','#7f7f7f'];
const FALLBACK_TICKERS = [['SPY','SPDR S&P 500'],['AAPL','Apple Inc.'],['MSFT','Microsoft Corp.'],['GOOG','Alphabet Inc.'],['AMZN','Amazon.com Inc.'],['TSLA','Tesla, Inc.'],['NVDA','NVIDIA Corp.'],['JPM','JPMorgan Chase & Co.'],['BAC','Bank of America Corp.'],['DIS','Walt Disney Co.'],['NFLX','Netflix, Inc.']].map(([symbol,name]) => ({symbol,name}));
let tickerCatalogPromise;
function loadTickerCatalog(){
  if(tickerCatalogPromise) return tickerCatalogPromise;
  tickerCatalogPromise = fetch('data/tickers.csv').then((response) => { if(!response.ok) throw new Error('tickers.csv unavailable'); return response.text(); }).then((text) => text.split(/\r?\n/).filter(Boolean).filter((line,index) => index || !line.toLowerCase().startsWith('symbol')).map((line) => { const comma = line.indexOf(','); return comma < 0 ? {symbol: line.trim(), name: ''} : {symbol: line.slice(0,comma).replace(/^"|"$/g,'').trim(), name: line.slice(comma + 1).replace(/^"|"$/g,'').trim()}; }).filter((item) => item.symbol)).catch(() => FALLBACK_TICKERS);
  return tickerCatalogPromise;
}

class PlotCard {
  constructor(config){
    this.config = config;
    this.selectedTickers = [...config.symbols];
    this.element = document.createElement('article');
    this.element.className = 'plot-card card';
    this.element.dataset.plotId = config.id;
    this.element.innerHTML = `<div class="plot-heading"><strong>${config.label}</strong><input class="plot-title" type="text" placeholder="Enter plot title"></div><div class="plot-controls controls"><div class="controls-row controls-row-tickers"><div class="ticker-group"><label>Ticker:</label><div class="selected-tickers" aria-live="polite"></div></div></div><div class="controls-row controls-row-fields"><span class="combo"><div class="search-box"><input class="ticker-input" type="text" autocomplete="off" aria-haspopup="listbox" aria-expanded="false" placeholder="Search tickers..."><button class="dropdown-toggle" type="button" aria-label="Show suggestions">▾</button></div><ul class="suggestions" role="listbox" hidden></ul></span><label>Start: <input class="plot-start" type="date"></label><label>End: <input class="plot-end" type="date"></label><button class="execute tab" type="button">Execute Query</button><div class="plot-status" role="status"></div></div></div><div class="plot-output"></div>`;
    this.title = this.element.querySelector('.plot-title'); this.input = this.element.querySelector('.ticker-input'); this.suggestions = this.element.querySelector('.suggestions'); this.selected = this.element.querySelector('.selected-tickers'); this.status = this.element.querySelector('.plot-status');
    this.title.value = config.title; this.element.querySelector('.plot-start').value = config.start; this.element.querySelector('.plot-end').value = config.end; this.renderSelected(); this.bindEvents(); loadTickerCatalog();
  }
  color(symbol){ return CHIP_COLORS[symbol.split('').reduce((sum,char) => sum + char.charCodeAt(0),0) % CHIP_COLORS.length]; }
  renderSelected(){
    this.selected.innerHTML = ''; this.selected.hidden = !this.selectedTickers.length;
    this.selectedTickers.forEach((symbol) => { const chip = document.createElement('button'); const color = this.color(symbol); chip.type='button'; chip.className='selected-ticker-chip'; chip.textContent=symbol; chip.title=`Remove ${symbol}`; chip.style.borderColor=color; chip.style.color=color; chip.style.background=`${color}20`; chip.onclick=() => { this.selectedTickers=this.selectedTickers.filter((item) => item !== symbol); this.renderSelected(); this.showSuggestions(''); }; this.selected.appendChild(chip); });
  }
  positionSuggestions(){ const rect = this.input.getBoundingClientRect(); const width = `${rect.width}px`; this.suggestions.style.left=`${rect.left}px`; this.suggestions.style.top=`${rect.bottom + 6}px`; this.suggestions.style.width=width; this.suggestions.style.minWidth=width; this.suggestions.style.maxWidth=width; }
  async showSuggestions(filter){
    const catalog = await loadTickerCatalog(); const query = filter.trim().toUpperCase(); const selected = this.selectedTickers.map((symbol) => symbol.toUpperCase()); const matches = catalog.filter((item) => !query || item.symbol.toUpperCase().includes(query) || item.name.toUpperCase().includes(query)).slice(0,50); this.suggestions.innerHTML='';
    matches.sort((a,b) => Number(!selected.includes(a.symbol.toUpperCase())) - Number(!selected.includes(b.symbol.toUpperCase()))).forEach((item) => { const option=document.createElement('li'); option.tabIndex=0; option.dataset.symbol=item.symbol; option.textContent=`${item.symbol} — ${item.name}`; if(selected.includes(item.symbol.toUpperCase())) option.style.fontWeight='700'; this.suggestions.appendChild(option); });
    this.suggestions.hidden = !matches.length; if(matches.length){ this.suggestions.style.display='block'; this.positionSuggestions(); this.input.setAttribute('aria-expanded','true'); }
  }
  closeSuggestions(){ this.suggestions.hidden=true; this.suggestions.style.display='none'; this.input.setAttribute('aria-expanded','false'); }
  addTicker(symbol){ const normalized=symbol.toUpperCase(); this.selectedTickers=this.selectedTickers.includes(normalized) ? this.selectedTickers.filter((item) => item !== normalized) : [normalized,...this.selectedTickers]; this.input.value=''; this.renderSelected(); this.showSuggestions(''); this.input.focus(); }
  bindEvents(){
    this.input.oninput=() => this.showSuggestions(this.input.value); this.input.onclick=() => this.showSuggestions(this.input.value); this.element.querySelector('.dropdown-toggle').onclick=() => this.suggestions.hidden ? this.showSuggestions('') : this.closeSuggestions(); this.suggestions.onclick=(event) => { const option=event.target.closest('li'); if(option) this.addTicker(option.dataset.symbol); };
    this.input.onkeydown=(event) => { if(event.key==='ArrowDown'){ event.preventDefault(); this.showSuggestions(this.input.value).then(() => this.suggestions.querySelector('li')?.focus()); } };
    this.suggestions.onkeydown=(event) => { const current=document.activeElement; const options=[...this.suggestions.querySelectorAll('li')]; const index=options.indexOf(current); if(event.key==='ArrowDown'||event.key==='ArrowUp'){ event.preventDefault(); options[(index + (event.key==='ArrowDown' ? 1 : options.length - 1)) % options.length]?.focus(); } else if(event.key==='Enter'){ event.preventDefault(); if(current?.dataset.symbol) this.addTicker(current.dataset.symbol); } else if(event.key==='Escape'){ this.closeSuggestions(); this.input.focus(); } };
    this.element.querySelector('.execute').onclick=() => this.execute(); document.addEventListener('click',(event) => { if(!this.element.contains(event.target) && !this.suggestions.contains(event.target)) this.closeSuggestions(); }); window.addEventListener('resize',() => { if(!this.suggestions.hidden) this.positionSuggestions(); }); window.addEventListener('scroll',() => { if(!this.suggestions.hidden) this.positionSuggestions(); });
  }
  async execute(){
    const start=this.element.querySelector('.plot-start').value; const end=this.element.querySelector('.plot-end').value; if(!this.selectedTickers.length||!start||!end){ this.status.textContent='Select ticker and dates'; return; } this.status.textContent='Running...';
    try{ const response=await fetch('http://localhost:5000/api/plot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({symbols:this.selectedTickers,start,end,title:this.title.value.trim()||this.config.title}),cache:'no-store'}); if(!response.ok){ const error=await response.json().catch(() => null); this.status.textContent=error?.error||`Error: ${response.status}`; return; } const blob=await response.blob(); if(this.imageUrl) URL.revokeObjectURL(this.imageUrl); this.imageUrl=URL.createObjectURL(blob); const image=document.createElement('img'); image.src=this.imageUrl; image.alt=`${this.selectedTickers.join(', ')} plot`; image.style.maxWidth='100%'; this.element.querySelector('.plot-output').replaceChildren(image); this.status.textContent=`Done (${blob.size} bytes)`; }catch(error){ console.error(error); this.status.textContent='Error'; }
  }
}
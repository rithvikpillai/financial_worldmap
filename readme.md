readme.md


Goal:
I would like to create a website that amalgamates economic and financial data from various data sources to create a live view of the world.


Categories of Data:

- Stock Market Data: global indices, country-level exchanges, major equities, sector performance, market capitalization, intraday prices, and volatility measures.
- Energy: crude oil (production, consumption, inventories, refinery throughput), natural gas, coal, and refined products; regional supply/demand balances and inventories.
- Precious & Industrial Metals: gold, silver, platinum, palladium, copper — production, consumption, inventories, and price series.
- Agriculture & Soft Commodities: cereals (wheat, corn, rice), oilseeds (soy), coffee, sugar — production, stocks, exports/imports, and price series.
- Currencies & FX: spot rates, cross-rates, FX reserves, central bank policy rates, and real effective exchange rates.
- Fixed Income & Credit: sovereign yields (across maturities), corporate bond spreads, sovereign ratings, and CDS spreads.
- Trade & Global Supply Chains: export/import volumes and values by country and commodity, trade balances, shipping/port congestion, and freight indices.
- Macroeconomic Indicators: GDP, GDP per capita, inflation (CPI/PCE), unemployment, industrial production, retail sales, and PMI indices.
- Banking & Financial Health: bank deposits, lending growth, non-performing loans, capital ratios, interbank rates, and systemic risk indicators.
- Corporate Fundamentals: earnings, revenues, sectoral profit metrics, large-cap filings, and mergers & acquisitions activity.
- Real Estate & Housing: housing starts, building permits, price indices, rent, and mortgage rates.
- Alternative & Geospatial Data: satellite night lights, AIS (ship movements), mobility data, footfall/web traffic, and remote-sensing for crops and inventories.
- Energy Transition & ESG: renewable capacity, emissions (CO2), carbon prices, green investment flows, and ESG ratings.
- Policy, News & Events: central bank decisions, fiscal policy changes, sanctions, election results, and major geopolitical events.
- Metadata & Quality: data source, update frequency, latency, licensing, and confidence/quality flags.

Example time-series plots to create per category:

- Stock Market Data:
	- Index level (daily close) with moving averages (e.g., 30/200-day).
	- Country or exchange market-cap growth (monthly/quarterly).
	- Sector performance (normalized cumulative returns) vs benchmark.
	- Intraday candlestick and volume (1m/5m/15m) for selected tickers.
	- Realized vs implied volatility (historical vol vs VIX-style index).

- Energy:
	- Crude oil production and consumption (country/region monthly).
	- Weekly/monthly inventory levels (e.g., U.S. weekly petroleum stocks).
	- Brent vs WTI price spread over time.
	- Refinery throughput and utilization rates.

- Precious & Industrial Metals:
	- Spot price time series and rolling returns (gold, silver, copper).
	- Exchange warehouse stocks (LME/COMEX) vs price.
	- ETF holdings (e.g., GLD) vs spot price.

- Agriculture & Soft Commodities:
	- Crop production vs stocks-to-use ratio (seasonal annual cycles).
	- Export volumes and global price indices (monthly).
	- Futures curve (e.g., nearby vs deferred) and roll yield.

- Currencies & FX:
	- Spot FX time series (daily) with percent-change heatmap across pairs.
	- Real effective exchange rate (REER) and policy rate overlay.
	- FX reserves by country (monthly/quarterly).

- Fixed Income & Credit:
	- Yield curve (plot yields across tenors for selected dates).
	- Time series of key tenors (2y, 5y, 10y, 30y) and spreads (10y-2y).
	- Corporate spread vs sovereign and CDS spread time series.

- Trade & Global Supply Chains:
	- Monthly export/import series by commodity and partner country.
	- Freight rate indices (Baltic Dry, container rates) time series.
	- Ship counts / port call frequency and congestion indicators.

- Macroeconomic Indicators:
	- Quarterly GDP (nominal and real) with YoY and QoQ growth rates.
	- CPI / PCE inflation series (monthly) and core vs headline comparison.
	- Unemployment rate and participation rate time series.

- Banking & Financial Health:
	- Domestic credit to private sector (YoY) and deposit growth.
	- Non-performing loans ratio trend and bank capital ratios.
	- Interbank rate (e.g., LIBOR/OIS spread) and systemic risk indicators.

- Corporate Fundamentals:
	- Revenue and net income time series (quarterly) with margins.
	- EPS and consensus-estimate vs actual beats over time.
	- M&A deal value per quarter and sector concentration.

- Real Estate & Housing:
	- Housing starts, permits and completions (monthly) and YoY change.
	- House Price Index (HPI) time series and affordability metrics (price/income).
	- Mortgage rate time series and origination volumes.

- Alternative & Geospatial Data:
	- Nightlight radiance index by grid or region (monthly/annual change).
	- Vessel traffic counts (daily/weekly) and ship AIS heatmaps.
	- Vegetation indices / NDVI time series for crop regions.

- Energy Transition & ESG:
	- Renewable capacity installed (annual) and generation time series.
	- CO2 emissions by country/sector and per-capita emissions.
	- Carbon price time series and traded volumes in ETS markets.

- Policy, News & Events:
	- Policy rate time series with event markers for meetings/announcements.
	- Daily count of relevant news events (GDELT) and sentiment trend.
	- Sanctions or trade policy event timeline with economic indicators overlay.

- Metadata & Quality:
	- Data latency timeline per source (last-updated timestamps over time).
	- Missing-data heatmap (series × time) and frequency of revisions.

Each category should note expected update cadence (real-time, daily, weekly, monthly), geographic coverage (global, regional, country), and licensing constraints.

---

Per-category public data sources (labels & links):

- Stock Market Data:
	- Yahoo Finance: https://finance.yahoo.com/
	- IEX Cloud (API): https://iexcloud.io/
	- Alpha Vantage (API): https://www.alphavantage.co/
	- Tiingo (API): https://api.tiingo.com/
	- Polygon.io (API): https://polygon.io/
	- Finnhub (API): https://finnhub.io/
	- Nasdaq Data Link (formerly Quandl): https://data.nasdaq.com/
	- Investing.com (market data & charts): https://www.investing.com/
	- Bloomberg / Refinitiv (commercial): https://www.bloomberg.com/ | https://www.refinitiv.com/

- Energy:
	- U.S. Energy Information Administration (EIA): https://www.eia.gov/
	- International Energy Agency (IEA): https://www.iea.org/
	- OPEC statistical data: https://www.opec.org/
	- BP Statistical Review / Statistical Review of World Energy: https://www.bp.com/
	- IEA & EIA APIs / open datasets: https://www.eia.gov/opendata/ | https://www.iea.org/data-and-statistics

- Precious & Industrial Metals:
	- London Metal Exchange (LME): https://www.lme.com/
	- COMEX / CME Group: https://www.cmegroup.com/
	- World Gold Council: https://www.gold.org/
	- U.S. Geological Survey (USGS) – minerals: https://www.usgs.gov/

- Agriculture & Soft Commodities:
	- UN FAO / FAOSTAT: https://www.fao.org/faostat/en/#home
	- U.S. Department of Agriculture (USDA) – ERS & NASS: https://www.ers.usda.gov/ | https://www.nass.usda.gov/
	- International Grains Council (IGC): https://www.igc.int/

- Currencies & FX:
	- Federal Reserve / FRED exchange-rate series: https://fred.stlouisfed.org/
	- IMF (IFS & exchange-rate datasets): https://data.imf.org/
	- Bank for International Settlements (BIS) statistics: https://www.bis.org/statistics/
	- ECB Statistical Data Warehouse (SDW): https://sdw.ecb.europa.eu/
	- OANDA / Fixer / Open Exchange Rates (FX APIs): https://www.oanda.com/ | https://fixer.io/ | https://openexchangerates.org/

- Fixed Income & Credit:
	- FRED (Treasury yields and curves): https://fred.stlouisfed.org/
	- U.S. Department of the Treasury – yields: https://www.treasury.gov/resource-center/data-chart-center/interest-rates/
	- ICE Data Services / Markit / IHS Markit (rates & spreads, commercial): https://www.theice.com/ | https://ihsmarkit.com/
	- BIS and national debt offices for sovereign statistics: https://www.bis.org/ | national treasury sites

- Trade & Global Supply Chains:
	- UN Comtrade: https://comtrade.un.org/
	- World Trade Organization (WTO) statistics: https://www.wto.org/english/res_e/statis_e/statis_e.htm
	- World Bank WITS (trade data): https://wits.worldbank.org/
	- MarineTraffic (AIS / ship positions, commercial): https://www.marinetraffic.com/
	- Clarksons / S&P Global Platts (shipping & commodity intelligence, commercial): https://www.clarksons.net/ | https://www.spglobal.com/

- Macroeconomic Indicators:
	- World Bank Data: https://data.worldbank.org/
	- IMF Data & World Economic Outlook: https://www.imf.org/en/Data
	- OECD Data: https://data.oecd.org/
	- Eurostat: https://ec.europa.eu/eurostat
	- National statistical offices (e.g., BEA https://www.bea.gov/, ONS https://www.ons.gov.uk/)

- Banking & Financial Health:
	- IMF Financial Soundness Indicators: https://data.imf.org/
	- World Bank – Global Financial Development: https://www.worldbank.org/
	- BIS banking statistics & credit aggregates: https://www.bis.org/statistics/
	- FDIC (U.S. banking data): https://www.fdic.gov/

- Corporate Fundamentals:
	- SEC EDGAR (U.S. filings): https://www.sec.gov/edgar
	- Companies House (UK filings): https://www.gov.uk/government/organisations/companies-house
	- Yahoo Finance / Alpha Vantage / IEX for fundamentals & earnings: https://finance.yahoo.com/ | https://www.alphavantage.co/ | https://iexcloud.io/
	- Refinitiv / Capital IQ / Morningstar (commercial): https://www.refinitiv.com/ | https://www.morningstar.com/

- Real Estate & Housing:
	- U.S. Census – construction & housing: https://www.census.gov/construction/
	- FHFA (U.S. house price indices): https://www.fhfa.gov/
	- Zillow Research datasets: https://www.zillow.com/research/data/
	- Eurostat / national property registries for other countries

- Alternative & Geospatial Data:
	- NASA Earthdata & Land processes: https://earthdata.nasa.gov/
	- Google Earth Engine: https://earthengine.google.com/
	- Copernicus / Sentinel Hub (ESA): https://scihub.copernicus.eu/
	- VIIRS & DMSP nightlights (Earth Observation): https://eogdata.mines.edu/products/vnl/
	- GDELT Project (global event & media monitoring): https://www.gdeltproject.org/
	- OpenStreetMap: https://www.openstreetmap.org/

- Energy Transition & ESG:
	- IEA clean energy & renewables datasets: https://www.iea.org/data-and-statistics
	- CDP (corporate climate disclosures): https://www.cdp.net/
	- Climate Data Store (Copernicus): https://cds.climate.copernicus.eu/
	- MSCI / Refinitiv ESG datasets (commercial): https://www.msci.com/ | https://www.refinitiv.com/

- Policy, News & Events:
	- GDELT (event detection & news): https://www.gdeltproject.org/
	- NewsAPI (news aggregator API): https://newsapi.org/
	- Central bank sites (Fed, ECB, BoJ, BoE): https://www.federalreserve.gov/ | https://www.ecb.europa.eu/ | https://www.boj.or.jp/ | https://www.bankofengland.co.uk/

- Metadata & Quality / Open Data Catalogs:
	- data.gov (U.S. open data catalog): https://www.data.gov/
	- EU Open Data Portal: https://data.europa.eu/
	- World Bank Open Data catalog: https://datacatalog.worldbank.org/
	- OECD Metadata & stat tools: https://data.oecd.org/


Per-source API 
notes (quick guide to useful series/endpoints):

- Yahoo Finance — ticker historical CSV, dividend/split history, and basic fundamentals pages for equities and indices.
- IEX Cloud — real-time quotes, intraday bars, company fundamentals and earnings via REST endpoints (requires API key).
- Alpha Vantage — free time-series endpoints: TIME_SERIES_INTRADAY, TIME_SERIES_DAILY, FX_INTRADAY, plus technical indicators.
- Tiingo — adjusted historical prices, news and metadata; use the `daily` and `iex` endpoints for time-series.
- Polygon.io — tick/trades/quotes, aggregated bars, and reference data for exchanges and tickers (good for high-frequency aggregates).
- Finnhub — real-time quotes, company fundamentals, earnings calendar, and alternative sentiment endpoints (free tier exists).
- Nasdaq Data Link (Quandl) — curated datasets and macro/financial time-series; query via dataset codes and CSV/JSON API.
- Investing.com — comprehensive market pages and screener; no official free API (scraping required with caution).
- Bloomberg / Refinitiv — enterprise feeds: real-time, historical, and reference data (commercial licensing).

- EIA — API endpoints for weekly petroleum status, monthly energy balances, refinery throughput, and regional consumption/production.
- IEA — country-level production/consumption balances, energy intensity and sectoral datasets (some datasets paid/licensed).
- OPEC — monthly oil market reports and production data by member country.
- BP Statistical Review — annual energy production/consumption tables and downloadable reports.

- LME — official LME price quotes and warehouse stocks (subscription); useful for base metal spot and inventory levels.
- CME/COMEX — futures settlement prices, open interest and volume for metals via exchange data products.
- World Gold Council — gold demand/supply statistics, ETF holdings and official reports.
- USGS Minerals — production, mine output and reserve statistics by country and commodity.

- FAOSTAT — crop production, trade, stocks and yield series by country and commodity (API available).
- USDA ERS/NASS — WASDE supply-demand balances, crop production, acreage and stocks (timely US-specific reports).
- IGC — global grain price indices, supply-demand balances and monthly market intelligence.

- FRED — bilateral and effective exchange-rate series, central bank rates and many macro time-series (stable API).
- IMF Data — IFS exchange-rate tables, reserves, and official macroeconomic series (bulk downloads/API).
- BIS — FX turnover, effective exchange rates and international banking statistics.
- ECB SDW — detailed euro-area and cross-country FX and rate series via SDMX/API.
- OANDA/Fixer/OpenExchangeRates — programmatic FX spot and historical rates APIs (varying free tiers).

- FRED (yields) — US Treasury yields across tenors, risk-free curves and historical term structures.
- U.S. Treasury — official daily treasury yield curve and historical CSVs.
- ICE/Markit — swap curves, corporate credit curves and commercial fixed-income datasets.

- UN Comtrade — HS/commodity-level bilateral trade flows with a REST API for querying reporters, partners and years.
- WTO Statistics — aggregated trade indicators and time-series across countries/sectors.
- WITS — integrated trade and tariff datasets (World Bank interface to UN COMTRADE/TRAINS).
- MarineTraffic — AIS vessel positions, port calls and historical tracks (commercial API).

- World Bank Data — GDP, GNI, and many country indicators accessible via API and country-series codes.
- IMF WEO/IFS — WEO forecast tables and IFS historical macroeconomic series by country.
- OECD Data — harmonized GDP, employment and price indices for OECD members (API/CSV).
- Eurostat & National Offices — official releases and specialized time-series for member states.

- IMF FSI — cross-country financial soundness indicators including bank capital and asset quality metrics.
- World Bank Global Financial Development — banking system size, depth and access indicators.
- BIS Banking Stats — international banking aggregates and credit growth metrics.
- FDIC — US bank performance, call reports and failure history datasets.

- SEC EDGAR — company filings, XBRL financial statements and full-text filings for filings-based extraction.
- Companies House — UK filings and company metadata (downloadable extracts/API).
- Yahoo/AlphaVantage/IEX — consolidated fundamentals endpoints for ratios, earnings and basic company metadata.

- U.S. Census Construction — building permits, housing starts and completions (US-specific time-series).
- FHFA HPI — house price indices and regional series for the United States.
- Zillow Research — transactional price indices, rental series and inventory metrics (US-focused).

- NASA Earthdata & Google Earth Engine — satellite image products, hosted datasets and time-series for remote sensing.
- Copernicus / Sentinel — free Sentinel imagery and derived products for land, vegetation and coastal monitoring.
- VIIRS Nightlights — radiance-based nightlight series for proxying economic activity and event detection.
- GDELT — global event extraction, media mentions and sentiment time-series.
- OpenStreetMap — vector geodata, POIs and geographic context for mapping overlays.

- IEA Renewables — capacity and generation series for renewables and electricity statistics.
- CDP — corporate climate disclosures and emissions inventories (registration/licensed access required for bulk).
- Copernicus Climate Data Store — gridded climate variables and emissions datasets.

- GDELT — event streams and media monitoring useful for rapid event detection and geotagged story extraction.
- NewsAPI — headline and article API useful for keyword/topic tracking across publishers (rate limits apply).
- Central bank sites — calendars, meeting minutes, press releases and official rates (primary source for policy moves).

- data.gov / data.europa.eu / World Bank Catalog / OECD — centralized metadata portals to discover additional open datasets and licensing details.

#!/usr/bin/env python3
"""Fetch recent daily CSV data from Yahoo Finance and store into SQLite.

Usage:
  - Run: `python backend/fetch_alpha.py --symbol SPY --days 30`

The script saves raw CSV to `data/{symbol}_YYYYMM.csv` and upserts rows into `data/data.db`.
"""
from __future__ import annotations

import argparse
import csv
import datetime
import os
import sqlite3
import sys
import time
from typing import List

import requests
try:
    import yfinance as yf
except Exception:
    yf = None
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass


DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir, "data"))
DB_PATH = os.path.abspath(os.path.join(DB_DIR, "data.db"))


def ensure_data_dir() -> None:
    os.makedirs(DB_DIR, exist_ok=True)


def _to_unix(dt: datetime.date) -> int:
    return int(time.mktime(dt.timetuple()))


def fetch_yahoo_csv(symbol: str, start_date: datetime.date, end_date: datetime.date) -> str:
    # Yahoo expects period1 (start) and period2 (end) in UNIX seconds
    period1 = _to_unix(start_date)
    # add one day to end to make inclusive
    period2 = _to_unix(end_date + datetime.timedelta(days=1))
    url = (
        f"https://query1.finance.yahoo.com/v7/finance/download/{symbol}"
        f"?period1={period1}&period2={period2}&interval=1d&events=history&includeAdjustedClose=true"
    )
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36"
    }
    # Retry with exponential backoff for transient 429/5xx responses
    for attempt in range(4):
        resp = requests.get(url, timeout=30, headers=headers)
        if resp.status_code == 200:
            text = resp.text
            if text.strip().startswith("{"):
                raise RuntimeError(f"Yahoo returned non-CSV response:\n{text}")
            return text
        if resp.status_code in (429, 500, 502, 503, 504):
            sleep_secs = 2 ** attempt
            print(f"Received {resp.status_code} from Yahoo, retrying in {sleep_secs}s...")
            time.sleep(sleep_secs)
            continue
        resp.raise_for_status()
    raise RuntimeError(f"Failed to fetch CSV from Yahoo after retries, last status: {resp.status_code}")


def parse_csv(csv_text: str, start_date: datetime.date, end_date: datetime.date) -> List[dict]:
    reader = csv.DictReader(csv_text.splitlines())
    rows = []
    for r in reader:
        if not r.get("Date"):
            continue
        raw_date = r["Date"]
        # handle timestamps like '2026-08-06 00:00:00-04:00' produced by yfinance
        if " " in raw_date:
            date_part = raw_date.split(" ")[0]
        else:
            date_part = raw_date
        ts = datetime.date.fromisoformat(date_part)
        if start_date <= ts <= end_date:
            rows.append({
                "timestamp": date_part,
                "open": float(r.get("Open", "0")) if r.get("Open") not in (None, "", "null") else 0.0,
                "high": float(r.get("High", "0")) if r.get("High") not in (None, "", "null") else 0.0,
                "low": float(r.get("Low", "0")) if r.get("Low") not in (None, "", "null") else 0.0,
                "close": float(r.get("Close", "0")) if r.get("Close") not in (None, "", "null") else 0.0,
                "adjusted_close": float(r.get("Adj Close", r.get("Close", "0"))) if r.get("Adj Close") not in (None, "", "null") else float(r.get("Close", "0")),
                "volume": int(float(r.get("Volume", "0"))) if r.get("Volume") not in (None, "", "null") else 0,
                "dividend_amount": 0.0,
                "split_coefficient": 1.0,
            })
    return rows


def init_db(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS daily_stock (
            symbol TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            open REAL,
            high REAL,
            low REAL,
            close REAL,
            adjusted_close REAL,
            volume INTEGER,
            dividend_amount REAL,
            split_coefficient REAL,
            PRIMARY KEY(symbol, timestamp)
        )
        """
    )


def upsert_rows(conn: sqlite3.Connection, symbol: str, rows: List[dict]) -> int:
    sql = (
        "INSERT OR REPLACE INTO daily_stock"
        "(symbol,timestamp,open,high,low,close,adjusted_close,volume,dividend_amount,split_coefficient)"
        " VALUES (?,?,?,?,?,?,?,?,?,?)"
    )
    cur = conn.cursor()
    for r in rows:
        cur.execute(
            sql,
            (
                symbol,
                r["timestamp"],
                r["open"],
                r["high"],
                r["low"],
                r["close"],
                r["adjusted_close"],
                r["volume"],
                r["dividend_amount"],
                r["split_coefficient"],
            ),
        )
    conn.commit()
    return len(rows)


def save_raw_csv(symbol: str, csv_text: str, start_date: datetime.date) -> str:
    filename = f"{symbol}_{start_date.strftime('%Y%m')}.csv"
    path = os.path.join(DB_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(csv_text)
    return path


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbol", default="SPY", help="Ticker symbol to fetch (default: SPY)")
    parser.add_argument(
        "--days",
        type=int,
        default=30,
        help="Number of most-recent calendar days to keep (default: 30)",
    )
    parser.add_argument(
        "--start",
        type=str,
        help="Start date (inclusive) in YYYY-MM-DD format. If provided, overrides --days.",
    )
    parser.add_argument(
        "--end",
        type=str,
        help="End date (inclusive) in YYYY-MM-DD format. If provided, overrides --days.",
    )
    args = parser.parse_args(argv)

    symbol = args.symbol.upper()
    # If explicit start/end provided, use them; otherwise derive from --days
    if args.start:
        try:
            start_date = datetime.date.fromisoformat(args.start)
        except Exception:
            raise SystemExit(f"Invalid --start date: {args.start}")
    else:
        start_date = None

    if args.end:
        try:
            end_date = datetime.date.fromisoformat(args.end)
        except Exception:
            raise SystemExit(f"Invalid --end date: {args.end}")
    else:
        end_date = None

    if start_date is None and end_date is None:
        end_date = datetime.date.today()
        start_date = end_date - datetime.timedelta(days=args.days)
    elif start_date is None and end_date is not None:
        # derive start from end and days
        start_date = end_date - datetime.timedelta(days=args.days)
    elif start_date is not None and end_date is None:
        # derive end from start and days
        end_date = start_date + datetime.timedelta(days=args.days)

    ensure_data_dir()

    print(f"Fetching {symbol} CSV from Yahoo Finance ({start_date} to {end_date})...")
    csv_text = None
    # Prefer yfinance (handles cookies/crumb) when available
    if yf is not None:
        try:
            # yfinance expects string dates
            df = yf.Ticker(symbol).history(start=start_date.isoformat(), end=(end_date + datetime.timedelta(days=1)).isoformat())
            if df is None or df.empty:
                raise RuntimeError("yfinance returned no data")
            # convert to CSV with Date column
            df_reset = df.reset_index()
            csv_text = df_reset.to_csv(index=False)
        except Exception as e:
            print(f"yfinance fetch failed, falling back to direct CSV: {e}")

    if csv_text is None:
        try:
            csv_text = fetch_yahoo_csv(symbol, start_date, end_date)
        except Exception as e:
            print(f"Error fetching from Yahoo Finance: {e}", file=sys.stderr)
            sys.exit(1)

    raw_path = save_raw_csv(symbol, csv_text, start_date)
    print(f"Saved raw CSV to {raw_path}")

    rows = parse_csv(csv_text, start_date, end_date)
    print(f"Parsed {len(rows)} rows between {start_date} and {end_date}.")

    conn = sqlite3.connect(DB_PATH)
    init_db(conn)
    inserted = upsert_rows(conn, symbol, rows)
    conn.close()

    print(f"Upserted {inserted} rows into {DB_PATH} (table: daily_stock).")


if __name__ == "__main__":
    main()

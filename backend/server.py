from __future__ import annotations

import datetime
import csv
import io
import json
import os
import sqlite3
import subprocess
import sys
from typing import List

from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import matplotlib
matplotlib.use("Agg")
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import pandas as pd
try:
    import mplfinance as mpf
except Exception:
    mpf = None

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
DB_PATH = os.path.join(BASE_DIR, "data", "data.db")
TICKERS_PATH = os.path.join(BASE_DIR, "frontend", "data", "tickers.csv")


def load_ticker_names() -> dict[str, str]:
    names = {}
    try:
        with open(TICKERS_PATH, newline="", encoding="utf-8") as ticker_file:
            for row in csv.DictReader(ticker_file):
                symbol = (row.get("Symbol") or "").strip().upper()
                name = (row.get("Name") or "").strip()
                if symbol and name:
                    names[symbol] = name
    except (OSError, csv.Error):
        pass
    return names


def query_db(symbol: str, start: str, end: str) -> List[tuple]:
    if not os.path.exists(DB_PATH):
        return []
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "SELECT timestamp, open, high, low, close FROM daily_stock WHERE symbol = ? AND timestamp BETWEEN ? AND ? ORDER BY timestamp",
        (symbol, start, end),
    )
    rows = cur.fetchall()
    conn.close()
    return rows


def ensure_data_for_range(symbol: str, start_date: datetime.date, end_date: datetime.date) -> None:
    # Ensure DB contains data covering the entire requested date range.
    # If there are no rows at all for the range, or the rows do not span
    # from start_date through end_date, invoke the fetch script to fill missing data.
    rows = query_db(symbol, start_date.isoformat(), end_date.isoformat())
    needs_fetch = False
    if not rows:
        needs_fetch = True
    else:
        # compute min/max dates present in the DB rows
        found_dates = []
        for r in rows:
            raw = r[0]
            date_part = raw.split(" ")[0] if " " in raw else raw
            try:
                found_dates.append(datetime.date.fromisoformat(date_part))
            except Exception:
                continue
        if not found_dates:
            needs_fetch = True
        else:
            min_found = min(found_dates)
            max_found = max(found_dates)
            # if DB already contains the full requested span, nothing to do
            if min_found <= start_date and max_found >= end_date:
                return
            needs_fetch = True

    if not needs_fetch:
        return

    # Request the fetch script to retrieve the exact start/end range
    cmd = [
        sys.executable,
        os.path.join(BASE_DIR, "backend", "fetch_yahoo.py"),
        "--symbol",
        symbol,
        "--start",
        start_date.isoformat(),
        "--end",
        end_date.isoformat(),
    ]
    try:
        res = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=120)
        if res.returncode != 0:
            print(f"fetch script returned code {res.returncode}")
            print(res.stdout)
            print(res.stderr)
    except Exception as e:
        print(f"Failed to run fetch script: {e}")


@app.route("/api/plot", methods=["POST"])
def api_plot():
    data = request.get_json() or {}
    raw_symbols = data.get("symbols")
    single_symbol = data.get("symbol")
    if raw_symbols is None:
        raw_symbols = single_symbol if single_symbol else "SPY"
    if isinstance(raw_symbols, str):
        symbols = [s.strip().upper() for s in raw_symbols.split(",") if s and s.strip()]
    elif isinstance(raw_symbols, list):
        symbols = [str(s).strip().upper() for s in raw_symbols if str(s).strip()]
    else:
        symbols = [str(raw_symbols).strip().upper()]

    start = data.get("start")
    end = data.get("end")
    plot_title = data.get("title") or "Timeseries Stock Price Plot"
    if not start or not end:
        return jsonify({"error": "start and end dates required in YYYY-MM-DD"}), 400
    try:
        start_date = datetime.date.fromisoformat(start)
        end_date = datetime.date.fromisoformat(end)
    except Exception:
        return jsonify({"error": "invalid date format"}), 400

    if not symbols:
        return jsonify({"error": "at least one ticker is required"}), 400

    if len(symbols) == 1:
        symbol = symbols[0]
        ensure_data_for_range(symbol, start_date, end_date)
        rows = query_db(symbol, start_date.isoformat(), end_date.isoformat())
        if not rows:
            return jsonify({"error": "no data found for symbol in range"}), 404

        dates = []
        opens = []
        highs = []
        lows = []
        closes = []
        for r in rows:
            raw = r[0]
            date_part = raw.split(" ")[0] if " " in raw else raw
            try:
                dates.append(datetime.date.fromisoformat(date_part))
            except Exception:
                continue
            opens.append(float(r[1]))
            highs.append(float(r[2]))
            lows.append(float(r[3]))
            closes.append(float(r[4]))

        if len(dates) == 0:
            return jsonify({"error": "no valid date rows found"}), 404

        try:
            df = pd.DataFrame({
                "Open": opens,
                "High": highs,
                "Low": lows,
                "Close": closes,
            }, index=pd.DatetimeIndex(dates))
        except Exception as e:
            return jsonify({"error": f"failed to build data frame: {e}"}), 500

        if mpf is None:
            return jsonify({"error": "mplfinance not available on server; install mplfinance"}), 500

        buf = io.BytesIO()
        try:
            fig, axes = mpf.plot(
                df,
                type="candle",
                style="yahoo",
                tight_layout=True,
                returnfig=True,
                datetime_format="%d-%m-%Y",
                xrotation=45,
                figsize=(24, 8),
                title=plot_title,
            )
            if fig is not None:
                fig.savefig(buf, format="png", bbox_inches="tight")
        except Exception as e:
            return jsonify({"error": f"failed to render candlestick: {e}"}), 500
        buf.seek(0)
        return Response(buf.getvalue(), mimetype="image/png")

    fig, ax = plt.subplots(figsize=(24, 8))
    ticker_names = load_ticker_names()
    for symbol in symbols:
        ensure_data_for_range(symbol, start_date, end_date)
        rows = query_db(symbol, start_date.isoformat(), end_date.isoformat())
        if not rows:
            return jsonify({"error": f"no data found for symbol in range: {symbol}"}), 404

        dates = []
        closes = []
        for r in rows:
            raw = r[0]
            date_part = raw.split(" ")[0] if " " in raw else raw
            try:
                dates.append(datetime.date.fromisoformat(date_part))
            except Exception:
                continue
            closes.append(float(r[4]))

        if len(dates) == 0:
            return jsonify({"error": f"no valid date rows found for symbol: {symbol}"}), 404

        series = pd.Series(closes, index=pd.DatetimeIndex(dates), name=symbol)
        series = series.sort_index()
        name = ticker_names.get(symbol, symbol)
        ax.plot(series.index, series.values, label=f"{symbol}: {name}", linewidth=2)

    ax.set_title(plot_title)
    ax.set_xlabel("Date")
    ax.set_ylabel("Close")
    ax.legend(loc="upper left")
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%d-%m-%Y"))
    ax.xaxis.set_major_locator(mdates.AutoDateLocator())
    fig.autofmt_xdate()
    fig.tight_layout()

    buf = io.BytesIO()
    try:
        fig.savefig(buf, format="png", bbox_inches="tight")
    except Exception as e:
        return jsonify({"error": f"failed to render multi-ticker chart: {e}"}), 500
    buf.seek(0)
    return Response(buf.getvalue(), mimetype="image/png")


if __name__ == "__main__":
    # Run in debug mode so the server reloads on code changes during development
    app.run(debug=True, host="127.0.0.1", port=5000)

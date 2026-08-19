"""Test script for Strategy Lab API endpoints with ascii printing."""
import urllib.request
import json

def test_endpoints():
    base = "http://localhost:8000/api/v1/research"
    
    # 1. Test Library
    try:
        req = urllib.request.urlopen(f"{base}/strategies/library")
        data = json.loads(req.read().decode("utf-8"))
        print(f"[OK] /strategies/library returned {len(data)} building blocks")
        print("  Sample block:", data[0]["code"], data[0]["name"], "Category:", data[0]["category"])
    except Exception as e:
        print("[FAIL] Library endpoint failed:", e)

    # 2. Test Strategies List
    try:
        req = urllib.request.urlopen(f"{base}/strategies")
        data = json.loads(req.read().decode("utf-8"))
        print(f"[OK] /strategies returned {len(data)} strategies")
        print("  First strategy:", data[0]["name"], "| Pair:", data[0]["pair"], "| Exp:", data[0]["expectancy_r"], "| PF:", data[0]["profit_factor"])
    except Exception as e:
        print("[FAIL] Strategies list endpoint failed:", e)

    # 3. Test Fast-Test Simulation
    try:
        payload = json.dumps({
            "name": "BB Reversion v4",
            "pair": "XAUUSD",
            "timeframe": "15m",
            "parameters": {"bb_period": 20, "bb_std": 2.0, "rsi_period": 14, "rsi_oversold": 30.0},
            "risk_pct": 0.50,
            "slippage_pips": 0.20,
        }).encode("utf-8")
        req = urllib.request.Request(f"{base}/strategies/fast-test", data=payload, headers={"Content-Type": "application/json"})
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode("utf-8"))
        print("[OK] /strategies/fast-test success:")
        print(f"  Exp: {data['expectancy_r']}R | OOS Exp: {data['oos_expectancy_r']}R | PF: {data['profit_factor']} | WinRate: {data['win_rate']}% | Trades: {data['trades_count']}")
        print(f"  Equity curve points: {len(data['equity_curve'])}")
    except Exception as e:
        print("[FAIL] Fast-test endpoint failed:", e)

if __name__ == "__main__":
    test_endpoints()

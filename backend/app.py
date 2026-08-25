from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
import os, json, secrets, requests

app = FastAPI()

# Configuration
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "macro2026")
ADMIN_SESSIONS = set()

UPSTASH_URL = os.getenv("UPSTASH_REDIS_REST_URL")
UPSTASH_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN")
CALENDAR_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json"

DEFAULT_STATE = {
    "daysData": {}, "categoryScores": {}, "matrixEvents": {}, "matrixTotals": {},
    "matrixPrev": {}, "matrixPrevBreakdown": {}, "intermarketScores": {}, "dailyNotes": {}
}

# Resolve full path to repository root (one folder level up from backend/)
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# --- CLOUD DATABASE FUNCTIONS (CALENDAR TOOL) ---
def load_state_from_cloud():
    if not UPSTASH_URL or not UPSTASH_TOKEN: return DEFAULT_STATE
    headers = {"Authorization": f"Bearer {UPSTASH_TOKEN}"}
    try:
        res = requests.get(f"{UPSTASH_URL}/get/kairos_macro_state", headers=headers, timeout=5)
        if res.status_code == 200 and res.json().get("result"): return json.loads(res.json()["result"])
    except: pass
    return DEFAULT_STATE

def save_state_to_cloud(data):
    if not UPSTASH_URL or not UPSTASH_TOKEN: return
    headers = {"Authorization": f"Bearer {UPSTASH_TOKEN}"}
    try:
        requests.post(f"{UPSTASH_URL}/set/kairos_macro_state", headers=headers, data=json.dumps(data), timeout=5)
    except: pass

# --- CLOUD DATABASE FUNCTIONS (VALUATION DASHBOARD) ---
def load_valuation_state():
    if not UPSTASH_URL or not UPSTASH_TOKEN: return None
    headers = {"Authorization": f"Bearer {UPSTASH_TOKEN}"}
    try:
        res = requests.get(f"{UPSTASH_URL}/get/kairos_valuation_state", headers=headers, timeout=5)
        if res.status_code == 200 and res.json().get("result"): return json.loads(res.json()["result"])
    except: pass
    return None

def save_valuation_state(data):
    if not UPSTASH_URL or not UPSTASH_TOKEN: return
    headers = {"Authorization": f"Bearer {UPSTASH_TOKEN}"}
    try:
        requests.post(f"{UPSTASH_URL}/set/kairos_valuation_state", headers=headers, data=json.dumps(data), timeout=5)
    except: pass

# --- API ROUTES ---
@app.get("/api/state")
def get_state():
    return load_state_from_cloud()

@app.post("/api/state")
def update_state(new_state: dict, x_admin_token: str = Header(None)):
    if x_admin_token not in ADMIN_SESSIONS: raise HTTPException(status_code=403, detail="Unauthorized")
    save_state_to_cloud(new_state)
    return {"status": "saved"}

@app.get("/api/valuation-state")
def get_val_state():
    state = load_valuation_state()
    return {"data": state} if state else {"data": None}

@app.post("/api/valuation-state")
def update_val_state(new_state: dict, x_admin_token: str = Header(None)):
    if x_admin_token not in ADMIN_SESSIONS: raise HTTPException(status_code=403, detail="Unauthorized")
    save_valuation_state(new_state)
    return {"status": "saved"}

@app.post("/api/login")
def login(req: dict):
    if req.get("password") == ADMIN_PASSWORD:
        token = secrets.token_hex(16)
        ADMIN_SESSIONS.add(token)
        return {"success": True, "token": token}
    raise HTTPException(status_code=401, detail="Invalid password")

# --- AUTOMATED CALENDAR DATA ENDPOINT ---
@app.get("/api/live-dashboard-data")
def get_live_dashboard_data():
    try:
        res = requests.get(CALENDAR_URL, timeout=10)
        events = res.json() if res.status_code == 200 else []
    except: events = []

    EVENT_NAME_MAP = {
        "USD": {"ISM Manufacturing PMI": "ISM Mfg PMI", "ISM Services PMI": "ISM Services PMI", "CPI m/m": "CPI MoM", "Core CPI m/m": "CPI MoM", "Unemployment Rate": "Unemployment Rate", "Non-Farm Employment Change": "NFP", "Retail Sales m/m": "Retail Sales MoM", "CB Consumer Confidence": "CB Consumer Confidence"},
        "EUR": {"HCOB Manufacturing PMI": "HCOB Mfg PMI", "HCOB Services PMI": "HCOB Services PMI", "CPI m/m": "CPI MoM", "German Prelim CPI m/m": "CPI MoM", "Unemployment Rate": "Unemployment Rate", "German Unemployment Change": "Germany Unemp Change", "German ifo Business Climate": "IFO Business Climate", "Retail Sales m/m": "Retail Sales MoM", "Industrial Production m/m": "Industrial Production MoM"},
        "GBP": {"Manufacturing PMI": "S&P Mfg PMI", "Services PMI": "S&P Services PMI", "CPI m/m": "CPI MoM", "Unemployment Rate": "Unemployment Rate", "Claimant Count Change": "Claimant Count", "Retail Sales m/m": "Retail Sales MoM", "GDP m/m": "Monthly GDP"},
        "JPY": {"Flash Manufacturing PMI": "Jibun Mfg PMI", "Tokyo Core CPI y/y": "Tokyo CPI MoM", "Unemployment Rate": "Unemployment Rate", "Average Cash Earnings y/y": "Cash Earnings MoM", "Retail Sales y/y": "Retail Sales MoM"},
        "AUD": {"Flash Manufacturing PMI": "Judo Mfg PMI", "CPI m/m": "CPI Indicator MoM", "Unemployment Rate": "Unemployment Rate", "Employment Change": "Employment Change", "Retail Sales m/m": "Retail Sales MoM"},
        "CAD": {"Manufacturing PMI": "S&P Mfg PMI", "Ivey PMI": "Ivey PMI", "CPI m/m": "CPI MoM", "Unemployment Rate": "Unemployment Rate", "Net Change in Employment": "Net Employment Change", "Retail Sales m/m": "Retail Sales MoM", "GDP m/m": "Monthly GDP MoM"},
        "CHF": {"procure.ch PMI": "Procure Mfg PMI", "CPI m/m": "CPI MoM", "Unemployment Rate": "Unemp Rate", "Real Retail Sales y/y": "Retail Sales MoM"},
        "NZD": {"Unemployment Rate": "Unemployment Rate", "Food Price Index m/m": "Food Prices MoM"}
    }

    updates = []
    for item in events:
        ccy = item.get("country")
        title = item.get("title")
        actual = item.get("actual")
        if ccy in EVENT_NAME_MAP and title in EVENT_NAME_MAP[ccy] and actual:
            updates.append({"ccy": ccy, "name": EVENT_NAME_MAP[ccy][title], "actual": actual, "forecast": item.get("forecast")})

    return {"status": "success", "updates": updates}

# --- RECURSIVE FILE SEARCH ENGINE ---
def find_file(target_filename: str):
    search_dirs = [REPO_ROOT, os.getcwd()]
    for base_dir in search_dirs:
        if os.path.exists(base_dir):
            for root, _, files in os.walk(base_dir):
                if target_filename in files:
                    return os.path.join(root, target_filename)
    return None

# --- DYNAMIC HTML ROUTING ---
@app.get("/", response_class=HTMLResponse)
@app.get("/index.html", response_class=HTMLResponse)
def render_index():
    path = find_file("index.html")
    if path:
        return FileResponse(path)
    raise HTTPException(status_code=404, detail="index.html not found")

@app.get("/{page_name:path}", response_class=HTMLResponse)
def render_dynamic_page(page_name: str):
    if page_name.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")

    target_file = os.path.basename(page_name)
    if not target_file.endswith(".html"):
        target_file += ".html"

    file_path = find_file(target_file)
    if file_path:
        return FileResponse(file_path)

    raise HTTPException(status_code=404, detail=f"Page '{target_file}' not found")

# --- SERVE STATIC ASSETS (CSS, JS, IMAGES) FROM REPOSITORY ROOT ---
if os.path.exists(REPO_ROOT):
    app.mount("/", StaticFiles(directory=REPO_ROOT, html=False), name="static")

# Security Monitoring and Intrusion Prevention System

A production-ready, Python-based web security monitoring and intrusion prevention tool designed for SOC environments and defensive security operations.

## Features

- **Real SecLists Integration**: Loads payloads directly from SecLists repository (recursive .txt file loading)
- **Multi-Vector Detection**: SQL Injection, XSS, Command Injection, Path Traversal, LFI/RFI, SSRF, Web Fuzzing, Brute Force, Enumeration
- **Behavioral Anomaly Detection**: Detects suspicious patterns even without known payloads
- **Automatic IP Banning**: Instantly bans malicious IPs with persistent storage
- **Comprehensive Logging**: Three-tier logging system (all events, accepted, rejected)
- **RESTful API**: Easy integration with any web application
- **Activity Tracking**: Per-IP behavioral analysis and scoring
- **Production-Ready**: Fully automated, configurable, and audit-ready

## Requirements

- Python 3.8+
- SecLists repository (cloned locally)
- Flask and Flask-CORS

## Installation

1. Clone or download this repository:
```bash
cd security
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Clone SecLists repository (if not already present):
```bash
git clone https://github.com/danielmiessler/SecLists.git seclists
```

4. Configure the system by editing `config.json`:
```json
{
    "seclists": {
        "path": "./seclists"
    },
    "api": {
        "host": "0.0.0.0",
        "port": 8080
    }
}
```

## Usage

### Starting the Server

```bash
python security_monitor.py
```

**That's it!** Everything is in one file - just run it directly.

The server will start on `http://0.0.0.0:8080` by default.

### API Endpoints

#### POST /analyze
Analyze a web request for security threats.

**Request Body:**
```json
{
    "ip": "192.168.1.100",
    "method": "GET",
    "url": "/api/users?id=1",
    "headers": {
        "User-Agent": "Mozilla/5.0...",
        "Accept": "application/json"
    },
    "query_params": {
        "id": "1"
    },
    "body": "",
    "user_agent": "Mozilla/5.0...",
    "timestamp": "2024-01-01T12:00:00"
}
```

**Response (Allowed):**
```json
{
    "allowed": true,
    "decision": "ACCEPT",
    "reason": "Clean request",
    "behavior_score": 5.2,
    "ip": "192.168.1.100"
}
```

**Response (Blocked):**
```json
{
    "allowed": false,
    "decision": "BANNED",
    "reason": "Malicious payload detected: SQL_INJECTION - Payload: ' OR 1=1--",
    "attack_type": "SQL_INJECTION",
    "payload": "' OR 1=1--",
    "ip": "192.168.1.100"
}
```

#### GET /health
Health check endpoint.

#### GET /status
Get system status and statistics.

#### GET /ip/<ip_address>
Get detailed information about a specific IP address.

#### POST /ip/<ip_address>/ban
Manually ban an IP address.

**Request Body:**
```json
{
    "reason": "Manual ban due to suspicious activity",
    "permanent": false
}
```

#### POST /ip/<ip_address>/unban
Unban an IP address.

#### GET /banned
Get list of all currently banned IPs.

## Integration Guide - How to Integrate with Any Website

### Step 1: Start the Security Monitor

First, start the security monitoring server:

```bash
cd security
python security_monitor.py
```

The server will run on `http://localhost:8080` by default.

### Step 2: Integrate with Your Web Application

Choose the integration method that matches your stack:

---

### 🔵 Flask Integration

**Create a middleware/helper module:**

```python
# security_middleware.py
import requests
from flask import request, abort
from functools import wraps

SECURITY_MONITOR_URL = "http://localhost:8080"

def check_security(f):
    """Decorator to check requests with security monitor."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Extract request data
        client_ip = request.remote_addr or request.environ.get('HTTP_X_FORWARDED_FOR', 'unknown')
        
        # Get query parameters
        query_params = dict(request.args)
        
        # Get request body (if available)
        body = ""
        if request.is_json:
            body = str(request.get_json())
        elif request.data:
            body = request.data.decode('utf-8', errors='ignore')
        
        # Get headers
        headers = dict(request.headers)
        
        # Prepare payload
        payload = {
            "ip": client_ip,
            "method": request.method,
            "url": request.path,
            "headers": headers,
            "query_params": query_params,
            "body": body,
            "user_agent": request.headers.get('User-Agent', '')
        }
        
        # Check with security monitor
        try:
            response = requests.post(
                f"{SECURITY_MONITOR_URL}/analyze",
                json=payload,
                timeout=2
            )
            result = response.json()
            
            if not result.get("allowed", False):
                # Log the blocked request
                print(f"BLOCKED: {result.get('reason')} - IP: {client_ip}")
                abort(403, description=result.get('reason', 'Request blocked by security system'))
        except requests.exceptions.RequestException:
            # If security monitor is down, allow request (fail-open)
            # Change to fail-closed by uncommenting next line:
            # abort(503, description='Security monitor unavailable')
            pass
        
        return f(*args, **kwargs)
    return decorated_function

# Usage in your Flask app:
from flask import Flask
from security_middleware import check_security

app = Flask(__name__)

@app.route('/api/users')
@check_security  # Add this decorator to protect endpoints
def get_users():
    return {"users": []}

@app.route('/api/data')
@check_security
def get_data():
    return {"data": "sensitive information"}
```

---

### 🟢 Django Integration

**Create a middleware:**

```python
# security_middleware.py
import requests
from django.http import HttpResponseForbidden
from django.utils.deprecation import MiddlewareMixin

SECURITY_MONITOR_URL = "http://localhost:8080"

class SecurityMonitorMiddleware(MiddlewareMixin):
    """Middleware to check requests with security monitor."""
    
    def process_request(self, request):
        # Extract request data
        client_ip = self.get_client_ip(request)
        
        # Get query parameters
        query_params = dict(request.GET)
        
        # Get request body
        body = ""
        if request.body:
            body = request.body.decode('utf-8', errors='ignore')
        
        # Get headers
        headers = {k: v for k, v in request.META.items() if k.startswith('HTTP_')}
        
        # Prepare payload
        payload = {
            "ip": client_ip,
            "method": request.method,
            "url": request.path,
            "headers": headers,
            "query_params": query_params,
            "body": body,
            "user_agent": request.META.get('HTTP_USER_AGENT', '')
        }
        
        # Check with security monitor
        try:
            response = requests.post(
                f"{SECURITY_MONITOR_URL}/analyze",
                json=payload,
                timeout=2
            )
            result = response.json()
            
            if not result.get("allowed", False):
                # Log and block
                print(f"BLOCKED: {result.get('reason')} - IP: {client_ip}")
                return HttpResponseForbidden(
                    f"Request blocked: {result.get('reason', 'Security violation detected')}"
                )
        except requests.exceptions.RequestException:
            # Fail-open: allow request if monitor is down
            # Change to fail-closed by returning 503
            pass
        
        return None
    
    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

# Add to settings.py:
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'your_app.security_middleware.SecurityMonitorMiddleware',  # Add this
    # ... other middleware
]
```

---

### 🟡 FastAPI Integration

**Create a dependency/middleware:**

```python
# security_check.py
import requests
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
from starlette.middleware.base import BaseHTTPMiddleware

SECURITY_MONITOR_URL = "http://localhost:8080"

class SecurityMonitorMiddleware(BaseHTTPMiddleware):
    """Middleware to check requests with security monitor."""
    
    async def dispatch(self, request: Request, call_next):
        # Extract request data
        client_ip = request.client.host if request.client else "unknown"
        
        # Get query parameters
        query_params = dict(request.query_params)
        
        # Get request body
        body = ""
        if request.method in ["POST", "PUT", "PATCH"]:
            body_bytes = await request.body()
            body = body_bytes.decode('utf-8', errors='ignore')
        
        # Get headers
        headers = dict(request.headers)
        
        # Prepare payload
        payload = {
            "ip": client_ip,
            "method": request.method,
            "url": str(request.url.path),
            "headers": headers,
            "query_params": query_params,
            "body": body,
            "user_agent": request.headers.get('user-agent', '')
        }
        
        # Check with security monitor
        try:
            response = requests.post(
                f"{SECURITY_MONITOR_URL}/analyze",
                json=payload,
                timeout=2
            )
            result = response.json()
            
            if not result.get("allowed", False):
                raise HTTPException(
                    status_code=403,
                    detail=result.get('reason', 'Request blocked by security system')
                )
        except requests.exceptions.RequestException:
            # Fail-open: allow if monitor is down
            pass
        
        response = await call_next(request)
        return response

# Usage in main.py:
from fastapi import FastAPI
from security_check import SecurityMonitorMiddleware

app = FastAPI()

# Add middleware
app.add_middleware(SecurityMonitorMiddleware)

@app.get("/api/users")
async def get_users():
    return {"users": []}
```

---

### 🟠 Express.js (Node.js) Integration

**Create middleware:**

```javascript
// security-middleware.js
const axios = require('axios');

const SECURITY_MONITOR_URL = 'http://localhost:8080';

const securityCheck = async (req, res, next) => {
    // Extract request data
    const clientIp = req.ip || req.connection.remoteAddress || 
                     req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    
    // Prepare payload
    const payload = {
        ip: clientIp,
        method: req.method,
        url: req.path,
        headers: req.headers,
        query_params: req.query,
        body: req.body ? JSON.stringify(req.body) : '',
        user_agent: req.headers['user-agent'] || ''
    };
    
    // Check with security monitor
    try {
        const response = await axios.post(
            `${SECURITY_MONITOR_URL}/analyze`,
            payload,
            { timeout: 2000 }
        );
        
        if (!response.data.allowed) {
            console.log(`BLOCKED: ${response.data.reason} - IP: ${clientIp}`);
            return res.status(403).json({
                error: 'Request blocked',
                reason: response.data.reason
            });
        }
    } catch (error) {
        // Fail-open: allow if monitor is down
        console.error('Security monitor error:', error.message);
    }
    
    next();
};

module.exports = securityCheck;

// Usage in app.js:
const express = require('express');
const securityCheck = require('./security-middleware');

const app = express();
app.use(express.json());

// Apply to all routes
app.use(securityCheck);

// Or apply to specific routes:
app.use('/api', securityCheck);

app.get('/api/users', (req, res) => {
    res.json({ users: [] });
});
```

---

### 🔴 Nginx Reverse Proxy Integration

**Using Nginx with Lua (requires lua-resty-http):**

```nginx
# nginx.conf
http {
    lua_package_path "/path/to/lua-resty-http/lib/?.lua;;";
    
    init_by_lua_block {
        local http = require "resty.http"
        security_monitor_url = "http://localhost:8080"
    }
    
    server {
        listen 80;
        server_name yourdomain.com;
        
        access_by_lua_block {
            local http = require "resty.http"
            local cjson = require "cjson"
            
            local client_ip = ngx.var.remote_addr
            local method = ngx.var.request_method
            local uri = ngx.var.request_uri
            local user_agent = ngx.var.http_user_agent or ""
            
            -- Get query string
            local args = ngx.req.get_uri_args()
            local query_params = {}
            for k, v in pairs(args) do
                query_params[k] = v
            end
            
            -- Prepare payload
            local payload = {
                ip = client_ip,
                method = method,
                url = uri,
                headers = ngx.req.get_headers(),
                query_params = query_params,
                body = "",
                user_agent = user_agent
            }
            
            -- Check with security monitor
            local httpc = http.new()
            httpc:set_timeout(2000)
            local res, err = httpc:request_uri(security_monitor_url .. "/analyze", {
                method = "POST",
                body = cjson.encode(payload),
                headers = {
                    ["Content-Type"] = "application/json"
                }
            })
            
            if res and res.status == 200 then
                local result = cjson.decode(res.body)
                if not result.allowed then
                    ngx.log(ngx.ERR, "BLOCKED: " .. result.reason .. " - IP: " .. client_ip)
                    ngx.status = 403
                    ngx.say('{"error": "Request blocked", "reason": "' .. result.reason .. '"}')
                    ngx.exit(403)
                end
            end
        }
        
        location / {
            proxy_pass http://your-backend;
        }
    }
}
```

---

### 🟣 Generic Python Integration (Any Framework)

**Standalone helper function:**

```python
# security_helper.py
import requests
from typing import Dict, Tuple, Optional

SECURITY_MONITOR_URL = "http://localhost:8080"

def check_request(
    ip: str,
    method: str,
    url: str,
    headers: Optional[Dict] = None,
    query_params: Optional[Dict] = None,
    body: str = "",
    user_agent: str = ""
) -> Tuple[bool, Optional[str]]:
    """
    Check if a request should be allowed.
    
    Returns:
        (allowed: bool, reason: str or None)
    """
    payload = {
        "ip": ip,
        "method": method,
        "url": url,
        "headers": headers or {},
        "query_params": query_params or {},
        "body": body,
        "user_agent": user_agent
    }
    
    try:
        response = requests.post(
            f"{SECURITY_MONITOR_URL}/analyze",
            json=payload,
            timeout=2
        )
        result = response.json()
        
        if not result.get("allowed", False):
            return False, result.get("reason", "Request blocked")
        
        return True, None
    except requests.exceptions.RequestException as e:
        # Fail-open: return True if monitor is unavailable
        # Change to (False, "Security monitor unavailable") for fail-closed
        return True, None

# Usage example:
allowed, reason = check_request(
    ip="192.168.1.100",
    method="GET",
    url="/api/users",
    query_params={"id": "1"},
    user_agent="Mozilla/5.0"
)

if not allowed:
    print(f"Blocked: {reason}")
    # Return 403 Forbidden
else:
    # Process request normally
    pass
```

---

### ⚙️ Configuration Options

**Fail-Open vs Fail-Closed:**

- **Fail-Open** (default): If security monitor is down, allow requests
- **Fail-Closed**: If security monitor is down, block all requests

To implement fail-closed, change exception handling to block requests when the monitor is unavailable.

**Timeout Settings:**

Adjust the timeout (currently 2 seconds) based on your latency requirements:

```python
response = requests.post(..., timeout=5)  # Increase timeout
```

---

### 📊 Monitoring Integration

**Check system status:**

```python
import requests

# Get system status
response = requests.get("http://localhost:8080/status")
status = response.json()
print(f"Banned IPs: {status['statistics']['banned_ips']}")
print(f"Tracked IPs: {status['statistics']['tracked_ips']}")

# Get IP information
response = requests.get("http://localhost:8080/ip/192.168.1.100")
ip_info = response.json()
print(f"Banned: {ip_info['banned']}")
print(f"Activity: {ip_info['activity']}")
```

---

### 🚀 Production Deployment Tips

1. **Run security monitor as a service:**
   ```bash
   # Using systemd
   sudo systemctl start security-monitor
   
   # Or use Docker
   docker run -d -p 8080:8080 security-monitor
   ```

2. **Use environment variables for URL:**
   ```python
   import os
   SECURITY_MONITOR_URL = os.getenv('SECURITY_MONITOR_URL', 'http://localhost:8080')
   ```

3. **Add health checks:**
   ```python
   # Check if monitor is healthy before processing
   health = requests.get(f"{SECURITY_MONITOR_URL}/health", timeout=1)
   if health.status_code != 200:
       # Handle monitor down scenario
       pass
   ```

4. **Log blocked requests:**
   ```python
   import logging
   logger = logging.getLogger(__name__)
   
   if not result["allowed"]:
       logger.warning(f"Blocked request from {ip}: {result['reason']}")
   ```

## Configuration

Edit `config.json` to customize:

- **API Settings**: Host, port, debug mode
- **SecLists Path**: Location of SecLists repository
- **Detection Flags**: Enable/disable specific attack detection types
- **Anomaly Detection**: Thresholds for behavioral analysis
- **IP Banning**: Auto-ban settings and ban duration
- **Logging**: Log file paths and log level
- **Activity Tracking**: Tracking window and limits

## Log Files

The system maintains three log files:

- **log.txt**: All events (accepted, rejected, banned, system events)
- **accept_log.txt**: Only clean/allowed requests
- **reject_log.txt**: Only blocked/malicious requests

Each log entry includes:
- Timestamp
- IP address
- Decision (ACCEPT/REJECT/BANNED)
- Reason
- Attack type (if detected)
- Payload (if malicious)
- Endpoint accessed
- HTTP method
- User-Agent
- Behavior score
- Request count

## Architecture

**All-in-One Design - Everything in ONE Python File:**
```
security/
├── security_monitor.py    # ⭐ COMPLETE SYSTEM - ALL CODE IN ONE FILE (1739 lines)
│                          # - Configuration management
│                          # - SecLists payload loading and detection
│                          # - Behavioral anomaly detection
│                          # - IP banning and management
│                          # - Multi-file logging system
│                          # - Per-IP activity tracking
│                          # - REST API server
│                          # - Test suite (integrated)
├── config.json            # Configuration file
├── banned_ips.txt         # Persistent ban list (generated)
├── log.txt                # All events log (generated)
├── accept_log.txt         # Accepted requests log (generated)
├── reject_log.txt         # Rejected requests log (generated)
└── requirements.txt       # Python dependencies
```

**Single File = 1739 lines of production-ready code!**

## Security Features

1. **Payload Detection**: Matches requests against real SecLists payloads
2. **Pattern Matching**: Regex-based detection for common attack vectors
3. **Behavioral Analysis**: Tracks request rates, endpoint diversity, user agent patterns
4. **Anomaly Scoring**: Calculates behavior scores to detect suspicious activity
5. **Automatic Banning**: Instantly bans IPs on detection
6. **Persistent Bans**: Bans survive server restarts
7. **Comprehensive Logging**: Full audit trail of all security events

## Notes

- The system requires SecLists to be cloned locally
- Banned IPs are stored in `banned_ips.txt` and persist across restarts
- Log files are appended to, not overwritten
- The system is designed for defensive security only
- All detection is based on real-world attack patterns and payloads

## License

This tool is designed for defensive security purposes only. Use responsibly and in accordance with applicable laws and regulations.

# Quick Start Guide

## Security Monitoring and Intrusion Prevention System

### Prerequisites

1. **Python 3.8+** installed
2. **SecLists repository** cloned locally (optional but recommended)

### Installation (5 minutes)

```bash
# 1. Navigate to security directory
cd security

# 2. Install dependencies
pip install -r requirements.txt

# 3. Clone SecLists (if not already present)
git clone https://github.com/danielmiessler/SecLists.git seclists

# 4. Verify configuration
cat config.json
```

### Starting the Server

**Start the server:**
```bash
python security_monitor.py
```

The server will start on `http://0.0.0.0:8080` by default.

### Quick Test

**In a new terminal:**

```bash
# Test health endpoint
curl http://localhost:8080/health

# Test with a clean request
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.100",
    "method": "GET",
    "url": "/api/users",
    "headers": {"User-Agent": "Mozilla/5.0"},
    "query_params": {},
    "body": "",
    "user_agent": "Mozilla/5.0"
  }'

# Test with SQL injection (should be blocked)
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.200",
    "method": "GET",
    "url": "/api/users",
    "query_params": {"id": "1'\'' OR '\''1'\''='\''1"},
    "user_agent": "Mozilla/5.0"
  }'
```

### Running Test Suite

```bash
# Make sure server is running in another terminal
python security_monitor.py --test
```

### Integration Example

**Python Integration:**
```python
import requests

def check_request(ip, method, url, headers, query_params, body, user_agent):
    """Check if a request should be allowed."""
    payload = {
        "ip": ip,
        "method": method,
        "url": url,
        "headers": headers,
        "query_params": query_params,
        "body": body,
        "user_agent": user_agent
    }
    
    response = requests.post("http://localhost:8080/analyze", json=payload)
    result = response.json()
    
    if not result["allowed"]:
        # Block the request
        print(f"BLOCKED: {result['reason']}")
        return False
    
    return True

# Usage
allowed = check_request(
    ip="192.168.1.100",
    method="GET",
    url="/api/users",
    headers={"User-Agent": "Mozilla/5.0"},
    query_params={"id": "1"},
    body="",
    user_agent="Mozilla/5.0"
)
```

### Key Features

✅ **Real SecLists Integration** - Loads actual payloads from SecLists  
✅ **Multi-Vector Detection** - SQL Injection, XSS, Command Injection, etc.  
✅ **Behavioral Anomaly Detection** - Detects suspicious patterns  
✅ **Automatic IP Banning** - Instantly bans malicious IPs  
✅ **Comprehensive Logging** - Three-tier logging system  
✅ **API Rate Limiting** - Protects the API itself  
✅ **Production-Ready** - Fully automated and configurable  

### Configuration

Edit `config.json` to customize:
- API host/port
- SecLists path
- Detection thresholds
- Ban duration
- Log file paths

### Log Files

- `log.txt` - All events
- `accept_log.txt` - Clean requests only
- `reject_log.txt` - Blocked requests only
- `banned_ips.txt` - Banned IP addresses

### API Endpoints

- `POST /analyze` - Analyze a web request
- `GET /health` - Health check
- `GET /status` - System status
- `GET /ip/<ip>` - Get IP information
- `POST /ip/<ip>/ban` - Ban an IP
- `POST /ip/<ip>/unban` - Unban an IP
- `GET /banned` - List banned IPs

### Troubleshooting

**Issue: SecLists not found**
```bash
# Clone SecLists
git clone https://github.com/danielmiessler/SecLists.git seclists

# Or update config.json to point to your SecLists location
```

**Issue: Port already in use**
```bash
# Edit config.json and change the port
{
  "api": {
    "port": 8081
  }
}
```

**Issue: Import errors**
```bash
# Reinstall dependencies
pip install -r requirements.txt --upgrade
```

### Next Steps

1. Review `config.json` for your environment
2. Integrate with your web application
3. Monitor log files for security events
4. Adjust thresholds based on your traffic patterns

---

**Ready for production deployment!** 🚀

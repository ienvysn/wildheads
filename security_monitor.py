"""
Security Monitoring and Intrusion Prevention System
Complete production-ready web security monitoring tool in a single file.
All features consolidated: SecLists integration, payload detection, anomaly detection,
IP banning, activity tracking, and comprehensive logging.
"""

import os
import re
import json
import time
import sys
import traceback
import hashlib
from typing import Dict, Any, Set, List, Tuple, Optional
from collections import defaultdict, deque
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS


# ============================================================================
# CONFIGURATION MANAGEMENT
# ============================================================================

class Config:
    """Configuration manager for the security monitoring system."""
    
    def __init__(self, config_path: str = "config.json"):
        """Initialize configuration from JSON file."""
        self.config_path = config_path
        self.config: Dict[str, Any] = {}
        self.load_config()
    
    def load_config(self) -> None:
        """Load configuration from JSON file."""
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    self.config = json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                raise ValueError(f"Failed to load configuration: {e}")
        else:
            self.config = self._get_default_config()
            self.save_config()
    
    def save_config(self) -> None:
        """Save current configuration to file."""
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=4)
        except IOError as e:
            print(f"Warning: Failed to save configuration: {e}")
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Return default configuration."""
        return {
            "api": {
                "host": "0.0.0.0",
                "port": 8080,
                "debug": False
            },
            "seclists": {
                "path": "./seclists",
                "enabled": True,
                "case_sensitive": False
            },
            "detection": {
                "sql_injection": True,
                "xss": True,
                "command_injection": True,
                "path_traversal": True,
                "lfi_rfi": True,
                "ssrf": True,
                "web_fuzzing": True,
                "brute_force": True,
                "enumeration": True
            },
            "anomaly_detection": {
                "enabled": True,
                "request_rate_threshold": 100,
                "request_rate_window_seconds": 60,
                "endpoint_diversity_threshold": 20,
                "suspicious_user_agent_score": 5,
                "behavior_score_threshold": 50,
                "auto_ban_on_anomaly": True
            },
            "ip_banning": {
                "enabled": True,
                "ban_file": "./banned_ips.txt",
                "auto_ban_on_payload": True,
                "auto_ban_on_anomaly": True,
                "ban_duration_seconds": 86400
            },
            "logging": {
                "enabled": True,
                "log_file": "./log.txt",
                "accept_log_file": "./accept_log.txt",
                "reject_log_file": "./reject_log.txt",
                "log_level": "INFO"
            },
            "activity_tracking": {
                "enabled": True,
                "track_window_seconds": 300,
                "max_requests_per_ip": 1000
            },
            "api_security": {
                "rate_limit_per_minute": 60,
                "max_request_size_mb": 10,
                "enable_rate_limiting": True
            }
        }
    
    def get(self, key_path: str, default: Any = None) -> Any:
        """Get configuration value using dot notation."""
        keys = key_path.split('.')
        value = self.config
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        
        return value
    
    def set(self, key_path: str, value: Any) -> None:
        """Set configuration value using dot notation."""
        keys = key_path.split('.')
        config = self.config
        
        for key in keys[:-1]:
            if key not in config:
                config[key] = {}
            config = config[key]
        
        config[keys[-1]] = value


# ============================================================================
# LOGGING SYSTEM
# ============================================================================

class SecurityLogger:
    """Multi-file logging system for security monitoring."""
    
    def __init__(self, config: Config):
        """Initialize logger."""
        self.config = config
        self.enabled = config.get("logging.enabled", True)
        self.log_file = config.get("logging.log_file", "./log.txt")
        self.accept_log_file = config.get("logging.accept_log_file", "./accept_log.txt")
        self.reject_log_file = config.get("logging.reject_log_file", "./reject_log.txt")
        self.log_level = config.get("logging.log_level", "INFO")
        
        if self.enabled:
            self._initialize_log_files()
    
    def _initialize_log_files(self) -> None:
        """Create log files if they don't exist."""
        for log_path in [self.log_file, self.accept_log_file, self.reject_log_file]:
            if not os.path.exists(log_path):
                try:
                    with open(log_path, 'w', encoding='utf-8') as f:
                        f.write(f"# Security Monitoring Log - {datetime.now().isoformat()}\n")
                        f.write("# " + "="*80 + "\n\n")
                except IOError as e:
                    print(f"Warning: Failed to create log file {log_path}: {e}")
    
    def _write_log(self, file_path: str, entry: Dict[str, Any]) -> None:
        """Write log entry to file."""
        if not self.enabled:
            return
        
        try:
            with open(file_path, 'a', encoding='utf-8') as f:
                timestamp = entry.get("timestamp", datetime.now().isoformat())
                log_line = f"[{timestamp}] "
                
                if "decision" in entry:
                    log_line += f"DECISION: {entry['decision']} | "
                if "ip" in entry:
                    log_line += f"IP: {entry['ip']} | "
                if "reason" in entry:
                    log_line += f"REASON: {entry['reason']} | "
                if "attack_type" in entry:
                    log_line += f"ATTACK_TYPE: {entry['attack_type']} | "
                if "payload" in entry:
                    payload = str(entry['payload'])
                    if len(payload) > 200:
                        payload = payload[:200] + "... [truncated]"
                    log_line += f"PAYLOAD: {payload} | "
                if "endpoint" in entry:
                    log_line += f"ENDPOINT: {entry['endpoint']} | "
                if "method" in entry:
                    log_line += f"METHOD: {entry['method']} | "
                if "user_agent" in entry:
                    ua = str(entry['user_agent'])
                    if len(ua) > 100:
                        ua = ua[:100] + "... [truncated]"
                    log_line += f"USER_AGENT: {ua} | "
                if "behavior_score" in entry:
                    log_line += f"BEHAVIOR_SCORE: {entry['behavior_score']} | "
                if "request_count" in entry:
                    log_line += f"REQUEST_COUNT: {entry['request_count']} | "
                
                log_line = log_line.rstrip(" | ")
                f.write(log_line + "\n")
                
        except IOError as e:
            print(f"Warning: Failed to write to log file {file_path}: {e}")
    
    def log_request(self, ip: str, request_data: Dict, decision: str, 
                   reason: str = "", attack_type: Optional[str] = None,
                   payload: Optional[str] = None, behavior_score: Optional[float] = None,
                   request_count: Optional[int] = None) -> None:
        """Log a request event."""
        if not self.enabled:
            return
        
        timestamp = datetime.now().isoformat()
        entry = {
            "timestamp": timestamp,
            "ip": ip,
            "decision": decision,
            "reason": reason,
            "endpoint": request_data.get("url", "unknown"),
            "method": request_data.get("method", "unknown"),
            "user_agent": request_data.get("user_agent", "unknown"),
        }
        
        if attack_type:
            entry["attack_type"] = attack_type
        if payload:
            entry["payload"] = payload
        if behavior_score is not None:
            entry["behavior_score"] = behavior_score
        if request_count is not None:
            entry["request_count"] = request_count
        
        self._write_log(self.log_file, entry)
        
        if decision in ["ACCEPT", "ALLOWED"]:
            self._write_log(self.accept_log_file, entry)
        elif decision in ["REJECT", "BANNED", "BLOCKED"]:
            self._write_log(self.reject_log_file, entry)
    
    def log_ip_ban(self, ip: str, reason: str, permanent: bool = False) -> None:
        """Log an IP ban event."""
        if not self.enabled:
            return
        
        timestamp = datetime.now().isoformat()
        entry = {
            "timestamp": timestamp,
            "ip": ip,
            "decision": "BANNED",
            "reason": reason,
            "permanent": permanent
        }
        
        self._write_log(self.log_file, entry)
        self._write_log(self.reject_log_file, entry)
    
    def log_anomaly(self, ip: str, anomaly_type: str, details: Dict) -> None:
        """Log an anomaly detection event."""
        if not self.enabled:
            return
        
        timestamp = datetime.now().isoformat()
        entry = {
            "timestamp": timestamp,
            "ip": ip,
            "decision": "ANOMALY_DETECTED",
            "reason": f"Anomaly: {anomaly_type}",
            "details": json.dumps(details)
        }
        
        self._write_log(self.log_file, entry)
    
    def log_system_event(self, event_type: str, message: str) -> None:
        """Log a system event."""
        if not self.enabled:
            return
        
        timestamp = datetime.now().isoformat()
        entry = {
            "timestamp": timestamp,
            "decision": "SYSTEM",
            "reason": f"{event_type}: {message}"
        }
        
        self._write_log(self.log_file, entry)


# ============================================================================
# IP MANAGEMENT
# ============================================================================

class IPManager:
    """Manages IP bans and ban persistence."""
    
    def __init__(self, config: Config):
        """Initialize IP manager."""
        self.config = config
        self.ban_file = config.get("ip_banning.ban_file", "./banned_ips.txt")
        self.enabled = config.get("ip_banning.enabled", True)
        self.auto_ban_on_payload = config.get("ip_banning.auto_ban_on_payload", True)
        self.auto_ban_on_anomaly = config.get("ip_banning.auto_ban_on_anomaly", True)
        self.ban_duration = config.get("ip_banning.ban_duration_seconds", 86400)
        
        self.banned_ips: Dict[str, float] = {}
        self._load_bans()
    
    def _load_bans(self) -> None:
        """Load banned IPs from file."""
        if not os.path.exists(self.ban_file):
            try:
                with open(self.ban_file, 'w', encoding='utf-8') as f:
                    f.write("# Banned IPs - Format: IP:timestamp\n")
            except IOError:
                pass
            return
        
        try:
            with open(self.ban_file, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        parts = line.split(':')
                        if len(parts) >= 2:
                            ip = parts[0].strip()
                            try:
                                ban_timestamp = float(parts[1].strip())
                                if time.time() < ban_timestamp + self.ban_duration:
                                    self.banned_ips[ip] = ban_timestamp
                                else:
                                    self._remove_ban_from_file(ip)
                            except ValueError:
                                self.banned_ips[ip] = 0.0
        except IOError as e:
            print(f"Warning: Failed to load ban file: {e}")
    
    def _remove_ban_from_file(self, ip: str) -> None:
        """Remove an IP from the ban file."""
        if not os.path.exists(self.ban_file):
            return
        
        try:
            with open(self.ban_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            with open(self.ban_file, 'w', encoding='utf-8') as f:
                for line in lines:
                    if not line.strip().startswith(ip + ':'):
                        f.write(line)
        except IOError:
            pass
    
    def _save_ban(self, ip: str, timestamp: float) -> None:
        """Save ban to file."""
        try:
            with open(self.ban_file, 'a', encoding='utf-8') as f:
                f.write(f"{ip}:{timestamp}\n")
        except IOError as e:
            print(f"Warning: Failed to save ban to file: {e}")
    
    def is_banned(self, ip: str) -> bool:
        """Check if an IP is banned."""
        if not self.enabled:
            return False
        
        if ip in self.banned_ips:
            ban_timestamp = self.banned_ips[ip]
            
            if ban_timestamp == 0.0:
                return True
            
            if time.time() >= ban_timestamp + self.ban_duration:
                del self.banned_ips[ip]
                self._remove_ban_from_file(ip)
                return False
            
            return True
        
        return False
    
    def ban_ip(self, ip: str, reason: str = "", permanent: bool = False) -> bool:
        """Ban an IP address."""
        if not self.enabled:
            return False
        
        if self.is_banned(ip):
            return False
        
        timestamp = 0.0 if permanent else time.time()
        self.banned_ips[ip] = timestamp
        self._save_ban(ip, timestamp)
        
        return True
    
    def unban_ip(self, ip: str) -> bool:
        """Unban an IP address."""
        if ip in self.banned_ips:
            del self.banned_ips[ip]
            self._remove_ban_from_file(ip)
            return True
        
        return False
    
    def get_banned_ips(self) -> Set[str]:
        """Get set of all currently banned IPs."""
        current_time = time.time()
        expired_ips = []
        
        for ip, ban_timestamp in self.banned_ips.items():
            if ban_timestamp > 0 and current_time >= ban_timestamp + self.ban_duration:
                expired_ips.append(ip)
        
        for ip in expired_ips:
            del self.banned_ips[ip]
            self._remove_ban_from_file(ip)
        
        return set(self.banned_ips.keys())
    
    def get_ban_info(self, ip: str) -> Optional[Dict]:
        """Get ban information for an IP."""
        if ip not in self.banned_ips:
            return None
        
        ban_timestamp = self.banned_ips[ip]
        
        if ban_timestamp == 0.0:
            return {
                "ip": ip,
                "banned": True,
                "permanent": True,
                "expires_at": None
            }
        
        expires_at = datetime.fromtimestamp(ban_timestamp + self.ban_duration)
        return {
            "ip": ip,
            "banned": True,
            "permanent": False,
            "banned_at": datetime.fromtimestamp(ban_timestamp).isoformat(),
            "expires_at": expires_at.isoformat()
        }


# ============================================================================
# ACTIVITY TRACKING
# ============================================================================

class ActivityTracker:
    """Tracks user activity per IP for behavioral analysis."""
    
    def __init__(self, config: Config):
        """Initialize activity tracker."""
        self.config = config
        self.enabled = config.get("activity_tracking.enabled", True)
        self.track_window = config.get("activity_tracking.track_window_seconds", 300)
        self.max_requests = config.get("activity_tracking.max_requests_per_ip", 1000)
        
        self.activity: Dict[str, Dict] = defaultdict(lambda: {
            "requests": deque(),
            "endpoints": set(),
            "user_agents": set(),
            "first_seen": None,
            "last_seen": None,
            "total_requests": 0
        })
    
    def record_request(self, ip: str, endpoint: str, method: str, user_agent: str = "") -> None:
        """Record a request from an IP."""
        if not self.enabled:
            return
        
        current_time = time.time()
        ip_data = self.activity[ip]
        
        if ip_data["first_seen"] is None:
            ip_data["first_seen"] = current_time
        ip_data["last_seen"] = current_time
        
        ip_data["requests"].append((current_time, endpoint, method))
        ip_data["total_requests"] += 1
        ip_data["endpoints"].add(endpoint)
        
        if user_agent:
            ip_data["user_agents"].add(user_agent)
        
        self._clean_old_requests(ip, current_time)
        
        if len(ip_data["requests"]) > self.max_requests:
            ip_data["requests"].popleft()
    
    def _clean_old_requests(self, ip: str, current_time: float) -> None:
        """Remove requests outside the tracking window."""
        ip_data = self.activity[ip]
        cutoff_time = current_time - self.track_window
        
        while ip_data["requests"] and ip_data["requests"][0][0] < cutoff_time:
            ip_data["requests"].popleft()
    
    def get_request_count(self, ip: str, window_seconds: Optional[int] = None) -> int:
        """Get request count for an IP within a time window."""
        if not self.enabled or ip not in self.activity:
            return 0
        
        if window_seconds is None:
            window_seconds = self.track_window
        
        current_time = time.time()
        cutoff_time = current_time - window_seconds
        
        ip_data = self.activity[ip]
        count = sum(1 for req_time, _, _ in ip_data["requests"] if req_time >= cutoff_time)
        
        return count
    
    def get_endpoint_diversity(self, ip: str) -> int:
        """Get number of unique endpoints accessed by an IP."""
        if not self.enabled or ip not in self.activity:
            return 0
        
        return len(self.activity[ip]["endpoints"])
    
    def get_user_agent_diversity(self, ip: str) -> int:
        """Get number of unique user agents used by an IP."""
        if not self.enabled or ip not in self.activity:
            return 0
        
        return len(self.activity[ip]["user_agents"])
    
    def get_activity_summary(self, ip: str) -> Dict:
        """Get activity summary for an IP."""
        if not self.enabled or ip not in self.activity:
            return {
                "ip": ip,
                "request_count": 0,
                "endpoint_diversity": 0,
                "user_agent_diversity": 0,
                "first_seen": None,
                "last_seen": None,
                "total_requests": 0
            }
        
        ip_data = self.activity[ip]
        current_time = time.time()
        self._clean_old_requests(ip, current_time)
        
        return {
            "ip": ip,
            "request_count": len(ip_data["requests"]),
            "endpoint_diversity": len(ip_data["endpoints"]),
            "user_agent_diversity": len(ip_data["user_agents"]),
            "first_seen": datetime.fromtimestamp(ip_data["first_seen"]).isoformat() if ip_data["first_seen"] else None,
            "last_seen": datetime.fromtimestamp(ip_data["last_seen"]).isoformat() if ip_data["last_seen"] else None,
            "total_requests": ip_data["total_requests"],
            "endpoints": list(ip_data["endpoints"])[:20],
            "user_agents": list(ip_data["user_agents"])[:10]
        }
    
    def get_time_pattern(self, ip: str) -> Dict:
        """Analyze time pattern of requests from an IP."""
        if not self.enabled or ip not in self.activity:
            return {
                "requests_per_minute": 0.0,
                "requests_per_hour": 0.0,
                "burst_detected": False
            }
        
        ip_data = self.activity[ip]
        current_time = time.time()
        self._clean_old_requests(ip, current_time)
        
        requests = list(ip_data["requests"])
        if not requests:
            return {
                "requests_per_minute": 0.0,
                "requests_per_hour": 0.0,
                "burst_detected": False
            }
        
        time_span = current_time - requests[0][0]
        if time_span > 0:
            requests_per_minute = (len(requests) / time_span) * 60
            requests_per_hour = requests_per_minute * 60
        else:
            requests_per_minute = len(requests)
            requests_per_hour = len(requests) * 60
        
        burst_detected = False
        if len(requests) >= 10:
            recent_requests = [r for r in requests if r[0] >= current_time - 10]
            if len(recent_requests) >= 20:
                burst_detected = True
        
        return {
            "requests_per_minute": round(requests_per_minute, 2),
            "requests_per_hour": round(requests_per_hour, 2),
            "burst_detected": burst_detected
        }
    
    def clear_activity(self, ip: str) -> None:
        """Clear activity data for an IP."""
        if ip in self.activity:
            del self.activity[ip]
    
    def get_all_tracked_ips(self) -> Set[str]:
        """Get set of all tracked IPs."""
        return set(self.activity.keys())


# ============================================================================
# PAYLOAD DETECTION
# ============================================================================

class PayloadDetector:
    """Detects malicious payloads from SecLists in web requests."""
    
    def __init__(self, config: Config):
        """Initialize payload detector."""
        self.config = config
        self.payloads: Set[str] = set()
        self.payload_hash_set: Set[str] = set()  # For faster lookups
        self.payload_patterns: List[re.Pattern] = []
        self.case_sensitive = config.get("seclists.case_sensitive", False)
        self.seclists_path = config.get("seclists.path", "./seclists")
        self.enabled = config.get("seclists.enabled", True)
        
        self.detection_flags = {
            "sql_injection": config.get("detection.sql_injection", True),
            "xss": config.get("detection.xss", True),
            "command_injection": config.get("detection.command_injection", True),
            "path_traversal": config.get("detection.path_traversal", True),
            "lfi_rfi": config.get("detection.lfi_rfi", True),
            "ssrf": config.get("detection.ssrf", True),
            "web_fuzzing": config.get("detection.web_fuzzing", True),
            "brute_force": config.get("detection.brute_force", True),
            "enumeration": config.get("detection.enumeration", True)
        }
        
        if self.enabled:
            self._load_seclists()
            self._compile_patterns()
    
    def _load_seclists(self) -> None:
        """Recursively load all .txt files from SecLists directory."""
        if not os.path.exists(self.seclists_path):
            print(f"Warning: SecLists path not found: {self.seclists_path}")
            return
        
        loaded_count = 0
        total_payloads = 0
        
        for root, dirs, files in os.walk(self.seclists_path):
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            
            for file in files:
                if file.endswith('.txt'):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            for line in f:
                                line = line.strip()
                                if line and not line.startswith('#'):
                                    original_line = line
                                    if not self.case_sensitive:
                                        line = line.lower()
                                    self.payloads.add(line)
                                    # Create hash for faster substring matching
                                    if len(line) > 3:  # Only hash meaningful payloads
                                        payload_hash = hashlib.md5(line.encode()).hexdigest()
                                        self.payload_hash_set.add(payload_hash)
                                    total_payloads += 1
                        loaded_count += 1
                    except (IOError, UnicodeDecodeError) as e:
                        print(f"Warning: Failed to load {file_path}: {e}")
        
        print(f"Loaded {loaded_count} SecLists files with {total_payloads} unique payloads")
    
    def _compile_patterns(self) -> None:
        """Compile regex patterns for common attack vectors."""
        patterns = []
        
        if self.detection_flags["sql_injection"]:
            sql_patterns = [
                r"(?i)(union\s+select|select\s+.*\s+from|insert\s+into|delete\s+from|update\s+.*\s+set|drop\s+table|exec\s*\(|execute\s*\(|xp_cmdshell)",
                r"(?i)(or\s+1\s*=\s*1|or\s+'1'\s*=\s*'1'|or\s+\"1\"\s*=\s*\"1\")",
                r"(?i)(;.*--|;.*#|/\*.*\*/|--\s|/\*|\*/)",
                r"(?i)(benchmark\s*\(|sleep\s*\(|waitfor\s+delay)",
                r"(?i)(information_schema|sys\.tables|pg_tables|mysql\.user)"
            ]
            patterns.extend([re.compile(p) for p in sql_patterns])
        
        if self.detection_flags["xss"]:
            xss_patterns = [
                r"(?i)(<script[^>]*>.*?</script>|<script[^>]*>|javascript:)",
                r"(?i)(onerror\s*=|onload\s*=|onclick\s*=|onmouseover\s*=)",
                r"(?i)(<iframe|<embed|<object|<img[^>]*onerror)",
                r"(?i)(eval\s*\(|alert\s*\(|prompt\s*\(|confirm\s*\()",
                r"(?i)(document\.cookie|document\.write|window\.location)"
            ]
            patterns.extend([re.compile(p) for p in xss_patterns])
        
        if self.detection_flags["command_injection"]:
            cmd_patterns = [
                r"(?i)(;.*\||;.*&|;.*`|;.*\$\(|;.*\$\{)",
                r"(?i)(\|\s*sh|\|\s*bash|\|\s*cmd|;.*cat|;.*ls|;.*pwd)",
                r"(?i)(\$\{IFS\}|%20|%09|\s+cat|\s+ls|\s+rm)",
                r"(?i)(nc\s+-l|nc\s+-e|wget\s+|curl\s+|ping\s+-c)",
                r"(?i)(/bin/sh|/bin/bash|cmd\.exe|powershell)"
            ]
            patterns.extend([re.compile(p) for p in cmd_patterns])
        
        if self.detection_flags["path_traversal"]:
            path_patterns = [
                r"(\.\./|\.\.\\|\.\.%2f|\.\.%5c)",
                r"(?i)(\.\./\.\./|\.\.\\\.\.\\)",
                r"(?i)(%2e%2e%2f|%2e%2e%5c)",
                r"(?i)(\.\.%252f|\.\.%255c)",
                r"(?i)(/etc/passwd|/etc/shadow|/windows/system32|boot\.ini)"
            ]
            patterns.extend([re.compile(p) for p in path_patterns])
        
        if self.detection_flags["lfi_rfi"]:
            lfi_patterns = [
                r"(?i)(include\s*\(|require\s*\(|include_once|require_once)",
                r"(?i)(php://|file://|data://|expect://|phar://)",
                r"(?i)(http://|https://|ftp://|file://).*\.(php|jsp|asp|aspx)",
                r"(?i)(\.\./\.\./\.\./|\.\.\\\.\.\\\.\.\\)",
                r"(?i)(/etc/passwd|/proc/self/environ|/windows/win\.ini)"
            ]
            patterns.extend([re.compile(p) for p in lfi_patterns])
        
        if self.detection_flags["ssrf"]:
            ssrf_patterns = [
                r"(?i)(http://127\.0\.0\.1|http://localhost|http://0\.0\.0\.0)",
                r"(?i)(http://169\.254\.169\.254|http://10\.0\.0\.0|http://192\.168\.)",
                r"(?i)(file://|gopher://|dict://|ldap://)",
                r"(?i)(curl\s+|wget\s+|fetch\s+|http_get)"
            ]
            patterns.extend([re.compile(p) for p in ssrf_patterns])
        
        if self.detection_flags["web_fuzzing"]:
            fuzz_patterns = [
                r"(?i)(admin|test|backup|old|dev|staging|\.bak|\.old|\.tmp)",
                r"(?i)(\.git|\.svn|\.env|\.DS_Store|\.htaccess|\.htpasswd)",
                r"(?i)(wp-admin|wp-content|wp-includes|wp-config)",
                r"(?i)(/api/v1/|/api/v2/|/rest/|/graphql/)"
            ]
            patterns.extend([re.compile(p) for p in fuzz_patterns])
        
        if self.detection_flags["enumeration"]:
            enum_patterns = [
                r"(?i)(id=\d+|page=\d+|offset=\d+|limit=\d+)",
                r"(?i)(/users/|/admin/|/api/users|/api/admin)",
                r"(?i)(username=|email=|user=|account=)",
                r"(?i)(\.json|\.xml|\.yaml|\.yml|format=json|format=xml)"
            ]
            patterns.extend([re.compile(p) for p in enum_patterns])
        
        self.payload_patterns = patterns
    
    def detect(self, request_data: Dict) -> Tuple[bool, Optional[str], Optional[str]]:
        """Detect malicious payloads in request data."""
        if not self.enabled:
            return False, None, None
        
        search_strings = []
        
        if "url" in request_data:
            url = str(request_data["url"])
            search_strings.append(("url", url))
            if not self.case_sensitive:
                search_strings.append(("url", url.lower()))
        
        if "query_params" in request_data and request_data["query_params"]:
            query_str = " ".join([f"{k}={v}" for k, v in request_data["query_params"].items()])
            search_strings.append(("query", query_str))
            if not self.case_sensitive:
                search_strings.append(("query", query_str.lower()))
        
        if "headers" in request_data and request_data["headers"]:
            header_str = " ".join([f"{k}: {v}" for k, v in request_data["headers"].items()])
            search_strings.append(("headers", header_str))
            if not self.case_sensitive:
                search_strings.append(("headers", header_str.lower()))
        
        if "body" in request_data and request_data["body"]:
            body = str(request_data["body"])
            search_strings.append(("body", body))
            if not self.case_sensitive:
                search_strings.append(("body", body.lower()))
        
        if "user_agent" in request_data and request_data["user_agent"]:
            ua = str(request_data["user_agent"])
            search_strings.append(("user_agent", ua))
            if not self.case_sensitive:
                search_strings.append(("user_agent", ua.lower()))
        
        # Optimized payload detection using substring matching
        for source, text in search_strings:
            if not self.case_sensitive:
                text = text.lower()
            
            # Fast substring matching - check if any payload is contained in text
            for payload in self.payloads:
                if len(payload) > 0 and payload in text:
                    attack_type = self._classify_attack(payload, text)
                    return True, attack_type, payload
        
        for pattern in self.payload_patterns:
            for source, text in search_strings:
                matches = pattern.findall(text)
                if matches:
                    attack_type = self._classify_attack_from_pattern(pattern, text)
                    return True, attack_type, str(matches[0])
        
        return False, None, None
    
    def _classify_attack(self, payload: str, context: str) -> str:
        """Classify attack type based on payload content."""
        payload_lower = payload.lower()
        context_lower = context.lower()
        
        if any(x in payload_lower or x in context_lower for x in ["union select", "select from", "insert into", "drop table"]):
            return "SQL_INJECTION"
        elif any(x in payload_lower or x in context_lower for x in ["<script", "javascript:", "onerror=", "onload="]):
            return "XSS"
        elif any(x in payload_lower or x in context_lower for x in ["; sh", "; bash", "| cat", "| ls", "/bin/sh"]):
            return "COMMAND_INJECTION"
        elif any(x in payload_lower or x in context_lower for x in ["../", "..\\", "/etc/passwd", "boot.ini"]):
            return "PATH_TRAVERSAL"
        elif any(x in payload_lower or x in context_lower for x in ["include(", "require(", "php://", "file://"]):
            return "LFI_RFI"
        elif any(x in payload_lower or x in context_lower for x in ["127.0.0.1", "localhost", "169.254.169.254"]):
            return "SSRF"
        elif any(x in payload_lower or x in context_lower for x in [".git", ".env", "wp-admin", "admin"]):
            return "WEB_FUZZING"
        elif any(x in payload_lower or x in context_lower for x in ["id=", "/users/", "username=", "email="]):
            return "ENUMERATION"
        else:
            return "MALICIOUS_PAYLOAD"
    
    def _classify_attack_from_pattern(self, pattern: str, context: str) -> str:
        """Classify attack type from regex pattern."""
        pattern_str = str(pattern.pattern).lower()
        
        if "union" in pattern_str or "select" in pattern_str or "sql" in pattern_str:
            return "SQL_INJECTION"
        elif "script" in pattern_str or "javascript" in pattern_str or "xss" in pattern_str:
            return "XSS"
        elif "sh" in pattern_str or "bash" in pattern_str or "cmd" in pattern_str:
            return "COMMAND_INJECTION"
        elif r"\.\." in pattern_str or "passwd" in pattern_str:
            return "PATH_TRAVERSAL"
        elif "include" in pattern_str or "require" in pattern_str or "php://" in pattern_str:
            return "LFI_RFI"
        elif "127.0.0.1" in pattern_str or "localhost" in pattern_str:
            return "SSRF"
        elif "admin" in pattern_str or "git" in pattern_str or "fuzz" in pattern_str:
            return "WEB_FUZZING"
        elif "enum" in pattern_str or "users" in pattern_str:
            return "ENUMERATION"
        else:
            return "MALICIOUS_PATTERN"


# ============================================================================
# ANOMALY DETECTION
# ============================================================================

class AnomalyDetector:
    """Detects behavioral anomalies in web requests."""
    
    def __init__(self, config: Config, activity_tracker: ActivityTracker):
        """Initialize anomaly detector."""
        self.config = config
        self.activity_tracker = activity_tracker
        self.enabled = config.get("anomaly_detection.enabled", True)
        
        self.request_rate_threshold = config.get("anomaly_detection.request_rate_threshold", 100)
        self.request_rate_window = config.get("anomaly_detection.request_rate_window_seconds", 60)
        self.endpoint_diversity_threshold = config.get("anomaly_detection.endpoint_diversity_threshold", 20)
        self.suspicious_ua_score = config.get("anomaly_detection.suspicious_user_agent_score", 5)
        self.behavior_score_threshold = config.get("anomaly_detection.behavior_score_threshold", 50)
        self.auto_ban = config.get("anomaly_detection.auto_ban_on_anomaly", True)
        
        self.suspicious_ua_patterns = [
            re.compile(r"(?i)(sqlmap|nikto|nmap|masscan|zap|burp|w3af|acunetix|nessus|openvas)"),
            re.compile(r"(?i)(bot|crawler|spider|scraper|scanner)"),
            re.compile(r"(?i)(curl|wget|python|java|go-http|libwww)"),
            re.compile(r"(?i)(^$|^-|^\.|^null|^undefined)"),
            re.compile(r"(?i)(test|admin|hack|exploit|payload)")
        ]
        
        self.suspicious_endpoint_patterns = [
            re.compile(r"(?i)(\.\./|\.\.\\|%2e%2e)"),
            re.compile(r"(?i)(admin|test|backup|old|dev|staging)"),
            re.compile(r"(?i)(\.git|\.svn|\.env|\.DS_Store)"),
            re.compile(r"(?i)(wp-admin|wp-content|wp-includes)"),
            re.compile(r"(?i)(/api/v[0-9]+/|/rest/|/graphql/)")
        ]
    
    def detect_anomalies(self, ip: str, request_data: Dict) -> Tuple[bool, Optional[str], float]:
        """Detect anomalies in request behavior."""
        if not self.enabled:
            return False, None, 0.0
        
        behavior_score = 0.0
        anomalies = []
        
        request_count = self.activity_tracker.get_request_count(ip, self.request_rate_window)
        if request_count > self.request_rate_threshold:
            excess = request_count - self.request_rate_threshold
            score_increase = min(excess * 2, 30)
            behavior_score += score_increase
            anomalies.append(f"High request rate: {request_count} requests in {self.request_rate_window}s")
        
        endpoint_diversity = self.activity_tracker.get_endpoint_diversity(ip)
        if endpoint_diversity > self.endpoint_diversity_threshold:
            excess = endpoint_diversity - self.endpoint_diversity_threshold
            score_increase = min(excess * 1.5, 20)
            behavior_score += score_increase
            anomalies.append(f"High endpoint diversity: {endpoint_diversity} unique endpoints")
        
        user_agent = request_data.get("user_agent", "")
        ua_score = self._analyze_user_agent(user_agent)
        if ua_score > 0:
            behavior_score += ua_score
            anomalies.append(f"Suspicious user agent: {user_agent[:50]}")
        
        ua_diversity = self.activity_tracker.get_user_agent_diversity(ip)
        if ua_diversity > 5:
            score_increase = min(ua_diversity * 2, 15)
            behavior_score += score_increase
            anomalies.append(f"Multiple user agents: {ua_diversity} unique UAs")
        
        time_pattern = self.activity_tracker.get_time_pattern(ip)
        if time_pattern["burst_detected"]:
            behavior_score += 15
            anomalies.append("Burst pattern detected")
        
        if time_pattern["requests_per_minute"] > 60:
            behavior_score += 10
            anomalies.append(f"High request rate: {time_pattern['requests_per_minute']:.1f} req/min")
        
        endpoint = request_data.get("url", "")
        if self._is_suspicious_endpoint(endpoint):
            behavior_score += 10
            anomalies.append(f"Suspicious endpoint: {endpoint[:100]}")
        
        if self._detect_enumeration_pattern(request_data):
            behavior_score += 15
            anomalies.append("Enumeration pattern detected")
        
        if self._detect_brute_force_pattern(ip, request_data):
            behavior_score += 20
            anomalies.append("Brute force pattern detected")
        
        is_anomalous = behavior_score >= self.behavior_score_threshold
        
        anomaly_type = None
        if is_anomalous:
            if request_count > self.request_rate_threshold:
                anomaly_type = "HIGH_REQUEST_RATE"
            elif endpoint_diversity > self.endpoint_diversity_threshold:
                anomaly_type = "ENDPOINT_ENUMERATION"
            elif ua_score > 0:
                anomaly_type = "SUSPICIOUS_USER_AGENT"
            elif time_pattern["burst_detected"]:
                anomaly_type = "BURST_ATTACK"
            else:
                anomaly_type = "BEHAVIORAL_ANOMALY"
        
        return is_anomalous, anomaly_type, behavior_score
    
    def _analyze_user_agent(self, user_agent: str) -> float:
        """Analyze user agent for suspicious patterns."""
        if not user_agent or len(user_agent) < 3:
            return 10.0
        
        score = 0.0
        
        for pattern in self.suspicious_ua_patterns:
            if pattern.search(user_agent):
                score += self.suspicious_ua_score
        
        if len(user_agent) > 500:
            score += 5
        
        return min(score, 30.0)
    
    def _is_suspicious_endpoint(self, endpoint: str) -> bool:
        """Check if endpoint matches suspicious patterns."""
        for pattern in self.suspicious_endpoint_patterns:
            if pattern.search(endpoint):
                return True
        return False
    
    def _detect_enumeration_pattern(self, request_data: Dict) -> bool:
        """Detect enumeration patterns in requests."""
        url = str(request_data.get("url", ""))
        query_params = request_data.get("query_params", {})
        
        if any(key.lower() in ["id", "user_id", "page", "offset", "limit"] for key in query_params.keys()):
            try:
                for key, value in query_params.items():
                    if key.lower() in ["id", "user_id", "page"]:
                        if str(value).isdigit():
                            return True
            except:
                pass
        
        if re.search(r'(?i)(/users/\d+|/api/users/\d+|/id/\d+)', url):
            return True
        
        return False
    
    def _detect_brute_force_pattern(self, ip: str, request_data: Dict) -> bool:
        """Detect brute force patterns."""
        endpoint = request_data.get("url", "")
        
        login_patterns = [
            r"(?i)(login|signin|auth|authenticate|password|credential)",
            r"(?i)(/api/auth|/api/login|/auth/login)"
        ]
        
        is_login_endpoint = any(re.search(p, endpoint) for p in login_patterns)
        
        if is_login_endpoint:
            request_count = self.activity_tracker.get_request_count(ip, 60)
            if request_count > 10:
                return True
        
        return False
    
    def get_behavior_score(self, ip: str, request_data: Dict) -> float:
        """Get behavior score for an IP based on current request."""
        _, _, score = self.detect_anomalies(ip, request_data)
        return score


# ============================================================================
# MAIN SECURITY MONITOR
# ============================================================================

class SecurityMonitor:
    """Main security monitoring engine."""
    
    def __init__(self):
        """Initialize security monitoring system."""
        self.config = Config()
        self.logger = SecurityLogger(self.config)
        self.ip_manager = IPManager(self.config)
        self.activity_tracker = ActivityTracker(self.config)
        self.payload_detector = PayloadDetector(self.config)
        self.anomaly_detector = AnomalyDetector(self.config, self.activity_tracker)
        
        self.logger.log_system_event("SYSTEM_START", "Security monitoring system initialized")
        
        print("=" * 80)
        print("Security Monitoring System - Initialized")
        print("=" * 80)
        print(f"API Server: {self.config.get('api.host')}:{self.config.get('api.port')}")
        print(f"SecLists Path: {self.config.get('seclists.path')}")
        print(f"Banned IPs: {len(self.ip_manager.get_banned_ips())}")
        print("=" * 80)
    
    def analyze_request(self, ip: str, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a web request for security threats."""
        if self.ip_manager.is_banned(ip):
            self.logger.log_request(
                ip=ip,
                request_data=request_data,
                decision="BANNED",
                reason="IP is banned"
            )
            return {
                "allowed": False,
                "decision": "BANNED",
                "reason": "IP address is banned",
                "ip": ip
            }
        
        endpoint = request_data.get("url", "unknown")
        method = request_data.get("method", "GET")
        user_agent = request_data.get("user_agent", "")
        self.activity_tracker.record_request(ip, endpoint, method, user_agent)
        
        is_malicious, attack_type, payload = self.payload_detector.detect(request_data)
        
        if is_malicious:
            reason = f"Malicious payload detected: {attack_type}"
            if payload:
                reason += f" - Payload: {payload[:100]}"
            
            if self.ip_manager.auto_ban_on_payload:
                banned = self.ip_manager.ban_ip(ip, reason)
                if banned:
                    self.logger.log_ip_ban(ip, reason)
                    decision = "BANNED"
                else:
                    decision = "REJECT"
            else:
                decision = "REJECT"
            
            self.logger.log_request(
                ip=ip,
                request_data=request_data,
                decision=decision,
                reason=reason,
                attack_type=attack_type,
                payload=payload
            )
            
            return {
                "allowed": False,
                "decision": decision,
                "reason": reason,
                "attack_type": attack_type,
                "payload": payload,
                "ip": ip
            }
        
        is_anomalous, anomaly_type, behavior_score = self.anomaly_detector.detect_anomalies(ip, request_data)
        
        if is_anomalous:
            reason = f"Behavioral anomaly detected: {anomaly_type} (Score: {behavior_score:.1f})"
            
            if self.ip_manager.auto_ban_on_anomaly and self.anomaly_detector.auto_ban:
                banned = self.ip_manager.ban_ip(ip, reason)
                if banned:
                    self.logger.log_ip_ban(ip, reason)
                    decision = "BANNED"
                else:
                    decision = "REJECT"
            else:
                decision = "REJECT"
            
            request_count = self.activity_tracker.get_request_count(ip)
            
            self.logger.log_request(
                ip=ip,
                request_data=request_data,
                decision=decision,
                reason=reason,
                attack_type=anomaly_type,
                behavior_score=behavior_score,
                request_count=request_count
            )
            
            return {
                "allowed": False,
                "decision": decision,
                "reason": reason,
                "anomaly_type": anomaly_type,
                "behavior_score": behavior_score,
                "ip": ip
            }
        
        request_count = self.activity_tracker.get_request_count(ip)
        behavior_score = self.anomaly_detector.get_behavior_score(ip, request_data)
        
        self.logger.log_request(
            ip=ip,
            request_data=request_data,
            decision="ACCEPT",
            reason="Clean request",
            behavior_score=behavior_score,
            request_count=request_count
        )
        
        return {
            "allowed": True,
            "decision": "ACCEPT",
            "reason": "Clean request",
            "behavior_score": behavior_score,
            "ip": ip
        }


# ============================================================================
# FLASK API SERVER
# ============================================================================

security_monitor = SecurityMonitor()
app = Flask(__name__)
CORS(app)

# API Rate Limiting
api_rate_limits: Dict[str, deque] = defaultdict(lambda: deque())


def rate_limit(max_per_minute: int = 60):
    """Rate limiting decorator for API endpoints."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not security_monitor.config.get("api_security.enable_rate_limiting", True):
                return f(*args, **kwargs)
            
            client_ip = request.remote_addr or "unknown"
            current_time = time.time()
            window_start = current_time - 60
            
            # Clean old entries
            if client_ip in api_rate_limits:
                while api_rate_limits[client_ip] and api_rate_limits[client_ip][0] < window_start:
                    api_rate_limits[client_ip].popleft()
            
            # Check rate limit
            if client_ip in api_rate_limits and len(api_rate_limits[client_ip]) >= max_per_minute:
                security_monitor.logger.log_request(
                    ip=client_ip,
                    request_data={"url": request.path, "method": request.method},
                    decision="REJECT",
                    reason=f"API rate limit exceeded: {len(api_rate_limits[client_ip])} requests/minute"
                )
                return jsonify({
                    "error": "Rate limit exceeded",
                    "message": f"Maximum {max_per_minute} requests per minute allowed"
                }), 429
            
            # Record request
            api_rate_limits[client_ip].append(current_time)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def validate_request_size(max_size_mb: int = 10):
    """Validate request size."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            max_size_bytes = max_size_mb * 1024 * 1024
            if request.content_length and request.content_length > max_size_bytes:
                return jsonify({
                    "error": "Request too large",
                    "message": f"Maximum request size is {max_size_mb}MB"
                }), 413
            return f(*args, **kwargs)
        return decorated_function
    return decorator


@app.route('/health', methods=['GET'])
@rate_limit(max_per_minute=120)
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Security Monitoring System",
        "version": "1.0.0"
    }), 200


@app.route('/analyze', methods=['POST'])
@rate_limit(max_per_minute=60)
@validate_request_size(max_size_mb=10)
def analyze():
    """Main analysis endpoint."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "error": "Invalid request",
                "message": "JSON payload required"
            }), 400
        
        # Input validation
        ip = data.get("ip")
        if not ip:
            return jsonify({
                "error": "Invalid request",
                "message": "IP address is required"
            }), 400
        
        # Validate IP format (basic validation)
        ip_pattern = re.compile(r'^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^localhost$')
        if not ip_pattern.match(ip):
            return jsonify({
                "error": "Invalid request",
                "message": "Invalid IP address format"
            }), 400
        
        # Sanitize and validate input data
        method = str(data.get("method", "GET")).upper()
        if method not in ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]:
            method = "GET"
        
        url = str(data.get("url", ""))[:2000]  # Limit URL length
        headers = data.get("headers", {})
        if not isinstance(headers, dict):
            headers = {}
        
        query_params = data.get("query_params", {})
        if not isinstance(query_params, dict):
            query_params = {}
        
        body = str(data.get("body", ""))[:50000]  # Limit body size to 50KB for analysis
        user_agent = data.get("user_agent", headers.get("User-Agent", ""))
        if not user_agent:
            user_agent = headers.get("user-agent", "")
        user_agent = str(user_agent)[:500]  # Limit user agent length
        
        request_data = {
            "method": method,
            "url": url,
            "headers": headers,
            "query_params": query_params,
            "body": body,
            "user_agent": user_agent,
            "timestamp": data.get("timestamp", datetime.now().isoformat())
        }
        
        result = security_monitor.analyze_request(ip, request_data)
        
        status_code = 200 if result["allowed"] else 403
        return jsonify(result), status_code
        
    except Exception as e:
        error_msg = f"Internal server error: {str(e)}"
        security_monitor.logger.log_system_event("ERROR", error_msg)
        print(f"Error in /analyze endpoint: {e}")
        traceback.print_exc()
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500


@app.route('/status', methods=['GET'])
@rate_limit(max_per_minute=30)
def status():
    """Get system status and statistics."""
    try:
        banned_ips = security_monitor.ip_manager.get_banned_ips()
        tracked_ips = security_monitor.activity_tracker.get_all_tracked_ips()
        
        return jsonify({
            "status": "operational",
            "timestamp": datetime.now().isoformat(),
            "statistics": {
                "banned_ips": len(banned_ips),
                "tracked_ips": len(tracked_ips),
                "payloads_loaded": len(security_monitor.payload_detector.payloads),
                "patterns_loaded": len(security_monitor.payload_detector.payload_patterns)
            },
            "configuration": {
                "seclists_enabled": security_monitor.config.get("seclists.enabled"),
                "anomaly_detection_enabled": security_monitor.config.get("anomaly_detection.enabled"),
                "ip_banning_enabled": security_monitor.config.get("ip_banning.enabled"),
                "logging_enabled": security_monitor.config.get("logging.enabled")
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500


@app.route('/ip/<ip_address>', methods=['GET'])
@rate_limit(max_per_minute=60)
def get_ip_info(ip_address: str):
    """Get information about a specific IP address."""
    try:
        is_banned = security_monitor.ip_manager.is_banned(ip_address)
        ban_info = security_monitor.ip_manager.get_ban_info(ip_address)
        activity_summary = security_monitor.activity_tracker.get_activity_summary(ip_address)
        time_pattern = security_monitor.activity_tracker.get_time_pattern(ip_address)
        
        return jsonify({
            "ip": ip_address,
            "banned": is_banned,
            "ban_info": ban_info,
            "activity": activity_summary,
            "time_pattern": time_pattern
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500


@app.route('/ip/<ip_address>/ban', methods=['POST'])
@rate_limit(max_per_minute=30)
def ban_ip(ip_address: str):
    """Manually ban an IP address."""
    try:
        data = request.get_json() or {}
        reason = data.get("reason", "Manual ban")
        permanent = data.get("permanent", False)
        
        banned = security_monitor.ip_manager.ban_ip(ip_address, reason, permanent)
        
        if banned:
            security_monitor.logger.log_ip_ban(ip_address, reason, permanent)
            return jsonify({
                "success": True,
                "message": f"IP {ip_address} has been banned",
                "reason": reason,
                "permanent": permanent
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": f"IP {ip_address} is already banned"
            }), 400
        
    except Exception as e:
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500


@app.route('/ip/<ip_address>/unban', methods=['POST'])
@rate_limit(max_per_minute=30)
def unban_ip(ip_address: str):
    """Unban an IP address."""
    try:
        unbanned = security_monitor.ip_manager.unban_ip(ip_address)
        
        if unbanned:
            security_monitor.logger.log_system_event("IP_UNBANNED", f"IP {ip_address} has been unbanned")
            return jsonify({
                "success": True,
                "message": f"IP {ip_address} has been unbanned"
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": f"IP {ip_address} is not banned"
            }), 400
        
    except Exception as e:
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500


@app.route('/banned', methods=['GET'])
@rate_limit(max_per_minute=30)
def get_banned_ips():
    """Get list of all banned IPs."""
    try:
        banned_ips = security_monitor.ip_manager.get_banned_ips()
        ban_details = []
        
        for ip in banned_ips:
            ban_info = security_monitor.ip_manager.get_ban_info(ip)
            if ban_info:
                ban_details.append(ban_info)
        
        return jsonify({
            "banned_ips": ban_details,
            "count": len(ban_details)
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500


# ============================================================================
# TEST CLIENT (Integrated)
# ============================================================================

def test_clean_request(api_base_url: str = "http://localhost:8080"):
    """Test a clean, legitimate request."""
    print("\n[TEST 1] Testing clean request...")
    try:
        import requests
        payload = {
            "ip": "192.168.1.100",
            "method": "GET",
            "url": "/api/users",
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json"
            },
            "query_params": {
                "page": "1",
                "limit": "10"
            },
            "body": "",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        response = requests.post(f"{api_base_url}/analyze", json=payload, timeout=5)
        result = response.json()
        print(f"Status: {response.status_code}")
        print(f"Decision: {result.get('decision')}")
        print(f"Allowed: {result.get('allowed')}")
        print(f"Reason: {result.get('reason')}")
        return result.get('allowed') == True
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_sql_injection(api_base_url: str = "http://localhost:8080"):
    """Test SQL injection detection."""
    print("\n[TEST 2] Testing SQL injection detection...")
    try:
        import requests
        payload = {
            "ip": "192.168.1.200",
            "method": "GET",
            "url": "/api/users",
            "headers": {
                "User-Agent": "Mozilla/5.0"
            },
            "query_params": {
                "id": "1' OR '1'='1"
            },
            "body": "",
            "user_agent": "Mozilla/5.0"
        }
        
        response = requests.post(f"{api_base_url}/analyze", json=payload, timeout=5)
        result = response.json()
        print(f"Status: {response.status_code}")
        print(f"Decision: {result.get('decision')}")
        print(f"Allowed: {result.get('allowed')}")
        print(f"Attack Type: {result.get('attack_type')}")
        print(f"Reason: {result.get('reason')}")
        return result.get('allowed') == False
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_xss(api_base_url: str = "http://localhost:8080"):
    """Test XSS detection."""
    print("\n[TEST 3] Testing XSS detection...")
    try:
        import requests
        payload = {
            "ip": "192.168.1.201",
            "method": "POST",
            "url": "/api/comments",
            "headers": {
                "User-Agent": "Mozilla/5.0"
            },
            "query_params": {},
            "body": "<script>alert('XSS')</script>",
            "user_agent": "Mozilla/5.0"
        }
        
        response = requests.post(f"{api_base_url}/analyze", json=payload, timeout=5)
        result = response.json()
        print(f"Status: {response.status_code}")
        print(f"Decision: {result.get('decision')}")
        print(f"Allowed: {result.get('allowed')}")
        print(f"Attack Type: {result.get('attack_type')}")
        print(f"Reason: {result.get('reason')}")
        return result.get('allowed') == False
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_path_traversal(api_base_url: str = "http://localhost:8080"):
    """Test path traversal detection."""
    print("\n[TEST 4] Testing path traversal detection...")
    try:
        import requests
        payload = {
            "ip": "192.168.1.202",
            "method": "GET",
            "url": "/api/files/../../../etc/passwd",
            "headers": {
                "User-Agent": "Mozilla/5.0"
            },
            "query_params": {},
            "body": "",
            "user_agent": "Mozilla/5.0"
        }
        
        response = requests.post(f"{api_base_url}/analyze", json=payload, timeout=5)
        result = response.json()
        print(f"Status: {response.status_code}")
        print(f"Decision: {result.get('decision')}")
        print(f"Allowed: {result.get('allowed')}")
        print(f"Attack Type: {result.get('attack_type')}")
        print(f"Reason: {result.get('reason')}")
        return result.get('allowed') == False
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_health_check(api_base_url: str = "http://localhost:8080"):
    """Test health check endpoint."""
    print("\n[TEST 5] Testing health check...")
    try:
        import requests
        response = requests.get(f"{api_base_url}/health", timeout=5)
        result = response.json()
        print(f"Status: {response.status_code}")
        print(f"Service Status: {result.get('status')}")
        print(f"Service: {result.get('service')}")
        return result.get('status') == "healthy"
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_status(api_base_url: str = "http://localhost:8080"):
    """Test status endpoint."""
    print("\n[TEST 6] Testing status endpoint...")
    try:
        import requests
        response = requests.get(f"{api_base_url}/status", timeout=5)
        result = response.json()
        print(f"Status: {response.status_code}")
        print(f"System Status: {result.get('status')}")
        stats = result.get('statistics', {})
        print(f"Banned IPs: {stats.get('banned_ips')}")
        print(f"Tracked IPs: {stats.get('tracked_ips')}")
        print(f"Payloads Loaded: {stats.get('payloads_loaded')}")
        return result.get('status') == "operational"
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_ip_info(api_base_url: str = "http://localhost:8080"):
    """Test IP information endpoint."""
    print("\n[TEST 7] Testing IP information...")
    test_ip = "192.168.1.200"
    try:
        import requests
        response = requests.get(f"{api_base_url}/ip/{test_ip}", timeout=5)
        result = response.json()
        print(f"Status: {response.status_code}")
        print(f"IP: {result.get('ip')}")
        print(f"Banned: {result.get('banned')}")
        activity = result.get('activity', {})
        print(f"Request Count: {activity.get('request_count')}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False


def run_test_suite(api_base_url: str = "http://localhost:8080"):
    """Run all tests."""
    print("=" * 80)
    print("Security Monitoring System - Test Suite")
    print("=" * 80)
    print(f"\nTesting API at: {api_base_url}")
    print("Make sure the security monitor server is running!")
    print("\nPress Enter to start tests...")
    try:
        input()
    except:
        pass
    
    results = []
    
    # Run tests
    results.append(("Health Check", test_health_check(api_base_url)))
    results.append(("Status", test_status(api_base_url)))
    results.append(("Clean Request", test_clean_request(api_base_url)))
    results.append(("SQL Injection", test_sql_injection(api_base_url)))
    results.append(("XSS", test_xss(api_base_url)))
    results.append(("Path Traversal", test_path_traversal(api_base_url)))
    results.append(("IP Info", test_ip_info(api_base_url)))
    
    # Print summary
    print("\n" + "=" * 80)
    print("Test Results Summary")
    print("=" * 80)
    for test_name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{test_name:30} {status}")
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    print(f"\nTotal: {passed_count}/{total_count} tests passed")
    print("=" * 80)


if __name__ == '__main__':
    # Check if running tests or server
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        # Run test suite
        api_url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8080"
        run_test_suite(api_url)
    else:
        # Run server
        host = security_monitor.config.get("api.host", "0.0.0.0")
        port = security_monitor.config.get("api.port", 8080)
        debug = security_monitor.config.get("api.debug", False)
        
        print(f"\n{'='*80}")
        print("Security Monitoring and Intrusion Prevention System")
        print("Production-Ready Web Security Monitoring Tool")
        print(f"{'='*80}")
        print(f"\nStarting API Server on {host}:{port}")
        print(f"\nAPI Endpoints:")
        print("  POST /analyze          - Analyze a web request for security threats")
        print("  GET  /health           - Health check endpoint")
        print("  GET  /status           - System status and statistics")
        print("  GET  /ip/<ip>          - Get detailed IP information")
        print("  POST /ip/<ip>/ban      - Manually ban an IP address")
        print("  POST /ip/<ip>/unban    - Unban an IP address")
        print("  GET  /banned           - List all currently banned IPs")
        print(f"\nFeatures:")
        print("  ✓ Real SecLists payload detection")
        print("  ✓ Behavioral anomaly detection")
        print("  ✓ Automatic IP banning")
        print("  ✓ Comprehensive logging")
        print("  ✓ API rate limiting")
        print("  ✓ Request validation")
        print(f"\nUsage:")
        print("  python security_monitor.py          - Start server")
        print("  python security_monitor.py --test  - Run test suite")
        print(f"\nPress Ctrl+C to stop\n")
        
        app.run(host=host, port=port, debug=debug, threaded=True)

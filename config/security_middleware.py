import requests
from django.http import HttpResponseForbidden
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

class SecurityMonitorMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Skip static and media files to improve performance
        if request.path.startswith(settings.STATIC_URL) or request.path.startswith(settings.MEDIA_URL):
            return None

        # Get the security monitor URL (default to localhost:8080)
        security_monitor_url = getattr(settings, 'SECURITY_MONITOR_URL', "http://localhost:8080")
        
        # Prepare the payload
        client_ip = self.get_client_ip(request)
        
        try:
             # Gather headers
            headers = {k: v for k, v in request.META.items() if k.startswith('HTTP_')}
            
            payload = {
                "ip": client_ip,
                "method": request.method,
                "url": request.path,
                "headers": headers,
                "query_params": dict(request.GET),
                "body": request.body.decode('utf-8', errors='ignore') if request.body else "",
                "user_agent": request.META.get('HTTP_USER_AGENT', '')
            }
            
            # Send to Security Monitor
            # Short timeout (200ms) to ensure we don't slow down legitimate requests too much if monitor is slow
            # If monitor is local, it should be <10ms
            response = requests.post(f"{security_monitor_url}/analyze", json=payload, timeout=0.5)
            
            if response.status_code == 200:
                result = response.json()
                if not result.get("allowed", False):
                    reason = result.get('reason', 'Request blocked by Security Monitor')
                    return HttpResponseForbidden(f"<h1>Security Alert</h1><p>{reason}</p>")
                    
        except requests.RequestException:
            # Fail-open: If security monitor is down, log it but allow traffic
            # In high-sec env, you might want to fail-closed
            pass
        except Exception as e:
            # Catch other potential coding errors to avoid 500
            print(f"Security Middleware Error: {e}")
            pass
        
        return None

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

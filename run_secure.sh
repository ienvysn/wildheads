#!/bin/bash
echo "Starting Aarogya Security Shield..."

# 1. Start Security Monitor (Background)
cd security_service
# Check if already running
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "Security Monitor already running on port 8080"
else
    echo "Launching Security Monitor..."
    ../venv/bin/python security_monitor.py > ../security_monitor.log 2>&1 &
    SEC_PID=$!
    echo "Security Monitor started (PID: $SEC_PID)"
fi
cd ..

# 2. Start Django Application
echo "Starting Django Server..."
export PYTHONPATH=$PYTHONPATH:$(pwd)
./venv/bin/python manage.py runserver 0.0.0.0:8000

# Cleanup on exit
# trap "kill $SEC_PID" EXIT

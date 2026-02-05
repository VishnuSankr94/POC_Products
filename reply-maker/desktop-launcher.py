import sys
import webbrowser
import subprocess
import time
from threading import Timer

# Start the dev server in background
print("Starting Vite dev server...")
proc = subprocess.Popen(["npm", "run", "dev"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# Wait a few seconds for server to start
time.sleep(3)

# Open in default browser
print("Opening Reply Maker in browser...")
webbrowser.open('http://localhost:5173')

# Keep process running
print("Dev server running. Press Ctrl+C to stop.")
try:
    proc.wait()
except KeyboardInterrupt:
    print("\nStopping dev server...")
    proc.terminate()
    proc.wait()

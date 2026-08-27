#!/bin/bash
set -e

# Start the uvicorn server in the foreground
exec uvicorn app.main:app --host 0.0.0.0 --port 8000

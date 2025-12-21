#!/bin/bash

# Start the auth service as a module and log output
python -m backend.auth_service.app > auth_service.log 2>&1 &

# Start the stock service as a module and log output
python -m backend.stock_service.app > stock_service.log 2>&1 &

# Wait for all background processes
wait
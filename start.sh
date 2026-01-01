#!/bin/bash

# Start the auth service as a module
python -m backend.auth_service.app &

# Start the stock service as a module
python -m backend.stock_service.app &

# Wait for all background processes
wait
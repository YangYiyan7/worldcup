#!/bin/bash

# Stop script for the project

echo "=========================================="
echo "  Stopping Full-Stack Web Application"
echo "=========================================="

echo ""
echo "1. Stopping Docker services..."
cd docker
docker-compose down
cd ..

echo ""
echo "2. Cleaning up..."
docker system prune -f

echo ""
echo "=========================================="
echo "  Application Stopped!"
echo "=========================================="
echo ""
echo "To start again: ./scripts/start.sh"
echo "To setup again: ./scripts/setup.sh"
echo ""

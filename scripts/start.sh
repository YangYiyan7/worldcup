#!/bin/bash

# Start script for the project

echo "=========================================="
echo "  Starting Full-Stack Web Application"
echo "=========================================="

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "Error: Docker is not running"
    echo "Please start Docker first"
    exit 1
fi

echo ""
echo "1. Starting Docker services..."
cd docker
docker-compose up -d
cd ..

echo ""
echo "2. Waiting for services to start..."
sleep 10

echo ""
echo "3. Checking service status..."
docker-compose ps

echo ""
echo "=========================================="
echo "  Application Started!"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:7001"
echo "API Documentation: http://localhost:7001/swagger-ui.html"
echo "Health Check: http://localhost:7001/api/health"
echo ""
echo "To view logs: cd docker && docker-compose logs -f"
echo "To stop: cd docker && docker-compose down"
echo ""

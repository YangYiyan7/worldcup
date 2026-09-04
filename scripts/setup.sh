#!/bin/bash

# Setup script for the project

echo "=========================================="
echo "  Setting up Full-Stack Web Application"
echo "=========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed"
    echo "Please install Docker Compose first: https://docs.docker.com/compose/install/"
    exit 1
fi

echo ""
echo "1. Creating environment files..."

# Create frontend .env.local
if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.example frontend/.env.local
    echo "   Created frontend/.env.local"
else
    echo "   frontend/.env.local already exists"
fi

# Create backend .env.local
if [ ! -f backend/.env.local ]; then
    cp backend/.env.example backend/.env.local
    echo "   Created backend/.env.local"
else
    echo "   backend/.env.local already exists"
fi

echo ""
echo "2. Installing frontend dependencies..."
cd frontend && npm install
cd ..

echo ""
echo "3. Installing backend dependencies..."
cd backend && npm install
cd ..

echo ""
echo "4. Building Docker images..."
cd docker
docker-compose build
cd ..

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo "  cd docker && docker-compose up -d"
echo ""
echo "To access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:7001"
echo "  API Documentation: http://localhost:7001/swagger-ui.html"
echo ""
echo "To stop the application:"
echo "  cd docker && docker-compose down"
echo ""

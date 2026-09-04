#!/bin/bash

# Test script for the project

echo "=========================================="
echo "  Running Full-Stack Web Application Tests"
echo "=========================================="

# Function to run tests
run_tests() {
    local dir=$1
    local name=$2
    
    echo ""
    echo "Testing $name..."
    echo "------------------------------------------"
    
    cd "$dir"
    
    if [ -f "package.json" ]; then
        echo "Running linting..."
        npm run lint
        if [ $? -ne 0 ]; then
            echo "Error: Linting failed for $name"
            cd ..
            return 1
        fi
        
        echo "Running tests..."
        npm run test
        if [ $? -ne 0 ]; then
            echo "Error: Tests failed for $name"
            cd ..
            return 1
        fi
        
        echo "Tests passed for $name"
    else
        echo "No package.json found in $dir"
    fi
    
    cd ..
    return 0
}

# Run frontend tests
run_tests "frontend" "Frontend"
frontend_result=$?

# Run backend tests
run_tests "backend" "Backend"
backend_result=$?

echo ""
echo "=========================================="
echo "  Test Results Summary"
echo "=========================================="
echo ""

if [ $frontend_result -eq 0 ]; then
    echo "✓ Frontend: PASSED"
else
    echo "✗ Frontend: FAILED"
fi

if [ $backend_result -eq 0 ]; then
    echo "✓ Backend: PASSED"
else
    echo "✗ Backend: FAILED"
fi

echo ""

if [ $frontend_result -eq 0 ] && [ $backend_result -eq 0 ]; then
    echo "All tests passed!"
    exit 0
else
    echo "Some tests failed!"
    exit 1
fi

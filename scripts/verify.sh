#!/bin/bash

# Verification script to run npm run check and capture results

echo "=========================================="
echo "  Running Verification Checks"
echo "=========================================="

# Create verification directory
mkdir -p verification-results

# Run frontend checks
echo ""
echo "1. Running Frontend Checks..."
echo "------------------------------------------"
cd frontend
npm run check > ../verification-results/frontend-check.txt 2>&1
frontend_exit=$?
cd ..

# Run backend checks
echo ""
echo "2. Running Backend Checks..."
echo "------------------------------------------"
cd backend
npm run check > ../verification-results/backend-check.txt 2>&1
backend_exit=$?
cd ..

# Create summary
echo ""
echo "3. Creating Summary..."
echo "------------------------------------------"
cat > verification-results/summary.txt << EOF
Verification Summary
====================

Date: $(date)
Frontend Check Exit Code: $frontend_exit
Backend Check Exit Code: $backend_exit

Frontend Results:
$(cat frontend-check.txt)

Backend Results:
$(cat backend-check.txt)

Conclusion:
EOF

if [ $frontend_exit -eq 0 ] && [ $backend_exit -eq 0 ]; then
    echo "All checks passed!" >> verification-results/summary.txt
    echo ""
    echo "✓ All checks passed!"
else
    echo "Some checks failed!" >> verification-results/summary.txt
    echo ""
    echo "✗ Some checks failed!"
fi

echo ""
echo "=========================================="
echo "  Verification Complete"
echo "=========================================="
echo ""
echo "Results saved to: verification-results/"
echo "  - frontend-check.txt"
echo "  - backend-check.txt"
echo "  - summary.txt"
echo ""

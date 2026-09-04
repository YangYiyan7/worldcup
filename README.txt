================================================================================
                          PROJECT README
================================================================================

Project Name: Full-Stack Web Application
Architecture: Next.js + React + TailwindCSS (Frontend) + Midway.js + TypeORM (Backend)
Version: 1.0.0
Date: 2026-07-24

================================================================================
                          TABLE OF CONTENTS
================================================================================

1. Project Overview
2. Docker Image and Container Startup
3. Database and Resource File Mounting
4. Web Service Public Access
5. Development Setup
6. Testing and Verification
7. Performance and Race Condition Handling
8. Troubleshooting

================================================================================
                          1. PROJECT OVERVIEW
================================================================================

This project is a full-stack web application with the following components:

Frontend:
- Next.js 14+ with React 18+
- TailwindCSS for styling
- SSR/Streaming for display pages
- Client Components for interactive areas
- API consumption via /api/* routes and OpenAPI specification

Backend:
- Midway.js framework
- TypeORM for database operations
- RESTful API with OpenAPI documentation
- Structured logging and error handling

Database:
- MySQL 8.0
- TypeORM migrations
- Connection pooling

================================================================================
                    2. DOCKER IMAGE AND CONTAINER STARTUP
================================================================================

Using Docker Compose (Recommended):

1. Navigate to the docker directory:
   cd docker

2. Start all services:
   docker-compose up -d

3. View logs:
   docker-compose logs -f

4. Stop all services:
   docker-compose down

Using Docker Image Directly:

Frontend Image:
   docker build -t frontend-app -f docker/frontend/Dockerfile .
   docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://backend:7001 frontend-app

Backend Image:
   docker build -t backend-app -f docker/backend/Dockerfile .
   docker run -p 7001:7001 \
     -e DB_HOST=mysql \
     -e DB_PORT=3306 \
     -e DB_USERNAME=root \
     -e DB_PASSWORD=password \
     -e DB_DATABASE=my_database \
     backend-app

================================================================================
                    3. DATABASE AND RESOURCE FILE MOUNTING
================================================================================

Database Mounting:

MySQL Data:
   - Container Path: /var/lib/mysql
   - Host Path: ./docker/mysql-data
   - Command: docker-compose up -d (automatically creates volume)

Initialize Database:
   - SQL scripts are located in: ./docker/init-scripts/
   - Scripts run automatically on first container startup
   - To reinitialize: docker-compose down -v && docker-compose up -d

Resource File Mounting:

Frontend Resources:
   - Container Path: /app/data
   - Host Path: ./frontend/resources
   - Mount Command: 
     docker run -v $(pwd)/frontend/resources:/app/data frontend-app

Backend Resources:
   - Container Path: /app/data
   - Host Path: ./backend/resources
   - Mount Command:
     docker run -v $(pwd)/backend/resources:/app/data backend-app

Configuration Files:
   - Frontend: .env.local (copy from .env.example)
   - Backend: .env.local (copy from .env.example)

================================================================================
                    4. WEB SERVICE PUBLIC ACCESS
================================================================================

Development Environment:

Frontend:
   URL: http://localhost:3000
   Description: Next.js development server with hot reloading

Backend API:
   URL: http://localhost:7001
   Description: Midway.js API server
   API Documentation: http://localhost:7001/swagger-ui.html

Health Check:
   URL: http://localhost:7001/api/health
   Method: GET
   Response: {"status": "healthy", "timestamp": "...", "version": "1.0.0"}

Production Environment:

Frontend:
   URL: http://your-domain.com (or http://your-server-ip)
   Port: 80/443 (configure via nginx/reverse proxy)

Backend API:
   URL: http://your-domain.com/api
   Port: 80/443 (configure via nginx/reverse proxy)

Docker Network:
   Frontend Container: frontend:3000
   Backend Container: backend:7001
   MySQL Container: mysql:3306

================================================================================
                    5. DEVELOPMENT SETUP
================================================================================

Prerequisites:
- Node.js 18+
- npm 9+
- Docker (optional)
- MySQL 8.0 (or use Docker)

Local Development:

1. Install Frontend Dependencies:
   cd frontend
   npm install

2. Install Backend Dependencies:
   cd backend
   npm install

3. Start Backend:
   cd backend
   npm run dev

4. Start Frontend:
   cd frontend
   npm run dev

5. Access Application:
   Frontend: http://localhost:3000
   Backend API: http://localhost:7001

Environment Variables:

Frontend (.env.local):
   NEXT_PUBLIC_API_URL=http://localhost:7001

Backend (.env.local):
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=password
   DB_DATABASE=my_database

================================================================================
                    6. TESTING AND VERIFICATION
================================================================================

Frontend Tests:

1. Run All Tests:
   cd frontend
   npm run test

2. Run Tests with Coverage:
   npm run test:coverage

3. Run Linting:
   npm run lint

4. Run Full Check:
   npm run check

Backend Tests:

1. Run All Tests:
   cd backend
   npm run test

2. Run Tests with Coverage:
   npm run test:coverage

3. Run Linting:
   npm run lint

4. Run Full Check:
   npm run check

API Contract Testing:

1. Test Health Endpoint:
   curl http://localhost:7001/api/health

2. Test Users API:
   curl http://localhost:7001/api/users
   curl -X POST http://localhost:7001/api/users \
     -H "Content-Type: application/json" \
     -d '{"name": "Test User", "email": "test@example.com"}'

3. Test with Invalid Input:
   curl -X POST http://localhost:7001/api/users \
     -H "Content-Type: application/json" \
     -d '{"name": "", "email": "invalid-email"}'

4. Test Empty Result:
   curl http://localhost:7001/api/users/99999

Integration Testing:

1. Start Docker Services:
   cd docker
   docker-compose up -d

2. Run Frontend Tests:
   cd frontend
   npm run test

3. Run Backend Tests:
   cd backend
   npm run test

4. Verify Integration:
   curl http://localhost:3000
   curl http://localhost:7001/api/health

================================================================================
                    7. PERFORMANCE AND RACE CONDITION HANDLING
================================================================================

Performance Issues Addressed:

1. Database Performance:
   - Indexing on frequently queried columns
   - Connection pooling configuration
   - Query optimization

2. API Response Time:
   - Redis caching for frequent queries
   - Pagination for list endpoints
   - Gzip compression

3. Frontend Performance:
   - Code splitting with Next.js
   - Image optimization
   - Lazy loading

Race Condition Solutions:

1. Database Concurrent Updates:
   - Optimistic locking with version columns
   - Pessimistic locking for critical operations
   - Transaction management

2. Resource Allocation:
   - Connection pooling
   - Timeout mechanisms
   - Retry logic with exponential backoff

3. State Management:
   - Server-side rendering for initial data
   - WebSocket for real-time updates
   - Conflict detection and resolution

Monitoring:

- Structured logging for all operations
- Performance metrics collection
- Error tracking and alerting

================================================================================
                    8. TROUBLESHOOTING
================================================================================

Common Issues:

1. Port Already in Use:
   - Check if services are running: docker ps
   - Stop conflicting services: docker-compose down
   - Kill process on port: lsof -ti:3000 | xargs kill -9

2. Database Connection Failed:
   - Verify MySQL is running: docker ps | grep mysql
   - Check environment variables in .env.local
   - Verify database credentials

3. API Not Responding:
   - Check backend logs: docker-compose logs backend
   - Verify backend is running: curl http://localhost:7001/api/health
   - Check for errors in backend console

4. Frontend Build Failed:
   - Clear cache: rm -rf .next node_modules
   - Reinstall dependencies: npm install
   - Check TypeScript errors: npm run lint

5. Docker Build Failed:
   - Check Dockerfile syntax
   - Verify all required files are present
   - Check Docker daemon is running

Logs:

- Frontend Logs: docker-compose logs frontend
- Backend Logs: docker-compose logs backend
- Database Logs: docker-compose logs mysql
- All Logs: docker-compose logs -f

================================================================================
                          PROJECT STRUCTURE
================================================================================

project/
├── frontend/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   ├── components/         # React Components
│   │   ├── api/                # API Functions
│   │   ├── hooks/              # Custom Hooks
│   │   └── types/              # TypeScript Types
│   ├── public/                 # Static Assets
│   ├── package.json
│   └── next.config.js
│
├── backend/                     # Midway.js Backend
│   ├── src/
│   │   ├── config/             # Configuration Files
│   │   ├── controller/         # API Controllers
│   │   ├── service/            # Business Logic
│   │   ├── entity/             # TypeORM Entities
│   │   ├── middleware/          # Middleware
│   │   └── dto/                # Data Transfer Objects
│   ├── package.json
│   └── tsconfig.json
│
├── docker/                      # Docker Configuration
│   ├── docker-compose.yml
│   ├── frontend/
│   │   └── Dockerfile
│   ├── backend/
│   │   └── Dockerfile
│   └── init-scripts/
│       └── 01-init.sql
│
├── docs/                        # Documentation
│   └── performance-report.md
│
├── openapi/                     # API Specifications
│   └── openapi.yaml
│
├── tests/                       # Test Files
├── scripts/                     # Utility Scripts
├── resources/                   # Resource Files
└── README.txt                   # This File

================================================================================
                          QUICK START COMMANDS
================================================================================

Docker Quick Start:
   cd docker
   docker-compose up -d
   echo "Frontend: http://localhost:3000"
   echo "Backend: http://localhost:7001"

Local Development Quick Start:
   # Terminal 1 - Backend
   cd backend && npm install && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm install && npm run dev

Testing Quick Start:
   # Frontend
   cd frontend && npm run check
   
   # Backend
   cd backend && npm run check

================================================================================
                          SUPPORT
================================================================================

For issues or questions:
1. Check this README file
2. Review the performance report: docs/performance-report.md
3. Check API documentation: http://localhost:7001/swagger-ui.html
4. Review OpenAPI specification: openapi/openapi.yaml

================================================================================
                          LICENSE
================================================================================

This project is licensed under the MIT License.

================================================================================

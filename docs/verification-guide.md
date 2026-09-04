# Project Verification and Usage Guide

## Project Overview

This project is a full-stack web application with the following components:

- **Frontend**: Next.js 14+ with React 18+ and TailwindCSS
- **Backend**: Midway.js with TypeORM
- **Database**: MySQL 8.0
- **Containerization**: Docker and Docker Compose

## X64 Compatible Image Artifacts

The project includes Docker images that are compatible with X64 architecture:

1. **Frontend Image**: `frontend-app`
   - Built from: `docker/frontend/Dockerfile`
   - Base image: `node:18-alpine` (X64 compatible)
   - Port: 3000

2. **Backend Image**: `backend-app`
   - Built from: `docker/backend/Dockerfile`
   - Base image: `node:18-alpine` (X64 compatible)
   - Port: 7001

3. **Database Image**: `mysql:8.0`
   - Official MySQL image (X64 compatible)
   - Port: 3306

## How to Use

### Quick Start with Docker (Recommended)

```bash
# 1. Navigate to project directory
cd /Users/yangyiyan/Desktop/project

# 2. Run setup script (optional, but recommended)
./scripts/setup.sh

# 3. Start all services
cd docker
docker-compose up -d

# 4. Access the application
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:7001"
echo "API Documentation: http://localhost:7001/swagger-ui.html"
```

### Local Development

```bash
# 1. Navigate to project directory
cd /Users/yangyiyan/Desktop/project

# 2. Install frontend dependencies
cd frontend
npm install
npm run dev

# 3. In a new terminal, install backend dependencies
cd backend
npm install
npm run dev

# 4. Access the application
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:7001"
```

## Docker Image and Container Startup

### Docker Compose Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild images
docker-compose build --no-cache

# View running containers
docker-compose ps
```

### Individual Docker Commands

```bash
# Build frontend image
docker build -t frontend-app -f docker/frontend/Dockerfile .

# Run frontend container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://backend:7001 frontend-app

# Build backend image
docker build -t backend-app -f docker/backend/Dockerfile .

# Run backend container
docker run -p 7001:7001 \
  -e DB_HOST=mysql \
  -e DB_PORT=3306 \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=password \
  -e DB_DATABASE=my_database \
  backend-app
```

## Database and Resource File Mounting

### Database Mounting

MySQL data is mounted using Docker volumes:

```bash
# Data is automatically mounted to:
# - Container: /var/lib/mysql
# - Volume: mysql-data

# To view mounted volumes:
docker volume ls

# To inspect volume details:
docker volume inspect project_mysql-data
```

### Resource File Mounting

```bash
# Mount frontend resources
docker run -v $(pwd)/frontend/resources:/app/data frontend-app

# Mount backend resources
docker run -v $(pwd)/backend/resources:/app/data backend-app

# Mount configuration files
docker run -v $(pwd)/frontend/.env.local:/app/.env.local frontend-app
docker run -v $(pwd)/backend/.env.local:/app/.env.local backend-app
```

### Database Initialization

SQL scripts in `docker/init-scripts/` run automatically on first startup:

```bash
# To reinitialize database:
docker-compose down -v
docker-compose up -d

# To manually run SQL scripts:
docker exec -i project_mysql_1 mysql -uroot -ppassword my_database < docker/init-scripts/01-init.sql
```

## Web Service Public Access

### Development Environment

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:7001
- **API Documentation**: http://localhost:7001/swagger-ui.html
- **Health Check**: http://localhost:7001/api/health

### Production Environment

For production deployment, configure a reverse proxy (nginx):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://backend:7001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Testing and Verification

### Running Tests

```bash
# Run all tests
./scripts/test.sh

# Run frontend tests only
cd frontend
npm run test

# Run backend tests only
cd backend
npm run test

# Run verification checks
./scripts/verify.sh
```

### API Contract Testing

```bash
# Test health endpoint
curl http://localhost:7001/api/health

# Test users API
curl http://localhost:7001/api/users

# Test create user
curl -X POST http://localhost:7001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'

# Test invalid input
curl -X POST http://localhost:7001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "", "email": "invalid-email"}'

# Test empty result
curl http://localhost:7001/api/users/99999
```

### Integration Testing

```bash
# Start Docker services
cd docker
docker-compose up -d

# Wait for services to start
sleep 10

# Run integration tests
cd ..
npm run test

# Verify integration
curl http://localhost:3000
curl http://localhost:7001/api/health
```

## Verification Evidence

### npm run check Results

After running `./scripts/verify.sh`, results are saved in `verification-results/`:

- `frontend-check.txt`: Frontend linting and test results
- `backend-check.txt`: Backend linting and test results
- `summary.txt`: Overall verification summary

### OpenAPI Specification

Location: `/openapi/openapi.yaml`

Contains:
- All API endpoints
- Request/response schemas
- Error handling specifications

### Test Code Location

- Frontend tests: `/frontend/src/components/__tests__/`
- Backend tests: `/backend/src/service/__tests__/`
- Integration tests: `/tests/integration/`

### Integration Records

- Docker Compose setup: `/docker/docker-compose.yml`
- Environment configuration: `/.env.example` files
- Database initialization: `/docker/init-scripts/`

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Check what's using the port
   lsof -ti:3000
   lsof -ti:7001
   
   # Kill the process
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database connection failed**:
   ```bash
   # Check if MySQL is running
   docker ps | grep mysql
   
   # Check logs
   docker-compose logs mysql
   ```

3. **Docker build failed**:
   ```bash
   # Clean and rebuild
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. **Frontend build failed**:
   ```bash
   # Clear cache and reinstall
   cd frontend
   rm -rf node_modules .next
   npm install
   npm run build
   ```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mysql
```

## Project Structure

```
project/
├── frontend/                    # Next.js Frontend
├── backend/                     # Midway.js Backend
├── docker/                      # Docker Configuration
├── docs/                        # Documentation
├── openapi/                     # API Specifications
├── tests/                       # Test Files
├── scripts/                     # Utility Scripts
├── resources/                   # Resource Files
└── README.txt                   # Main Documentation
```

## Next Steps

1. **Install dependencies**: Run `npm install` in both frontend and backend directories
2. **Configure environment**: Copy `.env.example` to `.env.local` and configure
3. **Start services**: Use Docker or local development
4. **Run tests**: Execute `./scripts/test.sh` to verify everything works
5. **Deploy**: Use Docker Compose for production deployment

## Support

For issues or questions:
1. Check this verification guide
2. Review the README.txt file
3. Check the performance report: `docs/performance-report.md`
4. Review API documentation: http://localhost:7001/swagger-ui.html
5. Check OpenAPI specification: `openapi/openapi.yaml`


# Wallet Service

## Description
This project is a wallet service that uses NestJS, PostgreSQL, Redis, and RabbitMQ. The project is containerized using Docker and managed through Docker Compose.

## Dependencies
- Docker
- Docker Compose

## Setup Instructions

### 1. Clone the Repository:
```bash
git clone <repository-url>
cd wallet-service
```

### 2. Set Up Environment Variables:
Ensure your `.env` file is configured as follows:
```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=root
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=ecommerce
JWT_SECRET=your_jwt_secret
REDIS_HOST=redis
REDIS_PORT=6379
```

### 3. Run the Project:
Run the following command to build and start the containers:
```bash
npm install
docker-compose up -d
```

### 4. Access the Application:
- **API**: `http://localhost:3000`
- **Swagger**: `http://localhost:3000/api` (Interactive API documentation)
- **RabbitMQ Management**: `http://localhost:15672` (default credentials: `guest` / `guest`)

## Swagger
You can use Swagger to test the API directly by navigating to `http://localhost:3000/api`.

## Troubleshooting
If you face any issues, ensure that Docker and Docker Compose are installed correctly and that the environment variables in the `.env` file are correctly set.


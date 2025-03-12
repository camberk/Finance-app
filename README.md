# Personal Finance App

A full-stack web application for tracking personal finances, built with FastAPI, Next.js, and PostgreSQL.

## Features

### Core Features
- Income & Expense Tracking
- Budgeting Tools
- Savings Goals
- Net Worth Calculator
- Financial Reports & Charts

### Advanced Features (Coming Soon)
- Bank Integration (Plaid API)
- Subscription Tracker
- Investment Portfolio Tracking
- Debt Payoff Planner
- AI Spending Insights

## Tech Stack

- **Backend**: Python FastAPI
- **Frontend**: Next.js with TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Setup and Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd finance-app
   ```

2. Start the application with Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development

#### Backend

The backend is built with FastAPI and uses SQLAlchemy for database operations.

```bash
# Run the backend separately
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend

The frontend is built with Next.js and uses Tailwind CSS for styling.

```bash
# Run the frontend separately
cd frontend
npm install
npm run dev
```

## Project Structure

```
finance-app/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core functionality
│   │   ├── crud/           # Database operations
│   │   ├── db/             # Database setup
│   │   ├── models/         # SQLAlchemy models
│   │   └── schemas/        # Pydantic schemas
│   ├── alembic/            # Database migrations
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js app directory
│   │   ├── components/     # React components
│   │   └── lib/            # Utility functions
│   └── package.json        # Node.js dependencies
└── docker-compose.yml      # Docker Compose configuration
```

## License

This project is licensed under the MIT License. 
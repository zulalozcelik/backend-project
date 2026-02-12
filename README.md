# Backend Project

A NestJS backend application with Clean Architecture principles.

## 🚀 Tech Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe development
- **NestJS** - Progressive Node.js framework
- **Drizzle ORM** - Type-safe ORM for PostgreSQL
- **PostgreSQL** - Database
- **Zod** - Schema validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- PostgreSQL (v14 or higher)

## 🛠️ Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd backend-project
```

2. Install dependencies
```bash
cd api
pnpm install
```

3. Setup environment variables
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run the application
```bash
pnpm start:dev
```

## 📁 Project Structure

```
backend-project/
├── api/
│   ├── src/
│   │   ├── common/          # Shared utilities
│   │   ├── core/            # Core infrastructure
│   │   │   └── database/    # Database configuration
│   │   └── modules/         # Feature modules
│   │       └── user/        # User module
│   ├── test/                # Tests
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🔧 Available Scripts

```bash
# Development
pnpm start:dev

# Build
pnpm build

# Production
pnpm start:prod

# Tests
pnpm test
```

## 🗄️ Database Setup

1. Create PostgreSQL database
```sql
CREATE DATABASE your_database_name;
```

2. Update DATABASE_URL in .env file

3. Run migrations (if available)
```bash
pnpm db:push
```

## 📝 API Documentation

API documentation is available at `http://localhost:3000/api` (Swagger UI)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License

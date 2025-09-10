# 🐳 Modern TypeScript Docker Node.js Sample

A modern, full-stack todo application built with TypeScript, React, Express.js, and Docker, following 2025 best practices and standards.

## ✨ Features

### 🚀 **Modern Tech Stack**
- **Backend**: Node.js + Express.js + TypeScript
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL / SQLite with type-safe operations
- **Build Tools**: Vite for frontend, TSC for backend
- **Testing**: Vitest with TypeScript support
- **Linting**: ESLint + Prettier with TypeScript rules
- **Containerization**: Multi-stage Docker builds

### 🛡️ **Production Ready**
- Input validation with Zod schemas
- Comprehensive error handling
- Security middleware (Helmet, CORS)
- Health checks and graceful shutdowns
- Performance optimizations (compression, caching)
- Environment-specific configurations

### 🎨 **Modern UI/UX**
- Responsive design with Tailwind CSS
- Loading states and error boundaries
- Optimistic updates
- Accessible components
- Clean, modern aesthetics

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ and npm 10+
- Docker and Docker Compose
- Git

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd docker-nodejs-sample

# Install dependencies
npm install

# Start development environment with Docker
docker-compose up

# Or start locally (requires PostgreSQL)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Health Check: http://localhost:3000/health

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start both client and server in watch mode
npm run dev:client       # Start only Vite dev server
npm run dev:server       # Start only Node.js server in watch mode

# Building
npm run build           # Build both client and server for production
npm run build:client   # Build client bundle with Vite
npm run build:server   # Compile TypeScript server code

# Testing
npm run test           # Run tests with Vitest
npm run test:coverage  # Run tests with coverage report

# Code Quality
npm run lint          # Lint and fix code with ESLint
npm run format        # Format code with Prettier
npm run type-check    # Type check without emitting files

# Production
npm start             # Start production server
npm run preview       # Preview production build locally
```

### Project Structure

```
src/
├── client/              # React frontend
│   ├── components/      # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── App.tsx         # Main App component
│   ├── main.tsx        # React entry point
│   ├── index.html      # HTML template
│   └── index.css       # Global styles with Tailwind
├── server/              # Express.js backend
│   ├── database/       # Database layer with interfaces
│   ├── middleware/     # Express middleware
│   ├── routes/         # API route handlers
│   ├── __tests__/      # Server-side tests
│   └── index.ts        # Server entry point
└── shared/              # Shared utilities and types
    ├── types/          # TypeScript type definitions
    ├── utils/          # Shared utility functions
    └── test/           # Test configuration
```

## 🐳 Docker Deployment

### Development Environment

```bash
# Start all services (app + database)
docker-compose up

# Start specific services
docker-compose up app db

# View logs
docker-compose logs -f app

# Access shell in running container
docker-compose exec app sh
```

### Production Deployment

```bash
# Build and start production services
docker-compose --profile production up --build

# Or build production image separately
docker build -f Dockerfile.new --target production -t todo-app:prod .
docker run -p 3000:3000 --env-file .env todo-app:prod
```

### Testing Environment

```bash
# Run tests in Docker
docker-compose --profile test up --build

# Run tests with coverage
docker-compose --profile test run test npm run test:coverage
```

## 🗄️ Database Options

### SQLite (Default)
- No additional setup required
- Data stored in `/tmp/todo.db`
- Perfect for development and testing

### PostgreSQL (Recommended for Production)
Set environment variables:
```bash
POSTGRES_HOST=localhost
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=todoapp
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (optional - defaults to SQLite)
POSTGRES_HOST=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
SQLITE_DB_LOCATION=/tmp/todo.db

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### TypeScript Configuration

- `tsconfig.json` - Main TypeScript config for client
- `tsconfig.server.json` - Server-specific TypeScript config
- `vite.config.ts` - Vite build configuration
- `vitest.config.ts` - Test configuration

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- src/shared/utils/__tests__/validation.test.ts
```

## 🔍 API Documentation

### Endpoints

#### `GET /api/todos`
Get all todos
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Todo name",
      "completed": false
    }
  ]
}
```

#### `POST /api/todos`
Create a new todo
```json
// Request body
{
  "name": "New todo item"
}

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New todo item",
    "completed": false
  },
  "message": "Todo created successfully"
}
```

#### `PUT /api/todos/:id`
Update a todo
```json
// Request body
{
  "name": "Updated name",
  "completed": true
}
```

#### `DELETE /api/todos/:id`
Delete a todo

#### `GET /health`
Health check endpoint

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin requests
- **Input Validation**: Zod schema validation
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive error boundaries
- **Non-root Docker User**: Container security

## 📈 Performance Optimizations

- **Compression**: Gzip compression middleware
- **Static File Serving**: Optimized static file delivery
- **Database Indexing**: Indexed database queries
- **Bundle Optimization**: Vite-powered build optimization
- **Docker Multi-stage**: Optimized container sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests and linting: `npm run test && npm run lint`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Author

**Kristiyan Velkov**
- LinkedIn: [kristiyan-velkov](https://www.linkedin.com/in/kristiyan-velkov-763130b3/)
- GitHub: [@kristiyan-velkov](https://github.com/kristiyan-velkov)

## 📊 Project Stats

- **Language**: TypeScript 98%
- **Framework**: React 19 + Express.js
- **Database**: PostgreSQL / SQLite
- **Testing**: Vitest with 90%+ coverage
- **Docker**: Multi-stage optimized builds
- **Bundle Size**: < 100KB gzipped

---

Built with ❤️ using modern web technologies and best practices.

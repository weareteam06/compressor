# Compressor Website

A full-stack product and content website for an industrial air-compressor business. The application includes a public product catalog, industry and service pages, news, distributor and contact features, an AI-assisted chatbot, and a role-based administration area for managing site content and leads.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router
- **Backend:** Java 17, Spring Boot 3, Spring Security, Spring Data JPA
- **Database:** MySQL 8
- **Authentication:** JWT with role-based access control
- **Local infrastructure:** Docker Compose

## Project structure

```text
compressor/
|-- frontend/                 React/Vite application
|   |-- public/               Static assets and product catalogs
|   `-- src/                  Pages, components, admin UI, and API client
|-- backend/                  Spring Boot application
|   `-- src/main/
|       |-- java/             Controllers, services, security, and entities
|       `-- resources/        Configuration and initial JSON seed data
|-- docker-compose.yml        Local MySQL service
`-- package.json              Root development and build commands
```

## Prerequisites

Install the following before starting:

- Node.js 20.19+ or 22.12+
- npm
- Java Development Kit (JDK) 17+
- Maven 3.9+
- Docker Desktop (recommended for running MySQL)

## Getting started

### 1. Install frontend dependencies

From the project root:

```bash
npm --prefix frontend install
```

### 2. Start MySQL

```bash
docker compose up -d mysql
```

The Compose service exposes MySQL on `localhost:3306` and creates the `compressor_db` database.

### 3. Start the backend

The repository's default Spring datasource values target a different local MySQL setup. When using the included Compose service, set these variables before starting the API.

PowerShell:

```powershell
$env:MYSQL_URL = "jdbc:mysql://localhost:3306/compressor_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = "root"
$env:JWT_SECRET = "replace-with-a-long-random-development-secret"
npm run dev:backend
```

Bash:

```bash
export MYSQL_URL='jdbc:mysql://localhost:3306/compressor_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
export MYSQL_USER='root'
export MYSQL_PASSWORD='root'
export JWT_SECRET='replace-with-a-long-random-development-secret'
npm run dev:backend
```

The backend starts at [http://localhost:8000](http://localhost:8000). On its first successful run, it creates the schema and imports the initial content from `backend/src/main/resources/data`.

### 4. Start the frontend

Open another terminal in the project root and run:

```bash
npm run dev:frontend
```

Open [http://localhost:5174](http://localhost:5174). Vite proxies requests from `/api` to the backend on port `8000`.

## Development accounts

The initial database seed creates development-only accounts. For example, the administration area at `/login` can be accessed with:

```text
Username: superadmin
Password: superadmin123
```

These credentials are public and must be changed or removed before any production deployment. Additional seeded roles are defined in `backend/src/main/java/com/compressor/backend/service/DatabaseSeeder.java`.

## Environment variables

### Backend

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | HTTP server port | `8000` |
| `MYSQL_URL` | MySQL JDBC connection URL | Local MySQL URL from `application.properties` |
| `MYSQL_USER` | Database user | `root` |
| `MYSQL_PASSWORD` | Database password | Development value from `application.properties` |
| `JWT_SECRET` | Secret used to sign authentication tokens | Development-only value |
| `JWT_EXPIRATION_SECONDS` | Token lifetime in seconds | `86400` |
| `OPENROUTER_API_KEY` | OpenRouter key used by the chatbot | Development value |
| `OPENROUTER_MODEL` | OpenRouter chatbot model | Configured free model |
| `FRONTEND_DIST` | Optional path to the built frontend directory | Auto-detected |

### Frontend

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | API base URL used by the browser | `/api` |
| `VITE_API_PROXY_TARGET` | Vite development proxy target | `http://localhost:8000` |
| `VITE_SITE_URL` | Canonical website URL used for SEO metadata | `https://www.firstaircompressor.com` |

For production, provide secrets through environment variables or a secrets manager. Do not commit real API keys, database passwords, or JWT secrets.

## Useful commands

Run these commands from the repository root:

```bash
# Start only the frontend development server
npm run dev:frontend

# Start only the Spring Boot backend
npm run dev:backend

# Build the frontend and package the backend
npm run build

# Preview the frontend production build
npm run preview

# Start the backend
npm start
```

The build outputs are written to `frontend/dist` and `backend/target`.

## API overview

Public endpoints are available under `/api`, including:

- `GET /api/health`
- `GET /api/site-config`
- `GET /api/product-categories`
- `GET /api/products`
- `GET /api/industries`
- `GET /api/services`
- `GET /api/news`
- `GET /api/timeline`
- `GET /api/jobs`
- `GET /api/distributors`
- `POST /api/leads`
- `POST /api/chatbot`
- `POST /api/auth/login`

Protected content-management endpoints live under `/api/admin` and require a JWT bearer token with an appropriate role.

## Database notes

Spring Boot currently uses Hibernate's `ddl-auto=update`, and the application seeds empty tables from the JSON files in the backend resources directory. If upgrading a database created by an older version of the project, review [backend/DATABASE_MIGRATION.md](backend/DATABASE_MIGRATION.md) before starting the application.

For production, use versioned database migrations and change `ddl-auto` to a safer setting.

## Health check

After starting the backend, verify it with:

```bash
curl http://localhost:8000/api/health
```

To stop the local database:

```bash
docker compose down
```

Add `-v` only when you intentionally want to delete the local MySQL volume and all of its data.

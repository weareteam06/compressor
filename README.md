# Compressor Website

A full-stack website for an industrial air-compressor business. It provides a customer-facing product catalog and a protected administration panel for managing website content.

## What can this application do?

### Public website

- Browse compressor products and product categories
- View industries, services, company information, news, and distributors
- Download product catalogs
- Submit contact and quotation requests
- Use the website chatbot
- View responsive, SEO-friendly pages

### Administration panel

- Sign in with JWT-based authentication
- Manage products, categories, industries, services, and news
- Manage careers, timeline events, distributors, and website settings
- Review customer leads
- Manage users according to their assigned role

## Technology overview

| Part | Technologies | What it does |
|---|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS | Displays the public website and admin panel |
| Backend | Java 17, Spring Boot 3 | Provides the REST API and business logic |
| Database | MySQL 8, Spring Data JPA | Stores products, content, users, and leads |
| Security | Spring Security, JWT, BCrypt | Authenticates users and protects admin routes |
| Local services | Docker Compose | Starts a ready-to-use MySQL database |

## How the application works

```text
Browser (http://localhost:5174)
        |
        | /api requests are forwarded by Vite
        v
Spring Boot API (http://localhost:8000)
        |
        v
MySQL (localhost:3306)
```

During development, the frontend and backend run in separate terminals. The frontend sends API requests to `/api`, and Vite forwards those requests to Spring Boot.

## Project structure

```text
compressor/
|-- README.md                         Project documentation
|-- package.json                      Shortcuts for frontend/backend commands
|-- docker-compose.yml                Local MySQL configuration
|
|-- frontend/                         React frontend application
|   |-- package.json                  Frontend dependencies and scripts
|   |-- vite.config.ts                Vite server, proxy, and build settings
|   |-- public/                       Files served without processing
|   |   `-- catalogs/                 Downloadable PDF product catalogs
|   |-- src/
|   |   |-- admin/                    Administration pages
|   |   |-- components/               Public pages and reusable components
|   |   |-- lib/                      API client, types, and product data
|   |   |-- utils/                    Shared helper functions
|   |   |-- App.tsx                   Routes and main application layout
|   |   |-- main.tsx                  Frontend entry point
|   |   `-- index.css                 Global styles and Tailwind setup
|   `-- dist/                         Generated frontend build
|
`-- backend/                          Spring Boot backend application
    |-- pom.xml                        Maven dependencies and build settings
    |-- DATABASE_MIGRATION.md          Notes for older database schemas
    |-- src/main/java/com/compressor/backend/
    |   |-- controller/                Public, authentication, and admin APIs
    |   |-- service/                   Business logic and database seeding
    |   |-- repository/                Database access interfaces
    |   |-- model/                     JPA database entities
    |   `-- security/                  JWT and Spring Security configuration
    |-- src/main/resources/
    |   |-- application.properties     Backend configuration and defaults
    |   `-- data/                      JSON content imported on first startup
    `-- target/                        Generated backend build
```

The `dist` and `target` directories are generated build output. Most development changes should be made inside `frontend/src` or `backend/src`.

## Before you begin

Install these tools:

| Tool | Required version | Check your installation |
|---|---:|---|
| Node.js | 20.19+ or 22.12+ | `node --version` |
| npm | Included with Node.js | `npm --version` |
| Java JDK | 17+ | `java --version` |
| Maven | 3.9+ recommended | `mvn --version` |
| Docker Desktop | Current version | `docker --version` |

Docker Desktop is recommended because it provides MySQL without requiring a manual database installation. Make sure Docker Desktop is running before using `docker compose`.

## Installation and first run

All commands below should be run from the project root—the folder containing this README and the root `package.json`.

### 1. Install frontend packages

```bash
npm --prefix frontend install
```

This reads `frontend/package.json` and downloads the React, Vite, Tailwind, and TypeScript packages into `frontend/node_modules`. You normally need to run it only after cloning the project or when frontend dependencies change.

### 2. Start the MySQL database

```bash
docker compose up -d mysql
```

This command:

- Downloads MySQL 8.4 the first time it runs
- Creates the `compressor_db` database
- Exposes MySQL on `localhost:3306`
- Keeps the database running in the background
- Stores its data in a Docker volume so it survives restarts

Check that the container is running:

```bash
docker compose ps
```

Wait until the MySQL service reports that it is healthy before starting the backend.

### 3. Start the backend API

The default values in `application.properties` point to another local database configuration. Set the following values when using the included Docker database.

#### Windows PowerShell

```powershell
$env:MYSQL_URL = "jdbc:mysql://localhost:3306/compressor_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = "root"
$env:JWT_SECRET = "replace-with-a-long-random-development-secret"
npm run dev:backend
```

#### macOS or Linux

```bash
export MYSQL_URL='jdbc:mysql://localhost:3306/compressor_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
export MYSQL_USER='root'
export MYSQL_PASSWORD='root'
export JWT_SECRET='replace-with-a-long-random-development-secret'
npm run dev:backend
```

These environment variables apply to the current terminal session. `npm run dev:backend` runs Maven's Spring Boot development command for `backend/pom.xml`.

On the first successful startup, the backend:

1. Connects to MySQL.
2. Creates or updates the database tables.
3. Loads initial content from `backend/src/main/resources/data` into empty tables.
4. Creates the development user accounts.
5. Starts the API at [http://localhost:8000](http://localhost:8000).

Keep this terminal open while developing.

### 4. Start the frontend

Open a second terminal in the project root:

```bash
npm run dev:frontend
```

This starts Vite at [http://localhost:5174](http://localhost:5174), watches frontend files, and automatically refreshes the browser when the code changes.

### 5. Confirm that everything works

Open these addresses:

- Website: [http://localhost:5174](http://localhost:5174)
- Login page: [http://localhost:5174/login](http://localhost:5174/login)
- Backend health endpoint: [http://localhost:8000/api/health](http://localhost:8000/api/health)

You can also check the API from a terminal:

```bash
curl http://localhost:8000/api/health
```

## Development login

The initial seed data includes a development super-administrator:

```text
Username: superadmin
Password: superadmin123
```

Visit [http://localhost:5174/login](http://localhost:5174/login) to sign in. Other development users and roles are defined in `backend/src/main/java/com/compressor/backend/service/DatabaseSeeder.java`.

> **Security warning:** These are public development credentials. Change or remove every seeded account before making the application publicly accessible.

## Daily development workflow

After completing the first-time installation, a normal development session needs three terminals:

| Terminal | Command | Keep it running? |
|---|---|---|
| 1 — Database | `docker compose up -d mysql` | Runs in the background |
| 2 — Backend | Set the database variables, then run `npm run dev:backend` | Yes |
| 3 — Frontend | `npm run dev:frontend` | Yes |

The database variables must be set again whenever you open a new backend terminal.

To stop development:

1. Press `Ctrl+C` in the frontend terminal.
2. Press `Ctrl+C` in the backend terminal.
3. Stop MySQL with:

```bash
docker compose down
```

This stops the database container but keeps its stored data. Do not add `-v` unless you intentionally want to delete all local database data.

## Commands explained

Run these commands from the project root.

| Command | Explanation |
|---|---|
| `npm --prefix frontend install` | Installs frontend dependencies inside the `frontend` folder |
| `npm run dev:frontend` | Starts the Vite development server on port `5174` |
| `npm run dev:backend` | Starts Spring Boot on port `8000` through Maven |
| `npm run build` | Builds the frontend, then packages the backend without running tests |
| `npm run preview` | Previews the generated frontend build locally |
| `npm start` | Starts the backend through Maven |
| `docker compose up -d mysql` | Starts the local MySQL container in the background |
| `docker compose ps` | Shows the current state of the MySQL container |
| `docker compose logs mysql` | Displays MySQL startup and error logs |
| `docker compose down` | Stops the local MySQL container without deleting its data |

Build output is generated in:

- `frontend/dist` for the frontend
- `backend/target` for the backend

## Building the project

Create both production builds with:

```bash
npm run build
```

This root script performs two operations in order:

1. `npm --prefix frontend run build` compiles and optimizes the React application.
2. `mvn -f backend/pom.xml package -DskipTests` packages the Spring Boot application.

Before building on a new machine, make sure the frontend packages have been installed.

To preview only the frontend build:

```bash
npm run preview
```

Vite prints the preview URL in the terminal.

## Configuration

Spring Boot reads backend settings from `backend/src/main/resources/application.properties`. Environment variables override the defaults and should be used for secrets and deployment-specific values.

### Backend environment variables

| Variable | Description | Default behavior |
|---|---|---|
| `PORT` | Backend HTTP port | `8000` |
| `MYSQL_URL` | Full JDBC connection URL | Uses the URL in `application.properties` |
| `MYSQL_USER` | MySQL username | `root` |
| `MYSQL_PASSWORD` | MySQL password | Uses the development value in `application.properties` |
| `JWT_SECRET` | Secret used to sign login tokens | Uses an insecure development value |
| `JWT_EXPIRATION_SECONDS` | Login token lifetime in seconds | `86400` (24 hours) |
| `OPENROUTER_API_KEY` | OpenRouter key used by the chatbot | Uses the configured development value |
| `OPENROUTER_MODEL` | Model used by the chatbot | Uses the model in `application.properties` |
| `FRONTEND_DIST` | Optional directory containing a frontend build | Backend attempts to find `frontend/dist` |

### Frontend environment variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | API URL used in browser requests | `/api` |
| `VITE_API_PROXY_TARGET` | API server used by the Vite development proxy | `http://localhost:8000` |
| `VITE_SITE_URL` | Public canonical URL used in SEO metadata | `https://www.firstaircompressor.com` |

Never commit real database passwords, JWT secrets, or API keys. Provide them through your hosting platform or a secrets manager in production.

## API overview

The main public endpoints are:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check whether the backend is running |
| `GET` | `/api/site-config` | Load shared website settings |
| `GET` | `/api/product-categories` | List product categories |
| `GET` | `/api/products` | List products |
| `GET` | `/api/industries` | List industries |
| `GET` | `/api/services` | List services |
| `GET` | `/api/news` | List news articles |
| `GET` | `/api/timeline` | Load company timeline events |
| `GET` | `/api/jobs` | List career opportunities |
| `GET` | `/api/distributors` | List distributors |
| `POST` | `/api/leads` | Submit a contact or quotation request |
| `POST` | `/api/chatbot` | Send a message to the chatbot |
| `POST` | `/api/auth/login` | Sign in and receive a JWT |

Content-management endpoints begin with `/api/admin`. They require an `Authorization: Bearer <token>` header and a user role with the required permission.

## Database behavior

The backend currently uses Hibernate's `ddl-auto=update` setting. It creates or adjusts tables automatically during development. Seed JSON is imported only when the related database tables are empty, so restarting the backend does not normally duplicate content.

If your database was created by an older version of this project, read [backend/DATABASE_MIGRATION.md](backend/DATABASE_MIGRATION.md) before starting the new backend.

For production, replace automatic schema updates with version-controlled migrations such as Flyway or Liquibase.

## Troubleshooting

### `docker` is not recognized

Install and start Docker Desktop, then open a new terminal. Confirm the installation with `docker --version`.

### MySQL is not healthy or the backend cannot connect

Check the database container:

```bash
docker compose ps
docker compose logs mysql
```

Make sure the backend is using port `3306`, username `root`, and password `root` when connecting to the included Compose service.

### Port `3306`, `5174`, or `8000` is already in use

Stop the application using that port, or change the relevant port:

- MySQL port: `docker-compose.yml`
- Frontend port: `frontend/vite.config.ts`
- Backend port: the `PORT` environment variable

If the MySQL host port changes, update the port inside `MYSQL_URL` as well.

### The frontend stays on the loading screen

The frontend loads its initial configuration from the API. Confirm that the backend is running and that [http://localhost:8000/api/health](http://localhost:8000/api/health) responds. Also check the browser console and the backend terminal for errors.

### `mvn` is not recognized

Install Maven and add its `bin` directory to your system `PATH`. Open a new terminal and check with `mvn --version`.

### Database schema errors after updating the project

Review [backend/DATABASE_MIGRATION.md](backend/DATABASE_MIGRATION.md). Back up any important data before deleting or rebuilding local tables.

### Chatbot requests fail

Set a valid `OPENROUTER_API_KEY` in the backend terminal and restart Spring Boot. The rest of the website can still run when the external chatbot provider is unavailable.

## Production checklist

Before deploying this project:

- Replace all seeded passwords and remove unused development accounts
- Rotate any secret that has previously been committed to source control
- Set a long, random `JWT_SECRET`
- Supply database credentials and API keys through a secrets manager
- Restrict CORS and allowed frontend hosts to the production domain
- Use HTTPS
- Replace `ddl-auto=update` with versioned database migrations
- Configure database backups and application monitoring
- Run the full build and test all public and administration workflows

## Related documentation

- [Database migration notes](backend/DATABASE_MIGRATION.md)
- [Frontend package scripts](frontend/package.json)
- [Backend Maven configuration](backend/pom.xml)

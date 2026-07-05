
# 📚 Library Management System

A full-stack Library Management System built as a technical assessment project — featuring a secure .NET 10 Web API backend with Entity Framework Core, deployed on Microsoft Azure, paired with a modern React frontend.

## 📖 Overview

This system allows a library to manage its **Authors**, **Categories**, **Books**, **Members**, and **Loan** transactions through a clean, secure, and responsive web interface. It demonstrates a complete CRUD (Create, Read, Update, Delete) implementation using **.NET Core Web API**, **Entity Framework Core** (code-first approach), and cloud deployment via **Microsoft Azure**.

## ✨ Features

- 🔐 **JWT Bearer Authentication** — all API endpoints are protected; credentials are stored securely as BCrypt-hashed values in the database
- 📚 **Full CRUD** for Authors, Categories, Books, Members, and Loans
- 🔄 **Real-time availability tracking** — book copy counts automatically adjust when items are borrowed, returned, or a return is undone
- 🔍 **Search, filter, and sort** across every module (e.g. Books can be searched by title/ISBN and filtered by author, category, and year)
- 📊 **Dashboard** with live stats and a 7-day loan activity trend chart
- 📱 **Fully responsive** — dark-themed UI that adapts from desktop to mobile
- ☁️ **Cloud-hosted** — API deployed on Azure App Service, database on Azure SQL
## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **.NET 10 Web API** | Core backend framework, built using the MVC-based controller pattern (`ControllerBase`, attribute routing) |
| **Entity Framework Core** | Code-first ORM — models define the schema, migrations generate and version the database structure |
| **Azure SQL Database** | Cloud-hosted relational database (serverless tier) |
| **Azure App Service** | Hosts the deployed Web API with CI-style publishing from Visual Studio |
| **JWT Bearer Authentication** | Secures all endpoints; tokens issued via a dedicated `/api/Auth/login` endpoint |
| **BCrypt.Net-Next** | One-way password hashing for stored credentials |
| **Swashbuckle (Swagger)** | Interactive API documentation and testing interface |

### Frontend
| Technology | Purpose |
|---|---|
| **React (Vite)** | Frontend SPA framework and build tool |
| **React Router** | Client-side routing and protected routes |
| **Tailwind CSS** | Utility-first styling, dark theme design system |
| **Axios** | HTTP client with interceptors for automatic token attachment |
| **Recharts** | Dashboard trend visualization |
| **Lucide React** | Icon set |
## 🌐 Live Demo

The application is fully deployed and accessible online:

| Component | URL |
|---|---|
| **Web App (React)** | `https://white-meadow-0bba42700.7.azurestaticapps.net/login` |
| **API (Swagger)** | `https://library-management-api-fahad.azurewebsites.net/swagger` |

### Access the Web App

#### 1. Visit the live URL above
#### 2. Log in with the demo credentials:

`Username: admin`

`Password: admin123@`

#### 3. You'll land on the Dashboard, with full access to Authors, Categories, Books, Members, and Loans

> Note: the API is hosted on Azure App Service's free tier, which may take 10–30 seconds to "wake up" if it has been idle — the first request after inactivity may feel slow.
## 🚀 Getting Started (Self Setup)

### ⚙️ Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+) and npm
- SQL Server instance (Azure SQL, or local SQL Server/LocalDB for development)
- Visual Studio 2026 (recommended) or VS Code

#### 1. Clone the repository

```bash
git clone https://github.com/tfahadhafiz/library-management-system.git
cd LibraryManagementSystem
```

#### 2. Backend Setup (WebAPI)

```bash
cd WebAPI
dotnet restore
```

Configure your database connection and JWT signing key using .NET User Secrets:

```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=tcp:YOUR_SERVER.database.windows.net,1433;Initial Catalog=LibraryDb;User ID=YOUR_USER;Password=YOUR_PASSWORD;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
dotnet user-secrets set "Jwt:Key" "YOUR_GENERATED_BASE64_KEY"
```

Apply migrations to create the database schema:

```bash
dotnet ef database update
```

Insert the admin login record (see [Authentication](#-authentication) below for the query).

Run the API:

```bash
dotnet run
```

The API will be available at `https://localhost:{port}` — Swagger UI is at `https://localhost:{port}/swagger`.

#### 3. Frontend Setup (WebClient)

```bash
cd ../WebClient
npm install
```

Copy `.env.example` to `.env` and set your API URL:

```bash
cp .env.example .env
```

VITE_API_URL=https://localhost:{port}/api

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 🔐 Authentication

This system uses a database-backed admin account with a BCrypt-hashed password (no credentials are hardcoded in source).

**Demo login credentials:**

Username: admin

Password: admin123@


*To seed this account yourself, run the following SQL against your database after migrations are applied:

```sql
INSERT INTO Users (Username, PasswordHash, FullName, Email)
VALUES ('admin', '$2b$10$TdJf6JEBOtyHwKfoFthWL.QT21RNI7d1ORzeFZzbw7phR3gyJ7JHu', 'Tengku Fahad', 'fahad@example.com');
```

*(This hash corresponds to the password `admin123@`, generated via BCrypt.)*

### 🧪 Testing with Swagger

Swagger UI is available at `/swagger` on both local and deployed environments, and provides full interactive testing of every endpoint:

- Navigate to `https://localhost:{port}/swagger` (or the deployed Azure URL + `/swagger`)
- Expand `POST /api/Auth/login`, click **Try it out**, and submit:
```json
   { "username": "admin", "password": "admin123@" }
```
- Copy the returned `token` value
- Click the **Authorize** button (🔒 icon, top-right of the page)
- Enter `Bearer {your_token}` (include the word "Bearer" and a space) and click **Authorize**
- All other endpoints (Authors, Categories, Books, Members, Loans) are now unlocked and testable directly from the Swagger UI

### ☁️ Azure Deployment

This project is deployed entirely on Microsoft Azure using free-tier services:

| Component | Azure Service | Tier |
|---|---|---|
| **Database** | Azure SQL Database | Serverless, free-limit eligible |
| **Web API** | Azure App Service | Free (F1) |
| **React Frontend** | Azure Static Web Apps | Free |

**Live Web App:** `[Azure Static Web App URL placeholder]`
**Live API:** `https://library-management-api-fahad.azurewebsites.net/`
**Live Swagger:** `https://library-management-api-fahad.azurewebsites.net/swagger`

#### Configuration Management

Production configuration is managed via **Azure App Service Application Settings**:
- `ConnectionStrings:DefaultConnection` → set under the App Service's **Connection strings** tab
- `Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience` → set under **Application settings**

The React frontend's API base URL is configured via a committed `.env.production`.

#### Deployment Method

- **Web API**: published directly from Visual Studio's Publish wizard (Zip Deploy) to Azure App Service
- **React Frontend**: built locally (`npm run build`) and deployed via the [Azure Static Web Apps CLI](https://azure.github.io/static-web-apps-cli/) using a deployment token — no GitHub Actions integration required

## 📄 License

This project was built for educational and technical assessment purposes.
## 👤 Author

**Tengku Fahad**
https://github.com/tfahadhafiz · https://www.linkedin.com/in/tengku-fahad-541142354/
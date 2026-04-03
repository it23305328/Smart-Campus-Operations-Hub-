# Smart Campus Operations Hub

## Architecture
- **Backend:** Java Spring Boot with MySQL
- **Frontend:** React.js (Vite) with Tailwind CSS
- **CI/CD:** GitHub Actions

## Modular Structure
The application has been modularized for simultaneous development by a 4-person team:
1. **Facilities Module** (Room status, equipment tracking)
2. **Bookings Module** (Room/venue reservations)
3. **Incidents Module** (Reporting faults/issues)
4. **Notifications Module** (Alerting users)

## Setup Instructions

### Pre-requisites
- JDK 17+
- Node.js 18+ (or 20+)
- MySQL Community Server (running on default port 3306)

### 1. Database Setup
Create the MySQL database:
```sql
CREATE DATABASE smartcampus;
```

### 2. Backend Setup
Navigate into the `backend` folder:
```bash
cd backend
```
Update `src/main/resources/application.properties` with your MySQL credentials and Google OAuth client secrets.
Then run:
```bash
mvn spring-boot:run
```

### 3. Frontend Setup
Navigate into the `frontend` folder:
```bash
cd frontend
```
Install dependencies and run the dev server:
```bash
npm install
npm run dev
```

### 4. Continuous Integration
The `.github/workflows/ci.yml` is configured to run builds and tests automatically on push and PR to the `main` branch.

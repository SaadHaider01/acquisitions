# Docker Setup for Acquisitions App with Neon Database

This application supports two different database configurations:
- **Development**: Uses **Neon Local** to create ephemeral database branches in Docker
- **Production**: Connects directly to **Neon Cloud** database

## 📋 Prerequisites

- Docker Desktop installed and running
- Neon account with a project created at [console.neon.tech](https://console.neon.tech)
- Neon API Key (get from: https://console.neon.tech/app/settings/api-keys)

## 🔧 Initial Setup

### 1. Get Your Neon Credentials

1. **API Key**: Go to [Neon Console → API Keys](https://console.neon.tech/app/settings/api-keys)
2. **Project ID**: Found in Project Settings → General
3. **Parent Branch ID**: Your main branch ID (usually shown in the Neon Console dashboard)
4. **Production Connection String**: Found in your Neon project dashboard under "Connection Details"

### 2. Configure Environment Variables

#### For Development (Neon Local):

Copy and edit `.env.development`:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Database Configuration (Neon Local)
DATABASE_URL=postgres://neon:npg@neon-local:5432/acquisitions?sslmode=require

# Neon API Configuration
NEON_API_KEY=neon_api_xxxxxxxxxxxxx
NEON_PROJECT_ID=cool-project-123456
PARENT_BRANCH_ID=br-cool-darkness-123456
```

#### For Production (Neon Cloud):

Copy and edit `.env.production`:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Database Configuration (Neon Cloud)
DATABASE_URL=postgres://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/acquisitions?sslmode=require
```

## 🚀 Running the Application

### Development Mode (with Neon Local)

Neon Local creates a **fresh ephemeral branch** every time you start the container. When you stop the container, the branch is automatically deleted.

```bash
# Start the app with Neon Local
docker-compose -f docker-compose.dev.yml --env-file .env.development up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop and clean up (deletes ephemeral branch)
docker-compose -f docker-compose.dev.yml down
```

**What happens:**
1. Neon Local container starts and creates a new ephemeral branch from your parent branch
2. Application connects to `neon-local:5432` which proxies to your Neon Cloud ephemeral branch
3. You get a fresh database state for testing
4. When stopped, the ephemeral branch is automatically deleted

### Production Mode (with Neon Cloud)

Production connects directly to your Neon Cloud database without any proxy.

```bash
# Start the app in production mode
docker-compose -f docker-compose.prod.yml --env-file .env.production up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

## 🧪 Running Migrations

### Development

```bash
# Run migrations against Neon Local
docker-compose -f docker-compose.dev.yml --env-file .env.development exec app npm run db:migrate
```

### Production

```bash
# Run migrations against Neon Cloud (be careful!)
docker-compose -f docker-compose.prod.yml --env-file .env.production exec app npm run db:migrate
```

## 📊 Accessing Drizzle Studio

### Development

```bash
# Open Drizzle Studio for local development
docker-compose -f docker-compose.dev.yml --env-file .env.development exec app npm run db:studio
```

Then access at: http://localhost:4983

## 🔍 Troubleshooting

### Issue: "Cannot connect to database"

**Solution**: Ensure Neon Local is healthy before app starts
```bash
docker-compose -f docker-compose.dev.yml ps
```

The `neon-local` service should show as "healthy".

### Issue: "Invalid API key or Project ID"

**Solution**: Verify your credentials in `.env.development`:
- Check API key at: https://console.neon.tech/app/settings/api-keys
- Verify Project ID in Neon Console → Project Settings → General

### Issue: "SSL connection error"

**Solution**: For development, ensure you're using `sslmode=require` in the connection string.

### Issue: Ephemeral branch not deleted

**Solution**: The branch is only deleted when you use `docker-compose down`. Using `docker stop` may not trigger cleanup. Always use:
```bash
docker-compose -f docker-compose.dev.yml down
```

## 🔐 Security Best Practices

1. **Never commit** `.env.development` or `.env.production` to git
2. **Use secrets management** in production (AWS Secrets Manager, Azure Key Vault, etc.)
3. **Rotate API keys** regularly
4. **Use read-only credentials** for analytics/reporting services

## 📁 File Structure

```
acquisitions/
├── Dockerfile                    # Multi-stage build for the app
├── docker-compose.dev.yml        # Development with Neon Local
├── docker-compose.prod.yml       # Production with Neon Cloud
├── .env.development              # Dev environment variables
├── .env.production               # Prod environment variables
├── .dockerignore                 # Files to exclude from Docker build
└── DOCKER_README.md             # This file
```

## 🌐 Connection String Format

### Development (Neon Local)
```
postgres://neon:npg@neon-local:5432/acquisitions?sslmode=require
```
- Username: `neon` (default)
- Password: `npg` (default)
- Host: `neon-local` (Docker service name)
- Port: `5432`

### Production (Neon Cloud)
```
postgres://user:password@ep-endpoint-id.region.aws.neon.tech/dbname?sslmode=require
```
- Get this from Neon Console → Connection Details

## 🎯 Advanced: Persistent Branches per Git Branch

To persist a Neon branch per Git branch (not ephemeral):

Edit `docker-compose.dev.yml`:

```yaml
neon-local:
  image: neondatabase/neon_local:latest
  environment:
    NEON_API_KEY: ${NEON_API_KEY}
    NEON_PROJECT_ID: ${NEON_PROJECT_ID}
    DELETE_BRANCH: false  # Persist branches
  volumes:
    - ./.neon_local/:/tmp/.neon_local
    - ./.git/HEAD:/tmp/.git/HEAD:ro
```

Then add `.neon_local/` to your `.gitignore`.

## 📚 Learn More

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Neon Branching Guide](https://neon.com/docs/guides/branching)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🆘 Support

For issues with:
- **Neon Local**: https://neon.tech/docs/local/neon-local
- **Neon Cloud**: https://neon.tech/docs
- **This Application**: Open an issue in the repository

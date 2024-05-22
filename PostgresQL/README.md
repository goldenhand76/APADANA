# Run Postgres Container :100:
```bash
docker run --name postgres -e POSTGRES_PASSWORD=secret -e POSTGRES_USER=leo -d -p 5432:5432 -v postgres_data:/var/lib/postgresql/data postgres:13.0-alpine
```

FROM postgres:16-alpine

# Copy initialization SQL scripts into the container
COPY init-db.sql /docker-entrypoint-initdb.d/init-db.sql

-- Initialize separate database for each microservice
-- Script runs when Postgres container starts for the first time

-- Create DB for each microservice
CREATE DATABASE micronotes_auth;
CREATE DATABASE micronotes_users;
CREATE DATABASE micronotes_notes;
CREATE DATABASE micronotes_tags;

-- Grant permissions to the micronotes user
GRANT ALL PRIVILEGES ON DATABASE micronotes_auth TO micronotes;
GRANT ALL PRIVILEGES ON DATABASE micronotes_users TO micronotes;
GRANT ALL PRIVILEGES ON DATABASE micronotes_notes TO micronotes;
GRANT ALL PRIVILEGES ON DATABASE micronotes_tags TO micronotes;
#!/bin/bash
# Setup PostgreSQL database for OptioHire

set -e

DB_NAME="optiohire"
DB_USER="optiohire_user"
DB_PASSWORD="optiohire_pass_2024"

echo "Setting up PostgreSQL database..."

# Try to connect as current user first
if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Database $DB_NAME already exists"
else
    echo "Creating database $DB_NAME..."
    createdb "$DB_NAME" 2>/dev/null || {
        echo "Failed to create database. Trying with postgres user..."
        psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || {
            echo "Please run manually:"
            echo "  sudo -u postgres psql -c \"CREATE DATABASE $DB_NAME;\""
            echo "  sudo -u postgres psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';\""
            echo "  sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;\""
            exit 1
        }
    }
fi

# Create user if doesn't exist
psql -d "$DB_NAME" -c "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || {
    echo "Creating user $DB_USER..."
    psql -d "$DB_NAME" -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || {
        psql -U postgres -d "$DB_NAME" -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || {
            echo "Please run manually:"
            echo "  sudo -u postgres psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';\""
            exit 1
        }
    }
}

# Grant privileges
echo "Granting privileges..."
psql -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || \
psql -U postgres -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true

psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;" 2>/dev/null || \
psql -U postgres -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;" 2>/dev/null || true

echo "✅ Database setup complete!"
echo ""
echo "Connection string:"
echo "postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
echo "Now run the schema:"
echo "psql postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME -f src/db/complete_schema.sql"


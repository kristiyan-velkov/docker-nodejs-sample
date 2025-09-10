#!/bin/bash
set -e

# SQLite database backup script
BACKUP_DIR="/backups"
DB_PATH="${SQLITE_DB_PATH:-/app/data/todo.db}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sqlite_backup_$DATE.db"
KEEP_DAYS=${BACKUP_KEEP_DAYS:-7}

echo "Starting SQLite database backup at $(date)"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "Database file $DB_PATH does not exist. Skipping backup."
    exit 0
fi

# Perform SQLite backup using .backup command
sqlite3 "$DB_PATH" ".backup $BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

echo "Backup completed: ${BACKUP_FILE}.gz"

# Clean up old backups
echo "Cleaning up backups older than $KEEP_DAYS days"
find "$BACKUP_DIR" -name "sqlite_backup_*.db.gz" -mtime +$KEEP_DAYS -delete

echo "SQLite backup process completed at $(date)"

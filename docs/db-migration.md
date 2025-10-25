# DB migration plan: db.json -> SQLite/Postgres

This document outlines a safe migration path from the current JSON file (`server/data/db.json`) to a robust SQL database (SQLite for single-node / testing, Postgres for production).

Goals
- support transactions and concurrency
- make deletions auditable (for DSGVO/exports)
- allow indexed search and foreign keys

Strategy
1. Define a minimal members table schema. Keep sensitive fields encrypted/hashed where needed.
2. Provide a one-shot migration script that reads `db.json` and writes into a new SQL DB.
3. Ship the server with both read-mode (legacy db.json) and SQL mode; provide a migration flag to flip over once validated.

Schema (example)
```sql
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  firstname TEXT,
  lastname TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  birthdate TEXT,
  membership_number TEXT,
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_membership_number ON members(membership_number);
```

Migration script notes
- run offline; produce a backup of `db.json` and write to an output sqlite/postgres DB
- verify row counts and sample records
- for Postgres use COPY or parameterized INSERTs in transactions

DSGVO considerations
- If you must delete personal data, keep an audit-log table and implement a secure purge path
- Consider encrypting `email`/`phone` fields at rest with application-managed keys

Rollback
- Keep `db.json` backups with timestamps. The migration script will not delete `db.json`.

Follow-ups
- Add a migration script that creates the new DB and optionally starts server in SQL mode.

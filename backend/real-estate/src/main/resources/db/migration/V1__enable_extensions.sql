-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create Turkish text search configuration (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'turkish') THEN
        CREATE TEXT SEARCH CONFIGURATION turkish (COPY = simple);
    END IF;
END
$$;

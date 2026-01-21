-- Create Turkish text search configuration
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'turkish') THEN
        CREATE TEXT SEARCH CONFIGURATION turkish (COPY = simple);
    END IF;
END
$$;

-- Update function for search vector
CREATE OR REPLACE FUNCTION update_listing_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('turkish', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('turkish', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('turkish', coalesce(NEW.city, '')), 'C') ||
    setweight(to_tsvector('turkish', coalesce(NEW.district, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Update function for location
CREATE OR REPLACE FUNCTION update_listing_location() RETURNS trigger AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS listings_search_vector_update ON listings;
CREATE TRIGGER listings_search_vector_update BEFORE INSERT OR UPDATE
  ON listings FOR EACH ROW EXECUTE FUNCTION update_listing_search_vector();

DROP TRIGGER IF EXISTS listings_location_update ON listings;
CREATE TRIGGER listings_location_update BEFORE INSERT OR UPDATE
  ON listings FOR EACH ROW EXECUTE FUNCTION update_listing_location();

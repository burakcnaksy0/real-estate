-- Add tsvector columns for full-text search
ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vectors
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

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS listings_search_vector_update ON listings;
CREATE TRIGGER listings_search_vector_update BEFORE INSERT OR UPDATE
  ON listings FOR EACH ROW EXECUTE FUNCTION update_listing_search_vector();

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS listings_search_idx ON listings USING GIN(search_vector);

-- Update existing records
UPDATE listings SET search_vector = 
  setweight(to_tsvector('turkish', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('turkish', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('turkish', coalesce(city, '')), 'C') ||
  setweight(to_tsvector('turkish', coalesce(district, '')), 'C')
WHERE search_vector IS NULL;

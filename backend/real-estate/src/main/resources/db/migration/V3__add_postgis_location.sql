-- Add geometry column for location (PostGIS)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);

-- Create spatial index
CREATE INDEX IF NOT EXISTS listings_location_idx ON listings USING GIST(location);

-- Update existing records with location from lat/long
UPDATE listings 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;

-- Create function to auto-update location from lat/long
CREATE OR REPLACE FUNCTION update_listing_location() RETURNS trigger AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS listings_location_update ON listings;
CREATE TRIGGER listings_location_update BEFORE INSERT OR UPDATE
  ON listings FOR EACH ROW EXECUTE FUNCTION update_listing_location();

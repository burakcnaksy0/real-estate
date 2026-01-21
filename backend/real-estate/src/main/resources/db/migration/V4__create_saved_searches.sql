-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    search_criteria JSONB NOT NULL,
    notification_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_search_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_criteria ON saved_searches USING GIN(search_criteria);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_search_timestamp() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS saved_searches_updated_at ON saved_searches;
CREATE TRIGGER saved_searches_updated_at BEFORE UPDATE
  ON saved_searches FOR EACH ROW EXECUTE FUNCTION update_saved_search_timestamp();

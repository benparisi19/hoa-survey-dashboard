-- ============================================================================
-- Filter Presets Table
-- ============================================================================
-- Allows admins to save and reuse complex filter combinations
-- Private by default with optional sharing to other admins

CREATE TABLE IF NOT EXISTS user_filter_presets (
  preset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  preset_name TEXT NOT NULL,
  preset_description TEXT,
  filter_data JSONB NOT NULL, -- Stores the complete AdvancedFilterSet
  is_shared BOOLEAN DEFAULT false, -- Private by default, optionally share with other admins
  is_default BOOLEAN DEFAULT false, -- User's default filter on page load
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_filter_presets_user ON user_filter_presets(user_id);
CREATE INDEX idx_filter_presets_shared ON user_filter_presets(is_shared);
CREATE INDEX idx_filter_presets_default ON user_filter_presets(user_id, is_default) WHERE is_default = true;

-- Ensure only one default preset per user
CREATE UNIQUE INDEX idx_one_default_per_user ON user_filter_presets(user_id) WHERE is_default = true;

-- Add comment for documentation
COMMENT ON TABLE user_filter_presets IS 'Stores saved filter combinations for the responses table. Users can save complex filter setups and optionally share them with other admins.';
COMMENT ON COLUMN user_filter_presets.filter_data IS 'Complete AdvancedFilterSet object stored as JSONB, including all groups, conditions, and operators';
COMMENT ON COLUMN user_filter_presets.is_shared IS 'When true, this preset is visible to all admin users. Private by default.';
COMMENT ON COLUMN user_filter_presets.is_default IS 'When true, this preset loads automatically when the user visits the responses page';

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on the table
ALTER TABLE user_filter_presets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own presets
CREATE POLICY "Users can view own filter presets" ON user_filter_presets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can see shared presets from other admins
CREATE POLICY "Users can view shared filter presets" ON user_filter_presets
  FOR SELECT
  USING (is_shared = true AND is_admin());

-- Policy: Users can insert their own presets
CREATE POLICY "Users can create own filter presets" ON user_filter_presets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_admin());

-- Policy: Users can update their own presets
CREATE POLICY "Users can update own filter presets" ON user_filter_presets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own presets
CREATE POLICY "Users can delete own filter presets" ON user_filter_presets
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Helper Function to Set Default Preset
-- ============================================================================

CREATE OR REPLACE FUNCTION set_default_filter_preset(preset_id UUID)
RETURNS VOID AS $$
BEGIN
  -- First, unset any existing default for this user
  UPDATE user_filter_presets
  SET is_default = false
  WHERE user_id = auth.uid() AND is_default = true;
  
  -- Then set the new default
  UPDATE user_filter_presets
  SET is_default = true, usage_count = usage_count + 1
  WHERE preset_id = set_default_filter_preset.preset_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function to increment usage count
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_filter_preset_usage(preset_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_filter_presets
  SET usage_count = usage_count + 1
  WHERE preset_id = increment_filter_preset_usage.preset_id
    AND (user_id = auth.uid() OR is_shared = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
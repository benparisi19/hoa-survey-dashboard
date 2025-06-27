-- Phase 4: Resident Portal Database Updates
-- Run these commands in your Supabase SQL Editor
-- These extend the existing schema with authentication and property access control

-- =============================================
-- STEP 1: Extend existing people table for authentication
-- =============================================

-- Add authentication and account management columns to people table
ALTER TABLE people 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'unverified' CHECK (account_status IN ('unverified', 'pending', 'verified', 'suspended', 'inactive')),
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'resident' CHECK (account_type IN ('resident', 'owner', 'property_manager', 'hoa_admin')),
ADD COLUMN IF NOT EXISTS verification_method TEXT CHECK (verification_method IN ('hoa_verified', 'owner_invite', 'renter_invite', 'self_request')),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Update timestamps if they don't already exist
ALTER TABLE people 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =============================================
-- STEP 2: Enhance property_residents for permissions
-- =============================================

-- Add permission and verification columns to property_residents
ALTER TABLE property_residents
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '["survey_access", "property_info"]'::jsonb,
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES people(person_id),
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'disputed')),
ADD COLUMN IF NOT EXISTS can_invite_others BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'basic' CHECK (access_level IN ('basic', 'standard', 'full'));

-- =============================================
-- STEP 3: Create property ownership tracking table
-- =============================================

CREATE TABLE IF NOT EXISTS property_ownership (
  ownership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES people(person_id) ON DELETE CASCADE,
  ownership_type TEXT NOT NULL DEFAULT 'sole_owner' CHECK (ownership_type IN ('sole_owner', 'joint_owner', 'trust', 'llc', 'corporation')),
  ownership_percentage DECIMAL(5,2) DEFAULT 100.00,
  
  -- HOA verification
  verified_by_hoa BOOLEAN DEFAULT false,
  verification_documents JSONB,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES people(person_id),
  
  -- Ownership period
  ownership_start_date DATE DEFAULT CURRENT_DATE,
  ownership_end_date DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT ownership_percentage_valid CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
  CONSTRAINT ownership_dates_valid CHECK (ownership_end_date IS NULL OR ownership_end_date > ownership_start_date)
);

-- =============================================
-- STEP 4: Create property access requests table
-- =============================================

CREATE TABLE IF NOT EXISTS property_access_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
  
  -- Requester information
  requester_email TEXT NOT NULL,
  requester_name TEXT,
  claimed_relationship TEXT NOT NULL CHECK (claimed_relationship IN ('owner', 'primary_renter', 'resident', 'family', 'caretaker')),
  request_message TEXT,
  supporting_documents JSONB,
  
  -- Request status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  reviewed_by UUID REFERENCES people(person_id),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  
  -- Metadata
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  ip_address INET,
  user_agent TEXT,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (requester_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- =============================================
-- STEP 5: Create property invitations table
-- =============================================

CREATE TABLE IF NOT EXISTS property_invitations (
  invitation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES people(person_id) ON DELETE CASCADE,
  
  -- Invitation details
  invited_email TEXT NOT NULL,
  invited_name TEXT,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('primary_renter', 'resident', 'family', 'caretaker')),
  invitation_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64'),
  message TEXT,
  
  -- Permissions to grant
  permissions JSONB DEFAULT '["survey_access", "property_info"]'::jsonb,
  access_level TEXT DEFAULT 'basic' CHECK (access_level IN ('basic', 'standard', 'full')),
  can_invite_others BOOLEAN DEFAULT false,
  
  -- Status tracking
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'rejected', 'expired', 'cancelled')),
  
  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_invited_email CHECK (invited_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT invitation_dates_valid CHECK (expires_at > sent_at)
);

-- =============================================
-- STEP 6: Create property management relationships table
-- =============================================

CREATE TABLE IF NOT EXISTS property_management (
  management_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
  manager_id UUID NOT NULL REFERENCES people(person_id) ON DELETE CASCADE,
  
  -- Management details
  management_type TEXT NOT NULL DEFAULT 'owner_managed' CHECK (management_type IN ('owner_managed', 'professional_pm', 'hoa_managed')),
  permissions JSONB DEFAULT '["property_oversight", "resident_coordination", "maintenance_requests"]'::jsonb,
  
  -- Authorization
  authorized_by UUID REFERENCES people(person_id), -- The owner who authorized this
  
  -- Period
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT management_dates_valid CHECK (end_date IS NULL OR end_date > start_date),
  UNIQUE(property_id, manager_id, start_date) -- Prevent duplicate active management
);

-- =============================================
-- STEP 7: Create audit trail table
-- =============================================

CREATE TABLE IF NOT EXISTS property_access_audit (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(person_id) ON DELETE SET NULL,
  
  -- Action details
  action_type TEXT NOT NULL, -- 'invite_sent', 'access_granted', 'access_revoked', 'permissions_changed', 'ownership_verified'
  action_details JSONB,
  
  -- Who performed the action
  performed_by UUID REFERENCES people(person_id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Request metadata
  ip_address INET,
  user_agent TEXT
);

-- =============================================
-- STEP 8: Create useful views
-- =============================================

-- View: All verified property residents with current status
CREATE OR REPLACE VIEW verified_property_residents AS
SELECT 
  pr.*,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.account_status,
  p.account_type,
  prop.address,
  prop.hoa_zone
FROM property_residents pr
JOIN people p ON p.person_id = pr.person_id
JOIN properties prop ON prop.property_id = pr.property_id
WHERE pr.verification_status = 'verified'
  AND (pr.end_date IS NULL OR pr.end_date > CURRENT_DATE)
  AND p.account_status IN ('verified', 'pending');

-- View: Property ownership summary
CREATE OR REPLACE VIEW property_ownership_summary AS
SELECT 
  p.property_id,
  p.address,
  p.hoa_zone,
  COALESCE(
    array_agg(
      CASE WHEN po.owner_id IS NOT NULL THEN
        jsonb_build_object(
          'owner_name', people.first_name || ' ' || people.last_name,
          'owner_email', people.email,
          'ownership_type', po.ownership_type,
          'ownership_percentage', po.ownership_percentage,
          'verified', po.verified_by_hoa,
          'owner_id', po.owner_id
        )
      END
    ) FILTER (WHERE po.owner_id IS NOT NULL),
    ARRAY[]::jsonb[]
  ) as owners,
  COUNT(po.owner_id) as owner_count
FROM properties p
LEFT JOIN property_ownership po ON po.property_id = p.property_id 
  AND (po.ownership_end_date IS NULL OR po.ownership_end_date > CURRENT_DATE)
LEFT JOIN people ON people.person_id = po.owner_id
GROUP BY p.property_id, p.address, p.hoa_zone;

-- View: Pending access requests
CREATE OR REPLACE VIEW pending_property_requests AS
SELECT 
  par.*,
  p.address,
  p.hoa_zone,
  CASE 
    WHEN par.expires_at < NOW() THEN true 
    ELSE false 
  END as is_expired
FROM property_access_requests par
JOIN properties p ON p.property_id = par.property_id
WHERE par.status = 'pending'
ORDER BY par.requested_at DESC;

-- =============================================
-- STEP 9: Create indexes for performance
-- =============================================

-- Authentication indexes
CREATE INDEX IF NOT EXISTS idx_people_auth_user_id ON people(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_people_account_status ON people(account_status);
CREATE INDEX IF NOT EXISTS idx_people_account_type ON people(account_type);
CREATE INDEX IF NOT EXISTS idx_people_email ON people(email);

-- Property relationship indexes
CREATE INDEX IF NOT EXISTS idx_property_residents_verification ON property_residents(verification_status);
CREATE INDEX IF NOT EXISTS idx_property_residents_person_property ON property_residents(person_id, property_id);

-- Ownership indexes
CREATE INDEX IF NOT EXISTS idx_property_ownership_property ON property_ownership(property_id);
CREATE INDEX IF NOT EXISTS idx_property_ownership_owner ON property_ownership(owner_id);
CREATE INDEX IF NOT EXISTS idx_property_ownership_verified ON property_ownership(verified_by_hoa);

-- Request and invitation indexes
CREATE INDEX IF NOT EXISTS idx_property_access_requests_status ON property_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_property_access_requests_property ON property_access_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_property_invitations_status ON property_invitations(status);
CREATE INDEX IF NOT EXISTS idx_property_invitations_token ON property_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_property_invitations_email ON property_invitations(invited_email);

-- Audit indexes
CREATE INDEX IF NOT EXISTS idx_property_access_audit_property ON property_access_audit(property_id);
CREATE INDEX IF NOT EXISTS idx_property_access_audit_person ON property_access_audit(person_id);
CREATE INDEX IF NOT EXISTS idx_property_access_audit_performed_at ON property_access_audit(performed_at);

-- =============================================
-- STEP 10: Set up Row Level Security (RLS)
-- =============================================

-- Enable RLS on new tables
ALTER TABLE property_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_access_audit ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (will be expanded later)

-- Property ownership: Only owners and HOA admins can see ownership records
CREATE POLICY "Property owners can see ownership data" ON property_ownership
  FOR SELECT USING (
    owner_id = (
      SELECT person_id FROM people 
      WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
      AND account_type = 'hoa_admin'
    )
  );

-- Property access requests: Requesters and property stakeholders can see
CREATE POLICY "Requesters can see own requests" ON property_access_requests
  FOR SELECT USING (
    requester_email = (
      SELECT email FROM people 
      WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
      AND account_type IN ('hoa_admin', 'owner')
    )
  );

-- Property invitations: Inviter and invitee can see
CREATE POLICY "Invitations visible to stakeholders" ON property_invitations
  FOR SELECT USING (
    invited_by = (
      SELECT person_id FROM people 
      WHERE auth_user_id = auth.uid()
    )
    OR invited_email = (
      SELECT email FROM people 
      WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
      AND account_type = 'hoa_admin'
    )
  );

-- =============================================
-- STEP 11: Create helpful functions
-- =============================================

-- Function to get user's accessible properties
CREATE OR REPLACE FUNCTION get_user_accessible_properties(user_auth_id UUID)
RETURNS TABLE(
  property_id UUID,
  address TEXT,
  hoa_zone TEXT,
  access_type TEXT,
  permissions JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.property_id,
    p.address,
    p.hoa_zone,
    CASE
      WHEN po.owner_id IS NOT NULL THEN 'owner'
      WHEN pr.person_id IS NOT NULL THEN 'resident'
      WHEN pm.manager_id IS NOT NULL THEN 'manager'
      ELSE 'none'
    END as access_type,
    COALESCE(
      pr.permissions,
      pm.permissions,
      '["full_access"]'::jsonb
    ) as permissions
  FROM properties p
  LEFT JOIN property_ownership po ON po.property_id = p.property_id 
    AND po.owner_id = (SELECT person_id FROM people WHERE auth_user_id = user_auth_id)
    AND (po.ownership_end_date IS NULL OR po.ownership_end_date > CURRENT_DATE)
  LEFT JOIN property_residents pr ON pr.property_id = p.property_id 
    AND pr.person_id = (SELECT person_id FROM people WHERE auth_user_id = user_auth_id)
    AND (pr.end_date IS NULL OR pr.end_date > CURRENT_DATE)
  LEFT JOIN property_management pm ON pm.property_id = p.property_id 
    AND pm.manager_id = (SELECT person_id FROM people WHERE auth_user_id = user_auth_id)
    AND (pm.end_date IS NULL OR pm.end_date > CURRENT_DATE)
  WHERE po.owner_id IS NOT NULL 
    OR pr.person_id IS NOT NULL 
    OR pm.manager_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 4 database updates completed successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Set up Supabase Auth in your Next.js application';
  RAISE NOTICE '2. Create resident dashboard pages';
  RAISE NOTICE '3. Build invitation and access request workflows';
  RAISE NOTICE '4. Test authentication and property access control';
END $$;
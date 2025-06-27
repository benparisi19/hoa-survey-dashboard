-- Phase 4: Resident Portal Database Schema Enhancements
-- Building on existing people and property_residents tables

-- Extend existing people table for authentication
ALTER TABLE people 
ADD COLUMN auth_user_id UUID REFERENCES auth.users(id),
ADD COLUMN account_status TEXT DEFAULT 'unverified' CHECK (account_status IN ('unverified', 'pending', 'verified', 'suspended', 'inactive')),
ADD COLUMN verification_method TEXT CHECK (verification_method IN ('owner_invite', 'renter_invite', 'hoa_verified', 'self_request')),
ADD COLUMN last_login_at TIMESTAMPTZ,
ADD COLUMN email_verified_at TIMESTAMPTZ,
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Property access requests (for new residents requesting access)
CREATE TABLE property_access_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(property_id),
  requester_email TEXT NOT NULL,
  requester_name TEXT,
  claimed_relationship TEXT NOT NULL CHECK (claimed_relationship IN ('owner', 'primary_renter', 'resident', 'family', 'caretaker')),
  request_message TEXT,
  supporting_documents JSONB, -- File uploads for verification
  
  -- Request status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  reviewed_by UUID REFERENCES people(person_id),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  
  -- Metadata
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  ip_address INET,
  user_agent TEXT
);

-- Property invitations (when existing residents invite new ones)
CREATE TABLE property_invitations (
  invitation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(property_id),
  invited_by UUID NOT NULL REFERENCES people(person_id),
  invited_email TEXT NOT NULL,
  invited_name TEXT,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('primary_renter', 'resident', 'family')),
  
  -- Invitation status
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'rejected', 'expired', 'cancelled')),
  invitation_token TEXT UNIQUE,
  message TEXT,
  
  -- Permissions to grant
  permissions JSONB DEFAULT '["survey_access", "property_info"]'::jsonb,
  
  -- Metadata
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ
);

-- Extend property_residents for enhanced permissions
ALTER TABLE property_residents
ADD COLUMN permissions JSONB DEFAULT '["survey_access", "property_info"]'::jsonb,
ADD COLUMN invited_by UUID REFERENCES people(person_id),
ADD COLUMN verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'disputed')),
ADD COLUMN can_invite_others BOOLEAN DEFAULT false,
ADD COLUMN access_level TEXT DEFAULT 'basic' CHECK (access_level IN ('basic', 'standard', 'full'));

-- Property ownership verification (separate from residents)
CREATE TABLE property_ownership (
  ownership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(property_id),
  owner_id UUID NOT NULL REFERENCES people(person_id),
  ownership_type TEXT NOT NULL CHECK (ownership_type IN ('sole_owner', 'joint_owner', 'trust', 'llc', 'corporation')),
  ownership_percentage DECIMAL(5,2) DEFAULT 100.00,
  
  -- Verification
  verified_by_hoa BOOLEAN DEFAULT false,
  verification_documents JSONB, -- Deed, tax records, etc.
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES people(person_id),
  
  -- Dates
  ownership_start_date DATE,
  ownership_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit trail for all property access changes
CREATE TABLE property_access_audit (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(property_id),
  person_id UUID REFERENCES people(person_id),
  action_type TEXT NOT NULL, -- 'invite_sent', 'access_granted', 'access_revoked', 'permissions_changed'
  action_details JSONB,
  performed_by UUID REFERENCES people(person_id),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Views for easy querying

-- All verified property connections
CREATE VIEW verified_property_residents AS
SELECT 
  pr.*,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.account_status,
  prop.address,
  prop.hoa_zone
FROM property_residents pr
JOIN people p ON p.person_id = pr.person_id
JOIN properties prop ON prop.property_id = pr.property_id
WHERE pr.verification_status = 'verified'
  AND (pr.end_date IS NULL OR pr.end_date > CURRENT_DATE)
  AND p.account_status = 'verified';

-- Property ownership summary
CREATE VIEW property_ownership_summary AS
SELECT 
  p.property_id,
  p.address,
  p.hoa_zone,
  array_agg(
    jsonb_build_object(
      'owner_name', people.first_name || ' ' || people.last_name,
      'owner_email', people.email,
      'ownership_type', po.ownership_type,
      'ownership_percentage', po.ownership_percentage,
      'verified', po.verified_by_hoa
    )
  ) as owners
FROM properties p
LEFT JOIN property_ownership po ON po.property_id = p.property_id
LEFT JOIN people ON people.person_id = po.owner_id
WHERE po.ownership_end_date IS NULL OR po.ownership_end_date > CURRENT_DATE
GROUP BY p.property_id, p.address, p.hoa_zone;

-- Pending access requests summary
CREATE VIEW pending_property_requests AS
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

-- Indexes for performance
CREATE INDEX idx_people_auth_user_id ON people(auth_user_id);
CREATE INDEX idx_people_account_status ON people(account_status);
CREATE INDEX idx_property_residents_verification ON property_residents(verification_status);
CREATE INDEX idx_property_access_requests_status ON property_access_requests(status);
CREATE INDEX idx_property_invitations_status ON property_invitations(status);
CREATE INDEX idx_property_ownership_verified ON property_ownership(verified_by_hoa);

-- Row Level Security policies
ALTER TABLE property_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_ownership ENABLE ROW LEVEL SECURITY;

-- Residents can only see their own property information
CREATE POLICY "Residents can view own property data" ON property_residents
  FOR SELECT USING (
    person_id = (
      SELECT person_id FROM people 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Property owners can see all residents of their properties
CREATE POLICY "Owners can view their property residents" ON property_residents
  FOR SELECT USING (
    property_id IN (
      SELECT po.property_id 
      FROM property_ownership po
      JOIN people p ON p.person_id = po.owner_id
      WHERE p.auth_user_id = auth.uid()
        AND po.verified_by_hoa = true
    )
  );
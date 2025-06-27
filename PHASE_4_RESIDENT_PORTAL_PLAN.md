# Phase 4: Resident Portal Implementation Plan

**Priority Shift**: Moving from survey responses to resident authentication system as foundation for future features.

## 🎯 Overview & Requirements

### Core Principles
1. **HOA Authority**: HOA has final say on ownership disputes and permissions
2. **Property-Centric Access**: All access tied to specific properties
3. **Privacy by Need**: Residents see what they need, owners see property overview, HOA sees coordination data
4. **Multi-Property Support**: Handle owners with multiple properties, property managers
5. **Scalable Permissions**: Foundation for future survey access, communication, etc.

### User Types & Roles

#### 1. **Property Owners**
- **Verified by HOA**: Final ownership determination by HOA admin
- **Multi-Property Support**: Can own multiple properties (live in one, rent others)
- **Invitation Rights**: Can invite primary renters and residents
- **Property Overview**: See property info, current residents (not their detailed actions)
- **Survey Access**: Complete surveys for properties they manage

#### 2. **Primary Renters** 
- **Invited by Owners**: Must be invited by verified property owner
- **Delegation Rights**: Can invite other residents/family to same property
- **Property Access**: Full property information and survey participation
- **Limited Oversight**: Cannot see owner's other properties

#### 3. **Residents**
- **Invited by Owner/Primary Renter**: Secondary residents, family members
- **Basic Access**: Property info, surveys, communications
- **No Invitation Rights**: Cannot invite others (by default)

#### 4. **Property Managers**
- **Multi-Property Access**: Can manage multiple properties with owner permission
- **Professional Role**: Handles property operations, maintenance coordination
- **HOA Coordination**: Works with HOA on compliance, issues

#### 5. **HOA Admins**
- **Full System Access**: Override any permissions, resolve disputes
- **Ownership Authority**: Final say on property ownership verification
- **Privacy Access**: Can see coordination data, audit trails, system health

## 🏗️ Database Architecture

### Enhanced Schema Design

```sql
-- Core user authentication (extends existing people table)
people {
  person_id: UUID
  auth_user_id: UUID               -- Link to Supabase auth
  account_status: TEXT             -- 'verified', 'pending', 'suspended'
  account_type: TEXT               -- 'resident', 'owner', 'property_manager', 'hoa_admin'
  verification_method: TEXT        -- 'hoa_verified', 'owner_invite', etc.
  // ... existing fields
}

-- Property ownership (separate from residence)
property_ownership {
  ownership_id: UUID
  property_id: UUID
  owner_id: UUID
  ownership_type: TEXT             -- 'sole_owner', 'joint_owner', 'trust', 'llc'
  ownership_percentage: DECIMAL
  verified_by_hoa: BOOLEAN         -- HOA confirms ownership
  verification_documents: JSONB
  start_date: DATE
  end_date: DATE                   -- NULL for current
}

-- Property management relationships
property_management {
  management_id: UUID
  property_id: UUID
  manager_id: UUID                 -- Person who manages property
  management_type: TEXT            -- 'owner_managed', 'professional_pm', 'hoa_managed'
  permissions: JSONB               -- What they can do
  authorized_by: UUID              -- Owner who authorized
  start_date: DATE
  end_date: DATE
}

-- Property access requests (anyone can request)
property_access_requests {
  request_id: UUID
  property_id: UUID
  requester_email: TEXT
  claimed_relationship: TEXT       -- 'owner', 'renter', 'resident', 'manager'
  request_message: TEXT
  status: TEXT                     -- 'pending', 'approved', 'rejected'
  reviewed_by: UUID                -- HOA admin or owner
  // ... metadata
}

-- Property invitations (existing residents invite new ones)
property_invitations {
  invitation_id: UUID
  property_id: UUID
  invited_by: UUID
  invited_email: TEXT
  relationship_type: TEXT
  permissions: JSONB
  invitation_token: TEXT           -- Secure token for acceptance
  status: TEXT                     -- 'sent', 'accepted', 'rejected'
  // ... dates
}
```

### Privacy & Permission Model

```typescript
interface PermissionLevels {
  // What can each role see/do?
  resident: {
    see: ['own_property_info', 'own_surveys', 'community_announcements']
    do: ['complete_surveys', 'update_contact_info', 'request_support']
  }
  
  owner: {
    see: ['owned_properties_overview', 'current_residents_list', 'property_surveys', 'property_communications']
    do: ['invite_residents', 'manage_property_info', 'communicate_with_hoa']
  }
  
  property_manager: {
    see: ['managed_properties', 'resident_contacts', 'maintenance_requests', 'compliance_status']
    do: ['coordinate_maintenance', 'communicate_residents', 'report_to_owners']
  }
  
  hoa_admin: {
    see: ['all_properties', 'all_residents', 'system_analytics', 'audit_trails']
    do: ['verify_ownership', 'resolve_disputes', 'manage_permissions', 'system_administration']
  }
}
```

## 🚀 Implementation Plan

### Phase 4A: Core Authentication (Week 1-2)

#### 1. **Supabase Auth Integration**
```typescript
// Link existing people to auth system
// Magic link authentication
// Account verification workflows
```

#### 2. **Property Access Dashboard**
```typescript
// Resident dashboard: /dashboard
// Shows their properties, basic info, available surveys
// Property-specific pages: /properties/[id]
```

#### 3. **HOA Admin Enhancements**
```typescript
// Property ownership management
// Access request approval system
// Audit trail viewing
```

### Phase 4B: Invitation System (Week 3)

#### 1. **Owner Invitation Flow**
```typescript
// /properties/[id]/residents/invite
// Email invitations with secure tokens
// Automatic permission assignment
```

#### 2. **Access Request System**
```typescript
// Public form: /request-access
// Property search and request submission
// Owner/HOA notification system
```

### Phase 4C: Multi-Property Support (Week 4)

#### 1. **Multi-Property Owners**
```typescript
// Dashboard showing all owned properties
// Property-specific management pages
// Renter vs owned property distinction
```

#### 2. **Property Manager Integration**
```typescript
// Professional property manager accounts
// Multi-property management interface
// Owner authorization system
```

## 🎯 Key Features & User Flows

### 1. **New Resident Onboarding**
```mermaid
New Person → Request Property Access → Owner/HOA Review → Account Creation → Property Access
```

### 2. **Owner Inviting Residents**
```mermaid
Owner → Send Invitation → Email with Token → Resident Accepts → Account Created → Property Access
```

### 3. **Multi-Property Owner**
```mermaid
Owner Dashboard → Select Property → Property Overview → Manage Residents → Send Invitations
```

### 4. **HOA Ownership Verification**
```mermaid
Property Manager Notification → HOA Updates Database → Owner Account Verified → Full Permissions Granted
```

## 📊 Success Metrics

### Phase 4A Completion:
- ✅ Existing property owners can create accounts
- ✅ Basic property dashboard functional
- ✅ HOA admin can verify ownership
- ✅ Account creation and authentication working

### Phase 4B Completion:
- ✅ Owners can invite residents
- ✅ Anyone can request property access
- ✅ Email invitation system functional
- ✅ Permission assignment working

### Phase 4C Completion:
- ✅ Multi-property owners supported
- ✅ Property managers can be assigned
- ✅ Professional property management workflows
- ✅ Complex ownership scenarios handled

## 🔐 Security Considerations

1. **Email Verification**: All accounts require verified email addresses
2. **Invitation Tokens**: Secure, time-limited tokens for invitations
3. **Rate Limiting**: Prevent spam requests and invitations
4. **Audit Logging**: Track all permission changes and access grants
5. **Data Encryption**: Sensitive data encrypted at rest and in transit

## 🎯 Future Integration Points

Once resident portal is established:
- **Survey Distribution**: Automatic survey access based on property
- **Communication System**: Property-specific messaging
- **Maintenance Requests**: Resident-initiated service requests
- **Document Sharing**: Property-specific documents and announcements
- **Payment Integration**: Assessment and fee management

This foundation will support all future community engagement features while maintaining proper security and privacy controls.
/**
 * Migration script to unify user_profiles and people tables
 * This creates a people record for the existing admin user
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('Required: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateAdminUser() {
  try {
    console.log('🔍 Starting admin user migration...');
    
    // 1. Find the Supabase Auth user
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      throw new Error(`Error fetching auth users: ${authError.message}`);
    }
    
    const adminAuthUser = authUsers.users.find(user => user.email === 'benparisi19@gmail.com');
    
    if (!adminAuthUser) {
      throw new Error('Admin user benparisi19@gmail.com not found in Supabase Auth');
    }
    
    console.log(`✅ Found auth user: ${adminAuthUser.email} (ID: ${adminAuthUser.id})`);
    
    // 2. Check if they already have a people record
    const { data: existingPerson, error: checkError } = await supabase
      .from('people')
      .select('*')
      .eq('auth_user_id', adminAuthUser.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Error checking existing people record: ${checkError.message}`);
    }
    
    if (existingPerson) {
      console.log('✅ People record already exists');
      console.log('Current data:', existingPerson);
      
      // Update to ensure admin status
      const { error: updateError } = await supabase
        .from('people')
        .update({
          account_type: 'hoa_admin',
          account_status: 'verified',
          verification_method: 'hoa_verified',
          email_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('person_id', existingPerson.person_id);
      
      if (updateError) {
        throw new Error(`Error updating people record: ${updateError.message}`);
      }
      
      console.log('✅ Updated existing people record with admin status');
      return;
    }
    
    // 3. Get data from user_profiles for migration
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'benparisi19@gmail.com')
      .single();
    
    if (profileError) {
      console.warn(`Warning: Could not find user_profiles record: ${profileError.message}`);
    }
    
    console.log('📋 User profile data:', userProfile);
    
    // 4. Create people record
    const newPersonData = {
      auth_user_id: adminAuthUser.id,
      email: adminAuthUser.email,
      first_name: userProfile?.full_name?.split(' ')[0] || 'Ben',
      last_name: userProfile?.full_name?.split(' ').slice(1).join(' ') || 'Parisi',
      account_type: 'hoa_admin',
      account_status: 'verified',
      verification_method: 'hoa_verified',
      email_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: newPerson, error: insertError } = await supabase
      .from('people')
      .insert(newPersonData)
      .select()
      .single();
    
    if (insertError) {
      throw new Error(`Error creating people record: ${insertError.message}`);
    }
    
    console.log('✅ Created new people record:', newPerson);
    
    // 5. Update Supabase Auth user metadata
    const { error: metadataError } = await supabase.auth.admin.updateUserById(
      adminAuthUser.id,
      {
        user_metadata: {
          first_name: newPersonData.first_name,
          last_name: newPersonData.last_name,
          account_type: 'hoa_admin'
        }
      }
    );
    
    if (metadataError) {
      console.warn(`Warning: Could not update auth user metadata: ${metadataError.message}`);
    } else {
      console.log('✅ Updated Supabase Auth user metadata');
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Sign out of the application');
    console.log('2. Sign back in with magic link');
    console.log('3. You should now have admin access');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
migrateAdminUser();
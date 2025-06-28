const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkAdminUser() {
  console.log('🔍 Checking admin user status...\n');
  
  // Check auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error fetching auth users:', authError);
    return;
  }
  
  const adminEmail = 'benparisi19@gmail.com';
  const authUser = authUsers.users.find(u => u.email === adminEmail);
  
  if (authUser) {
    console.log('✅ Auth User Found:');
    console.log('  ID:', authUser.id);
    console.log('  Email:', authUser.email);
    console.log('  Created:', new Date(authUser.created_at).toLocaleString());
    console.log('  Last Sign In:', authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString() : 'Never');
    
    // Check people table
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single();
      
    if (personError) {
      console.error('\n❌ Error fetching person record:', personError);
    } else if (person) {
      console.log('\n✅ People Record Found:');
      console.log('  Person ID:', person.person_id);
      console.log('  Name:', person.first_name, person.last_name);
      console.log('  Account Type:', person.account_type);
      console.log('  Account Status:', person.account_status);
      console.log('  Auth User ID:', person.auth_user_id);
      console.log('  Created:', new Date(person.created_at).toLocaleString());
      
      if (person.account_type \!== 'hoa_admin') {
        console.log('\n⚠️  WARNING: Account type is not hoa_admin\!');
      }
    } else {
      console.log('\n❌ No person record found for auth user ID:', authUser.id);
    }
  } else {
    console.log('❌ No auth user found with email:', adminEmail);
  }
  
  process.exit(0);
}

checkAdminUser();
EOF < /dev/null
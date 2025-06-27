const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSPolicies() {
  console.log('🔒 Checking Row Level Security policies for survey_definitions table...\n');

  try {
    // Check if RLS is enabled on the table
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity
          FROM pg_tables 
          WHERE tablename = 'survey_definitions'
        `
      });

    if (tableError) {
      console.log('⚠️  Cannot check RLS status directly, trying alternative approach...');
      
      // Try to fetch data with different auth contexts
      console.log('\n🧪 Testing data access with service role...');
      
      const { data: serviceData, error: serviceError } = await supabase
        .from('survey_definitions')
        .select('survey_definition_id, survey_name, created_at')
        .order('created_at', { ascending: false });

      if (serviceError) {
        console.error('❌ Service role error:', serviceError);
      } else {
        console.log(`✅ Service role can access ${serviceData.length} surveys`);
        serviceData.forEach((s, i) => {
          console.log(`   ${i + 1}. ${s.survey_name}`);
        });
      }

      // Test with anon key
      console.log('\n🧪 Testing data access with anon key...');
      const anonSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const { data: anonData, error: anonError } = await anonSupabase
        .from('survey_definitions')
        .select('survey_definition_id, survey_name, created_at')
        .order('created_at', { ascending: false });

      if (anonError) {
        console.error('❌ Anon key error:', anonError);
        console.log('This suggests RLS is enabled and blocking anon access');
      } else {
        console.log(`✅ Anon key can access ${anonData.length} surveys`);
        anonData.forEach((s, i) => {
          console.log(`   ${i + 1}. ${s.survey_name}`);
        });
      }

    } else {
      console.log('Table RLS status:', tableInfo);
    }

    // Try to check policies directly
    console.log('\n📋 Attempting to list RLS policies...');
    
    const { data: policies, error: policyError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'survey_definitions'
        `
      });

    if (policyError) {
      console.log('⚠️  Cannot query policies directly');
      
      // Alternative: Check if we can insert a test record
      console.log('\n🧪 Testing insert permissions...');
      
      const testSurvey = {
        survey_name: 'RLS Test Survey',
        survey_type: 'test',
        description: 'Test survey for RLS debugging',
        response_schema: { sections: [] },
        is_active: false,
        is_template: false
      };

      const { data: insertData, error: insertError } = await supabase
        .from('survey_definitions')
        .insert(testSurvey)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Insert test failed:', insertError);
        console.log('This could indicate RLS is blocking inserts');
      } else {
        console.log('✅ Insert test successful:', insertData.survey_definition_id);
        
        // Clean up test record
        await supabase
          .from('survey_definitions')
          .delete()
          .eq('survey_definition_id', insertData.survey_definition_id);
        console.log('🧹 Cleaned up test record');
      }

    } else {
      console.log('📋 RLS Policies found:', policies);
    }

    // Final verification - show all surveys visible to service role
    console.log('\n📊 Final survey count verification...');
    const { data: finalCount, error: finalError } = await supabase
      .from('survey_definitions')
      .select('survey_definition_id')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.error('❌ Final count error:', finalError);
    } else {
      console.log(`🎯 Service role sees ${finalCount.length} total surveys`);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkRLSPolicies();
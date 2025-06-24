const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkCurrentSchema() {
  console.log('🔍 Checking current database schema...\n');
  
  try {
    // Get all tables in the database
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
      });
    
    if (tablesError) {
      // Alternative method if RPC doesn't work
      console.log('Using alternative schema check...\n');
      
      // Check each expected table individually
      const tableChecks = [
        'responses',
        'q1_q2_preference_rating', 
        'q3_opt_out_reasons',
        'q4_landscaping_issues',
        'q5_q6_construction_group',
        'q7_interest_areas',
        'q8_equipment_ownership',
        'q9_dues_preference',
        'q10_biggest_concern',
        'q11_cost_reduction',
        'q12_involvement'
      ];
      
      for (const tableName of tableChecks) {
        console.log(`📋 Checking table: ${tableName}`);
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
        } else {
          console.log(`   ✅ Table exists, sample data keys:`, Object.keys(data[0] || {}));
        }
      }
      
      // Check column names for key tables
      console.log('\n🔍 Detailed column check for Q8, Q9, Q10, Q11, Q12 tables:\n');
      
      const detailTables = ['q8_equipment_ownership', 'q9_dues_preference', 'q10_biggest_concern', 'q11_cost_reduction', 'q12_involvement'];
      
      for (const tableName of detailTables) {
        try {
          const { data } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (data && data.length > 0) {
            console.log(`${tableName}:`, Object.keys(data[0]));
          } else {
            console.log(`${tableName}: No data to show columns`);
          }
        } catch (err) {
          console.log(`${tableName}: Error -`, err.message);
        }
      }
      
      return;
    }
    
    console.log('📊 Current tables in database:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

checkCurrentSchema();
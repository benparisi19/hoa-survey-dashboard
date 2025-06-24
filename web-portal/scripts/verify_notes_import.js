const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verifyImport() {
  console.log('🔍 Verifying notes import...\n');
  
  try {
    // Get total count
    const { data: countData, error: countError } = await supabase
      .from('survey_notes')
      .select('note_id', { count: 'exact' });
    
    if (countError) {
      console.error('❌ Error getting count:', countError);
      return;
    }
    
    console.log(`📊 Total notes in database: ${countData.length}`);
    
    // Get priority breakdown
    const { data: priorityData, error: priorityError } = await supabase
      .from('survey_notes')
      .select('priority');
    
    if (!priorityError && priorityData) {
      const priorityCounts = priorityData.reduce((acc, note) => {
        acc[note.priority] = (acc[note.priority] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📋 Priority breakdown:');
      Object.entries(priorityCounts).forEach(([priority, count]) => {
        console.log(`   ${priority}: ${count}`);
      });
    }
    
    // Get critical issues
    const { data: criticalData, error: criticalError } = await supabase
      .from('survey_notes')
      .select('response_id, note_text, section')
      .eq('priority', 'critical')
      .limit(5);
    
    if (!criticalError && criticalData) {
      console.log('\n🚨 Sample critical issues:');
      criticalData.forEach((note, index) => {
        console.log(`   ${index + 1}. Response ${note.response_id}: ${note.note_text.substring(0, 100)}...`);
      });
    }
    
    // Test the complete_responses view
    const { data: viewData, error: viewError } = await supabase
      .from('complete_responses')
      .select('response_id, total_notes, follow_up_notes, critical_notes')
      .gt('total_notes', 0)
      .limit(5);
    
    if (!viewError && viewData) {
      console.log('\n📊 Sample responses with notes:');
      viewData.forEach(response => {
        console.log(`   ${response.response_id}: ${response.total_notes} total, ${response.follow_up_notes} follow-up, ${response.critical_notes} critical`);
      });
    }
    
    console.log('\n✅ Import verification complete!');
    
  } catch (error) {
    console.error('💥 Verification error:', error);
  }
}

verifyImport();
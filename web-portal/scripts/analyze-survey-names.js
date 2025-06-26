const { createServiceClient } = require('../lib/supabase.js');

async function analyzeSurveyNames() {
  const supabase = createServiceClient();
  
  const { data: responses, error } = await supabase
    .from('responses')
    .select('response_id, name, address, email_contact, created_at')
    .order('created_at');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Survey Respondent Data Analysis:');
  console.log('================================');
  console.log('Total responses:', responses.length);
  
  const withNames = responses.filter(r => r.name && r.name.trim() && r.name !== 'Anonymous');
  const uniqueNames = [...new Set(withNames.map(r => r.name))];
  
  console.log('Responses with names:', withNames.length, 'of', responses.length);
  console.log('Unique names found:', uniqueNames.length);
  
  console.log('\nFirst 10 responses with names:');
  withNames.slice(0, 10).forEach(r => {
    console.log({
      id: r.response_id,
      name: r.name,
      address: r.address, 
      email_contact: r.email_contact
    });
  });
  
  console.log('\nUnique names sample (first 20):');
  uniqueNames.slice(0, 20).forEach(name => console.log(`- ${name}`));
  
  // Analyze name patterns
  console.log('\nName Pattern Analysis:');
  const hasFirstLast = uniqueNames.filter(name => name.includes(' ')).length;
  const singleNames = uniqueNames.filter(name => !name.includes(' ')).length;
  const withEmail = withNames.filter(r => r.email_contact && r.email_contact.includes('@')).length;
  
  console.log(`Names with first/last: ${hasFirstLast}`);
  console.log(`Single names: ${singleNames}`);
  console.log(`Responses with email: ${withEmail}`);
}

analyzeSurveyNames().then(() => process.exit(0)).catch(console.error);
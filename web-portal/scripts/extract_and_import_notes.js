const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Track extraction progress
let extractedNotes = [];
let totalFilesProcessed = 0;
let totalNotesExtracted = 0;
let criticalIssuesFound = 0;

async function extractNotesFromFile(filePath, responseRange) {
  console.log(`📄 Processing: ${path.basename(filePath)} (${responseRange})`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let currentResponseId = null;
    let currentSection = null;
    let notes = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect response ID patterns (e.g., "| 041 |", "Response 041", etc.)
      const responseMatch = line.match(/(?:\|\s*)?(\d{3})(?:\s*\||\s*-|\s*:|\s*$)/);
      if (responseMatch) {
        currentResponseId = responseMatch[1];
      }
      
      // Detect section headers
      if (line.includes('## Additional Notes/Margin Comments')) {
        currentSection = 'margin_comments';
        continue;
      } else if (line.includes('Q1') && line.includes('Q2')) {
        currentSection = 'q1_q2';
      } else if (line.includes('Q3')) {
        currentSection = 'q3';
      } else if (line.includes('Q4')) {
        currentSection = 'q4';
      } else if (line.includes('Q5') && line.includes('Q6')) {
        currentSection = 'q5_q6';
      } else if (line.includes('Q7')) {
        currentSection = 'q7';
      } else if (line.includes('Q8')) {
        currentSection = 'q8';
      } else if (line.includes('Q9')) {
        currentSection = 'q9';
      } else if (line.includes('Q10')) {
        currentSection = 'q10';
      } else if (line.includes('Q11')) {
        currentSection = 'q11';
      } else if (line.includes('Q12')) {
        currentSection = 'q12';
      }
      
      // Extract notes from margin comments section
      if (currentSection === 'margin_comments' && currentResponseId) {
        // Look for bullet points or quoted text
        if (line.startsWith('- ') || line.startsWith('* ') || line.match(/^".*"$/)) {
          const noteText = line.replace(/^[-*]\s*/, '').replace(/^"|"$/g, '');
          if (noteText.length > 5) { // Skip very short notes
            notes.push({
              response_id: currentResponseId,
              section: 'general',
              question_context: 'margin_comment',
              note_text: noteText,
              note_type: 'margin_note',
              requires_follow_up: determineFollowUpRequired(noteText),
              priority: determinePriority(noteText)
            });
          }
        }
      }
      
      // Extract inline annotations from table cells (quoted text)
      const quotedMatch = line.match(/"([^"]+)"/);
      if (quotedMatch && currentResponseId && currentSection && currentSection !== 'margin_comments') {
        const noteText = quotedMatch[1];
        if (noteText.length > 5) {
          notes.push({
            response_id: currentResponseId,
            section: currentSection,
            question_context: 'inline_annotation',
            note_text: noteText,
            note_type: 'clarification',
            requires_follow_up: determineFollowUpRequired(noteText),
            priority: determinePriority(noteText)
          });
        }
      }
      
      // Extract complex annotations (contains specific keywords)
      if (currentResponseId && (
        line.includes('Complex annotation') ||
        line.includes('Extensive notes') ||
        line.includes('margin notes') ||
        line.includes('handwritten') ||
        line.includes('see notes')
      )) {
        notes.push({
          response_id: currentResponseId,
          section: currentSection || 'general',
          question_context: 'complex_annotation',
          note_text: line,
          note_type: 'follow_up',
          requires_follow_up: true,
          priority: 'high'
        });
      }
    }
    
    console.log(`   📋 Extracted ${notes.length} notes from ${path.basename(filePath)}`);
    return notes;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return [];
  }
}

function determineFollowUpRequired(noteText) {
  const followUpKeywords = [
    'contact', 'call', 'response', 'follow up', 'follow-up',
    'need', 'require', 'should', 'must', 'urgent', 'immediate',
    'lawsuit', 'legal', 'damage', 'repair', 'fix', 'replace',
    'flooding', 'safety', 'hazard', 'dangerous', 'broken'
  ];
  
  return followUpKeywords.some(keyword => 
    noteText.toLowerCase().includes(keyword)
  );
}

function determinePriority(noteText) {
  const criticalKeywords = [
    'lawsuit', 'legal', 'flooding', 'safety', 'hazard', 'dangerous',
    'drug', 'criminal', 'emergency', 'urgent', 'immediate', 'crisis'
  ];
  
  const highKeywords = [
    'damage', 'broken', 'repair', 'fix', 'replace', 'dead', 'dying',
    'contact', 'ignored', 'unresponsive', 'multiple times', 'years'
  ];
  
  const lowerText = noteText.toLowerCase();
  
  if (criticalKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'critical';
  } else if (highKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'high';
  } else if (noteText.length > 100) {
    return 'medium';
  } else {
    return 'low';
  }
}

async function importNotesToDatabase(notes) {
  console.log(`💾 Importing ${notes.length} notes to database...`);
  
  try {
    // Batch insert notes
    const batchSize = 50;
    let importedCount = 0;
    
    for (let i = 0; i < notes.length; i += batchSize) {
      const batch = notes.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('survey_notes')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1}:`, error);
        continue;
      }
      
      importedCount += batch.length;
      console.log(`   ✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${batch.length} notes`);
    }
    
    console.log(`🎉 Successfully imported ${importedCount} notes to database`);
    return importedCount;
    
  } catch (error) {
    console.error('❌ Error importing notes:', error);
    return 0;
  }
}

async function extractAllNotes() {
  console.log('🚀 Starting comprehensive marginal notes extraction...\n');
  
  const dataArchivePath = '/Users/Shared/Working/Surveys Regrouped/data-archive';
  
  // Define all files to process
  const files = [
    { path: `${dataArchivePath}/hoa_survey_combined.md`, range: '001-040' },
    { path: `${dataArchivePath}/hoa_survey_data_set9.md`, range: '041-045' },
    { path: `${dataArchivePath}/hoa_survey_data_set10.md`, range: '046-050' },
    { path: `${dataArchivePath}/hoa_survey_data_set11.md`, range: '051-055' },
    { path: `${dataArchivePath}/hoa_survey_data_set12.md`, range: '056-060' },
    { path: `${dataArchivePath}/hoa_survey_data_set13.md`, range: '061-065' },
    { path: `${dataArchivePath}/hoa_survey_data_set14.md`, range: '066-070' },
    { path: `${dataArchivePath}/hoa_survey_data_set15.md`, range: '071-075' },
    { path: `${dataArchivePath}/hoa_survey_data_set16.md`, range: '076-080' },
    { path: `${dataArchivePath}/hoa_survey_data_set17.md`, range: '081-085' },
    { path: `${dataArchivePath}/hoa_survey_data_set18.md`, range: '086-090' },
    { path: `${dataArchivePath}/hoa_survey_data_set19.md`, range: '091-095' },
    { path: `${dataArchivePath}/hoa_survey_data_set20.md`, range: '096-100' },
    { path: `${dataArchivePath}/hoa_survey_data_set21.md`, range: '101-105' },
    { path: `${dataArchivePath}/hoa_survey_data_set22.md`, range: '106-110' },
    { path: `${dataArchivePath}/hoa_survey_data_set23.md`, range: '111-113' }
  ];
  
  // Extract notes from all files
  for (const file of files) {
    if (fs.existsSync(file.path)) {
      const notes = await extractNotesFromFile(file.path, file.range);
      extractedNotes = extractedNotes.concat(notes);
      totalFilesProcessed++;
    } else {
      console.log(`⚠️  File not found: ${file.path}`);
    }
  }
  
  totalNotesExtracted = extractedNotes.length;
  criticalIssuesFound = extractedNotes.filter(note => note.priority === 'critical').length;
  
  console.log(`\n📊 EXTRACTION SUMMARY:`);
  console.log(`   Files processed: ${totalFilesProcessed}/16`);
  console.log(`   Total notes extracted: ${totalNotesExtracted}`);
  console.log(`   Critical issues found: ${criticalIssuesFound}`);
  console.log(`   High priority notes: ${extractedNotes.filter(n => n.priority === 'high').length}`);
  console.log(`   Notes requiring follow-up: ${extractedNotes.filter(n => n.requires_follow_up).length}`);
  
  // Import to database
  if (totalNotesExtracted > 0) {
    const importedCount = await importNotesToDatabase(extractedNotes);
    
    console.log(`\n🎯 FINAL RESULTS:`);
    console.log(`   Notes extracted: ${totalNotesExtracted}`);
    console.log(`   Notes imported: ${importedCount}`);
    console.log(`   Success rate: ${((importedCount/totalNotesExtracted) * 100).toFixed(1)}%`);
    
    if (criticalIssuesFound > 0) {
      console.log(`\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:`);
      const criticalNotes = extractedNotes.filter(note => note.priority === 'critical');
      criticalNotes.forEach((note, index) => {
        console.log(`   ${index + 1}. Response ${note.response_id}: ${note.note_text}`);
      });
    }
  } else {
    console.log('\n⚠️  No notes were extracted. Check file paths and format.');
  }
  
  console.log('\n✅ Extraction complete!');
}

// Run the extraction
extractAllNotes().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
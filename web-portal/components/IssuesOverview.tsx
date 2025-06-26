import { createClient } from '@/lib/supabase-server';

interface IssueData {
  name: string;
  count: number;
  percentage: number;
}

async function getIssuesData(): Promise<IssueData[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('q4_landscaping_issues')
      .select('*');
    
    if (error) throw error;
    
    const total = data?.length || 0;
    if (total === 0) return [];
    
    const issues = [
      {
        name: 'Irrigation Problems',
        field: 'irrigation',
        description: 'Water system issues',
      },
      {
        name: 'Poor Mowing Quality',
        field: 'poor_mowing',
        description: 'Unsatisfactory lawn cutting',
      },
      {
        name: 'Property Damage',
        field: 'property_damage',
        description: 'Damage from landscaping work',
      },
      {
        name: 'Missed Service',
        field: 'missed_service',
        description: 'Scheduled service not performed',
      },
      {
        name: 'Inadequate Weed Control',
        field: 'inadequate_weeds',
        description: 'Poor weed management',
      },
    ];
    
    return issues
      .map(issue => {
        const count = data.filter(item => item[issue.field as keyof typeof item] === 'Yes').length;
        return {
          name: issue.name,
          count,
          percentage: Math.round((count / total) * 100),
        };
      })
      .filter(issue => issue.count > 0)
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error fetching issues data:', error);
    return [];
  }
}

export default async function IssuesOverview() {
  const issues = await getIssuesData();
  
  if (issues.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No landscaping issues reported
      </div>
    );
  }
  
  // Use total responses (113) for consistent bar scaling
  const TOTAL_RESPONSES = 113;
  
  return (
    <div className="space-y-4">
      {issues.map((issue, index) => (
        <div key={issue.name} className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-900">
                {issue.name}
              </span>
              <span className="text-sm text-gray-500">
                {issue.count} responses ({issue.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(issue.count / TOTAL_RESPONSES) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
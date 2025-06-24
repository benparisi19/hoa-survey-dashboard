import { Mail, Phone, Users, UserX, MessageSquare } from 'lucide-react';

interface ContactOverviewProps {
  contactByType: {
    none: number;
    email: number;
    phone: number;
    both: number;
    other: number;
  };
  totalResponses: number;
}

export default function ContactOverview({ contactByType, totalResponses }: ContactOverviewProps) {
  const contactTypes = [
    {
      type: 'both',
      label: 'Email & Phone',
      count: contactByType.both,
      icon: Mail,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      description: 'Both email and phone provided'
    },
    {
      type: 'email',
      label: 'Email Only',
      count: contactByType.email,
      icon: Mail,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      description: 'Email address provided'
    },
    {
      type: 'phone',
      label: 'Phone Only',
      count: contactByType.phone,
      icon: Phone,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      description: 'Phone number provided'
    },
    {
      type: 'other',
      label: 'Other Method',
      count: contactByType.other,
      icon: MessageSquare,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      description: 'Mail, in-person, or other preference'
    },
    {
      type: 'none',
      label: 'No Contact',
      count: contactByType.none,
      icon: UserX,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      description: 'No contact information provided'
    },
  ];

  return (
    <div className="space-y-4">
      {contactTypes.map(({ type, label, count, icon: Icon, color, bgColor, textColor, description }) => {
        const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
        
        return (
          <div key={type} className="flex items-center space-x-4">
            <div className={`flex-shrink-0 w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${textColor}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <span className="text-sm text-gray-500">
                  {count} responses ({percentage}%)
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${color}`}
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
              
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
          </div>
        );
      })}
      
      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Total Contactable</span>
          <span className="text-sm font-semibold text-gray-900">
            {contactByType.email + contactByType.phone + contactByType.both + contactByType.other} of {totalResponses}
          </span>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {Math.round(((contactByType.email + contactByType.phone + contactByType.both + contactByType.other) / totalResponses) * 100)}% provided some form of contact information
        </div>
      </div>
    </div>
  );
}
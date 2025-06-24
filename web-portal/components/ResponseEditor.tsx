'use client';

import { useState } from 'react';
import { Save, Edit3, X, CheckCircle, AlertTriangle, User, Mail, Phone, Home } from 'lucide-react';
import { parseContactInfo } from '@/lib/utils';
import ReviewControls from './ReviewControls';

interface ResponseData {
  response_id: string;
  address: string | null;
  name: string | null;
  email_contact: string | null;
  anonymous: string;
  review_status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  q1_preference: string | null;
  q2_service_rating: string | null;
  q3_maintain_self: string | null;
  q3_quality: string | null;
  q3_pet_safety: string | null;
  q3_privacy: string | null;
  q3_other_text: string | null;
  irrigation: string | null;
  poor_mowing: string | null;
  property_damage: string | null;
  missed_service: string | null;
  inadequate_weeds: string | null;
  irrigation_detail: string | null;
  other_issues: string | null;
  q5_construction_issues: string | null;
  q5_explanation: string | null;
  q6_group_action: string | null;
  plant_selection: string | null;
  watering_irrigation: string | null;
  fertilizing_pest: string | null;
  lawn_maintenance: string | null;
  seasonal_planning: string | null;
  other_interests: string | null;
  lawn_mower: string | null;
  trimmer: string | null;
  blower: string | null;
  basic_tools: string | null;
  truck_trailer: string | null;
  dues_preference: string | null;
  biggest_concern: string | null;
  cost_reduction_ideas: string | null;
  involvement_preference: string | null;
  total_notes: number;
  follow_up_notes: number;
  critical_notes: number;
}

interface ResponseEditorProps {
  response: ResponseData;
}

export default function ResponseEditor({ response }: ResponseEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedResponse, setEditedResponse] = useState(response);
  const [isSaving, setIsSaving] = useState(false);
  
  const contactInfo = parseContactInfo(response.email_contact);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement save functionality when we have database schema updates
      console.log('Saving response:', editedResponse);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving response:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedResponse(response);
    setIsEditing(false);
  };

  const updateField = (field: keyof ResponseData, value: string) => {
    setEditedResponse(prev => ({ ...prev, [field]: value }));
  };

  const renderField = (
    label: string,
    field: keyof ResponseData,
    type: 'text' | 'textarea' | 'select' = 'text',
    options?: string[]
  ) => {
    const value = editedResponse[field] || '';
    
    if (isEditing) {
      if (type === 'textarea') {
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <textarea
              value={value}
              onChange={(e) => updateField(field, e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        );
      } else if (type === 'select' && options) {
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <select
              value={value}
              onChange={(e) => updateField(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Not specified</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      } else {
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => updateField(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        );
      }
    }

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[2rem]">
          {value || <span className="text-gray-500 italic"></span>}
        </div>
      </div>
    );
  };

  const renderYesNoField = (label: string, field: keyof ResponseData) => {
    return renderField(label, field, 'select', ['Yes', 'No']);
  };

  return (
    <div className="p-6">
      {/* Editor Controls */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Survey Response Details</h2>
          
          {/* Review Controls */}
          <ReviewControls
            responseId={response.response_id}
            currentStatus={response.review_status}
            reviewedBy={response.reviewed_by}
            reviewedAt={response.reviewed_at}
            reviewNotes={response.review_notes}
            onStatusChange={(newStatus) => {
              // Update local state if needed
              console.log(`Status changed to: ${newStatus}`);
            }}
          />
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Response</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {renderField('Response ID', 'response_id')}
              {renderField('Address', 'address')}
              {renderField('Name', 'name')}
              {renderField('Anonymous', 'anonymous', 'select', ['Yes', 'No'])}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            </div>
            <div className="space-y-4">
              {renderField('Contact Information', 'email_contact', 'textarea')}
              {!isEditing && contactInfo.isValid && (
                <div className="bg-white p-3 rounded border">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Parsed Contact Details:</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Type:</strong> {contactInfo.type}</div>
                    {contactInfo.emails.length > 0 && (
                      <div><strong>Emails:</strong> {contactInfo.emails.join(', ')}</div>
                    )}
                    {contactInfo.phones.length > 0 && (
                      <div><strong>Phones:</strong> {contactInfo.phones.join(', ')}</div>
                    )}
                    {contactInfo.preferences.length > 0 && (
                      <div><strong>Preferences:</strong> {contactInfo.preferences.join(', ')}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Q1 & Q2: Preference and Service Rating */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Q1 & Q2: Landscaping Preference & Service Rating</h3>
            <div className="space-y-4">
              {renderField('Q1: Landscaping Preference', 'q1_preference', 'select', [
                'Keep current HOA landscaping',
                'Opt out and maintain it myself',
                'Opt out and hire my own landscaper',
                'Find replacement or reduce service'
              ])}
              {renderField('Q2: Service Rating', 'q2_service_rating', 'select', [
                'Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'
              ])}
            </div>
          </div>

          {/* Q3: Opt-out Reasons */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Q3: Opt-out Reasons</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderYesNoField('Want to maintain myself', 'q3_maintain_self')}
              {renderYesNoField('Poor quality', 'q3_quality')}
              {renderYesNoField('Pet safety concerns', 'q3_pet_safety')}
              {renderYesNoField('Privacy concerns', 'q3_privacy')}
            </div>
            <div className="mt-4">
              {renderField('Other reasons', 'q3_other_text', 'textarea')}
            </div>
          </div>

          {/* Q4: Landscaping Issues */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Q4: Landscaping Issues</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {renderYesNoField('Irrigation problems', 'irrigation')}
              {renderYesNoField('Poor mowing quality', 'poor_mowing')}
              {renderYesNoField('Property damage', 'property_damage')}
              {renderYesNoField('Missed service', 'missed_service')}
              {renderYesNoField('Inadequate weed control', 'inadequate_weeds')}
            </div>
            <div className="space-y-4">
              {renderField('Irrigation details', 'irrigation_detail', 'textarea')}
              {renderField('Other issues', 'other_issues', 'textarea')}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Q5 & Q6: Construction Issues */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Q5 & Q6: Construction Issues & Group Action</h3>
            <div className="space-y-4">
              {renderField('Q5: Construction Issues', 'q5_construction_issues', 'select', [
                'No',
                'Yes - but no documentation',
                'Yes - I have photos/documentation'
              ])}
              {renderField('Q5: Explanation', 'q5_explanation', 'textarea')}
              {renderField('Q6: Group Action Interest', 'q6_group_action', 'select', [
                'Yes', 'No', 'Maybe', 'Need more information'
              ])}
            </div>
          </div>

          {/* Q7: Interest Areas */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Q7: Community Interest Areas</h3>
            <div className="grid grid-cols-1 gap-4 mb-4">
              {renderYesNoField('Part-time paid landscaping work/management for the HOA', 'plant_selection')}
              {renderYesNoField('Volunteering for community beautification projects', 'watering_irrigation')}
              {renderYesNoField('Joining a landscaping equipment co-op (shared tools)', 'fertilizing_pest')}
              {renderYesNoField('Sharing and learning skills through community mentorship', 'lawn_maintenance')}
              {renderYesNoField('Managing a specific area near your home', 'seasonal_planning')}
            </div>
            <div className="mt-4">
              {renderField('Other interests', 'other_interests', 'textarea')}
            </div>
          </div>

          {/* Q8: Equipment Ownership */}
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Q8: Equipment Ownership</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {renderYesNoField('Lawn mower', 'lawn_mower')}
              {renderYesNoField('Trimmer/edger', 'trimmer')}
              {renderYesNoField('Leaf blower', 'blower')}
              {renderYesNoField('Basic tools', 'basic_tools')}
              {renderYesNoField('Truck/trailer', 'truck_trailer')}
            </div>
          </div>

          {/* Q9: Dues Preference */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Q9: Dues Preference</h3>
            <div className="space-y-4">
              {renderField('Dues preference', 'dues_preference', 'textarea')}
            </div>
          </div>

          {/* Q10-Q12: Open Ended Questions */}
          <div className="bg-pink-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Q10-Q12: Open Ended</h3>
            <div className="space-y-4">
              {renderField('Q10: Biggest concern', 'biggest_concern', 'textarea')}
              {renderField('Q11: Cost reduction ideas', 'cost_reduction_ideas', 'textarea')}
              {renderField('Q12: Involvement preference', 'involvement_preference', 'select', [
                'Yes', 'No', 'Just keep me informed'
              ])}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
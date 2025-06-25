'use client';

import { useState } from 'react';
import { Edit3, Save, X, FileText, User, MapPin, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { parseContactInfo } from '@/lib/utils';
import ReviewControls from './ReviewControls';
import NotesSection from './NotesSection';
import PDFViewer from './PDFViewer';
import PDFUpload from './PDFUpload';
import { saveResponse } from '@/app/actions/saveResponse';
import { updateResponsePDF } from '@/app/actions/updatePDF';

interface SurveyNote {
  note_id: number;
  response_id: string;
  section: string;
  question_context: string | null;
  note_text: string;
  note_type: string;
  requires_follow_up: boolean;
  priority: string;
  admin_notes: string | null;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

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
  pdf_file_path?: string | null;
  pdf_storage_url?: string | null;
  pdf_uploaded_at?: string | null;
}

interface SurveyFormViewProps {
  response: ResponseData;
  notes?: SurveyNote[];
}

export default function SurveyFormView({ response, notes = [] }: SurveyFormViewProps) {
  // Auto-enable editing for unreviewed responses
  const [isEditing, setIsEditing] = useState(response.review_status === 'unreviewed');
  const [editedResponse, setEditedResponse] = useState(response);
  const [isSaving, setIsSaving] = useState(false);
  const [showQ3Other, setShowQ3Other] = useState(!!response.q3_other_text);
  const [showQ4Other, setShowQ4Other] = useState(!!response.other_issues);
  const [showPDF, setShowPDF] = useState(isEditing); // Auto-show PDF when editing
  const [pdfUrl, setPdfUrl] = useState(response.pdf_storage_url || null);
  
  const contactInfo = parseContactInfo(isEditing ? editedResponse.email_contact : response.email_contact);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveResponse({
        response_id: editedResponse.response_id,
        address: editedResponse.address,
        name: editedResponse.name,
        email_contact: editedResponse.email_contact,
        anonymous: editedResponse.anonymous,
        q1_preference: editedResponse.q1_preference,
        q2_service_rating: editedResponse.q2_service_rating,
        q3_maintain_self: editedResponse.q3_maintain_self,
        q3_quality: editedResponse.q3_quality,
        q3_pet_safety: editedResponse.q3_pet_safety,
        q3_privacy: editedResponse.q3_privacy,
        q3_other_text: editedResponse.q3_other_text,
        irrigation: editedResponse.irrigation,
        poor_mowing: editedResponse.poor_mowing,
        property_damage: editedResponse.property_damage,
        missed_service: editedResponse.missed_service,
        inadequate_weeds: editedResponse.inadequate_weeds,
        irrigation_detail: editedResponse.irrigation_detail,
        other_issues: editedResponse.other_issues,
        q5_construction_issues: editedResponse.q5_construction_issues,
        q5_explanation: editedResponse.q5_explanation,
        q6_group_action: editedResponse.q6_group_action,
        paid_work: editedResponse.plant_selection,
        volunteering: editedResponse.watering_irrigation,
        equipment_coop: editedResponse.fertilizing_pest,
        mentorship: editedResponse.lawn_maintenance,
        manage_area: editedResponse.seasonal_planning,
        lawn_mower: editedResponse.lawn_mower,
        trimmer: editedResponse.trimmer,
        blower: editedResponse.blower,
        basic_tools: editedResponse.basic_tools,
        truck_trailer: editedResponse.truck_trailer,
        dues_preference: editedResponse.dues_preference,
        biggest_concern: editedResponse.biggest_concern,
        cost_reduction_ideas: editedResponse.cost_reduction_ideas,
        involvement_preference: editedResponse.involvement_preference
      });

      if (result.success) {
        setIsEditing(false);
        alert('Response saved successfully!');
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error saving response:', error);
      alert('Error saving response. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedResponse(response);
    setIsEditing(false);
    setShowPDF(false); // Hide PDF when done editing
  };

  const handlePDFUpload = async (url: string) => {
    setPdfUrl(url);
    // Update database with PDF info
    const result = await updateResponsePDF(response.response_id, url);
    if (!result.success) {
      console.error('Failed to update PDF in database:', result.error);
    }
  };

  const togglePDF = () => {
    setShowPDF(!showPDF);
  };

  // Update PDF visibility when editing state changes
  const startEditing = () => {
    setIsEditing(true);
    setShowPDF(true); // Auto-show PDF when editing
  };

  const updateField = (field: keyof ResponseData | string, value: string | null) => {
    // Handle pseudo-fields for conditional display
    if (field === 'has_q3_other') {
      const isChecked = value === 'Yes';
      setShowQ3Other(isChecked);
      if (!isChecked) {
        setEditedResponse(prev => ({ ...prev, q3_other_text: null }));
      }
      return;
    }
    if (field === 'has_other_issues') {
      const isChecked = value === 'Yes';
      setShowQ4Other(isChecked);
      if (!isChecked) {
        setEditedResponse(prev => ({ ...prev, other_issues: null }));
      }
      return;
    }
    
    setEditedResponse(prev => ({ ...prev, [field]: value }));
  };

  const CheckBox = ({ 
    checked, 
    label, 
    field,
    disabled = false 
  }: { 
    checked: boolean; 
    label: string; 
    field?: keyof ResponseData | string;
    disabled?: boolean;
  }) => {
    if (isEditing && field) {
      return (
        <label className="flex items-center space-x-2 mb-1 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => updateField(field, e.target.checked ? 'Yes' : 'No')}
            className="w-4 h-4 text-blue-600 border-gray-400 rounded focus:ring-blue-500"
          />
          <span className="text-sm">{label}</span>
        </label>
      );
    }
    
    return (
      <div className="flex items-center space-x-2 mb-1">
        <div className={`w-4 h-4 border border-gray-400 rounded ${checked ? 'bg-blue-600' : 'bg-white'} flex items-center justify-center`}>
          {checked && <span className="text-white text-xs">✓</span>}
        </div>
        <span className="text-sm">{label}</span>
      </div>
    );
  };

  const RadioButton = ({ 
    selected, 
    label, 
    value,
    field,
    disabled = false 
  }: { 
    selected: boolean; 
    label: string; 
    value: string;
    field?: keyof ResponseData | string;
    disabled?: boolean;
  }) => {
    if (isEditing && field) {
      return (
        <label className="flex items-center space-x-2 mb-1 cursor-pointer">
          <input
            type="radio"
            name={field}
            checked={selected}
            onChange={() => updateField(field, value)}
            className="w-4 h-4 text-blue-600 border-gray-400 focus:ring-blue-500"
          />
          <span className="text-sm">{label}</span>
        </label>
      );
    }
    
    return (
      <div className="flex items-center space-x-2 mb-1">
        <div className={`w-4 h-4 border border-gray-400 rounded-full ${selected ? 'bg-blue-600' : 'bg-white'} flex items-center justify-center`}>
          {selected && <div className="w-2 h-2 bg-white rounded-full"></div>}
        </div>
        <span className="text-sm">{label}</span>
      </div>
    );
  };

  const TextResponse = ({ 
    value, 
    placeholder = "",
    multiline = false,
    field
  }: { 
    value: string | null; 
    placeholder?: string;
    multiline?: boolean;
    field?: keyof ResponseData | string;
  }) => {
    if (isEditing && field) {
      return multiline ? (
        <textarea
          value={value || ''}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      );
    }
    
    return (
      <div className={`border-b border-gray-300 ${multiline ? 'min-h-16' : 'min-h-8'} pb-1 mb-2`}>
        <span className="text-sm">
          {value || <span className="text-gray-400 italic">{placeholder}</span>}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white">
      <div className={`${showPDF ? 'lg:grid lg:grid-cols-2 lg:gap-6' : ''}`}>
        {/* Main Form Content */}
        <div className="lg:col-span-1">
      {/* Review Controls Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="h-6 w-6 text-gray-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Survey Response #{editedResponse.response_id}</h2>
              <p className="text-sm text-gray-600">Reviewing completed survey form</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Edit/Save Buttons */}
            {editedResponse.review_status === 'unreviewed' ? (
              // For unreviewed, show save button since we're auto-editing
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            ) : (
              // For reviewed/flagged, show edit button only when not editing
              isEditing ? (
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
                  onClick={startEditing}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Response</span>
                </button>
              )
            )}
            
            <ReviewControls
              responseId={editedResponse.response_id}
              currentStatus={editedResponse.review_status}
              reviewedBy={editedResponse.reviewed_by}
              reviewedAt={editedResponse.reviewed_at}
              reviewNotes={editedResponse.review_notes}
              onStatusChange={(newStatus) => {
                // Update local state when status changes
                setEditedResponse(prev => ({ ...prev, review_status: newStatus }));
                // If marking as reviewed, exit edit mode
                if (newStatus === 'reviewed') {
                  setIsEditing(false);
                }
              }}
            />
            
            {/* PDF Toggle Button */}
            <button
              onClick={togglePDF}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showPDF 
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title={showPDF ? 'Hide PDF' : 'Show PDF'}
            >
              {showPDF ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showPDF ? 'Hide PDF' : 'View PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Survey Form */}
      <div className="p-8 space-y-8">
        {/* Survey Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Movado Greens</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">COMMUNITY FEEDBACK SURVEY</h2>
          <div className="text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
            <p className="mb-2">
              <strong>Dear Neighbors (homeowners and renters),</strong>
            </p>
            <p className="mb-2">
              As your soon-to-be HOA board member, I am independently seeking your feedback to better
              represent your needs and explore cost-saving solutions for our community.
            </p>
            <p className="mb-2">
              This year we are currently projected to spend nearly <strong>$290,000 on landscaping</strong>; 2024-2025 has
              seen a significant increase in our expenses compared to 2022-2023, however the current
              expense (~$290,000) works out to approximately <strong>$24 per week per house</strong>.
            </p>
            <p className="mb-2">
              I am requesting that you consider whether this cost is reasonable for the service you are
              receiving and share your feedback on what path forward seems most desirable.
            </p>
            <p className="mb-4">
              <strong>$24 per week is $312 per quarter</strong>, meaning if we stay the course, we must increase dues.
            </p>
            <p className="mb-2">
              Your responses to this survey will help shape our approach to the financial challenges we're
              facing; it's best if you answer them in order. Thank you for your time and consideration.
            </p>
            <p className="text-right mt-4">
              <strong>Best,<br />Ben Parisi</strong>
            </p>
          </div>
        </div>

        {/* Response Information */}
        <div className="bg-blue-50 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Response Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-600" />
              {isEditing ? (
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700">Name:</label>
                  <input
                    type="text"
                    value={editedResponse.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Anonymous"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <span><strong>Name:</strong> {editedResponse.name || 'Anonymous'}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              {isEditing ? (
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700">Address:</label>
                  <input
                    type="text"
                    value={editedResponse.address || ''}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder=""
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <span><strong>Address:</strong> {editedResponse.address || ''}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {contactInfo.type === 'email' ? <Mail className="h-4 w-4 text-gray-600" /> :
               contactInfo.type === 'phone' ? <Phone className="h-4 w-4 text-gray-600" /> :
               contactInfo.type === 'both' ? <Mail className="h-4 w-4 text-gray-600" /> :
               <span className="h-4 w-4" />}
              {isEditing ? (
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700">Contact:</label>
                  <input
                    type="text"
                    value={editedResponse.email_contact || ''}
                    onChange={(e) => updateField('email_contact', e.target.value)}
                    placeholder="Email/Phone"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <span><strong>Contact:</strong> {contactInfo.displayText}</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: Current Landscaping Experience */}
        <div className="space-y-6">
          <div className="border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Section 1: Current Landscaping Experience</h3>
          </div>

          {/* Question 1 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              1. If you had to choose today, which option would you prefer?
            </h4>
            <div className="ml-4 space-y-1">
              <RadioButton 
                selected={editedResponse.q1_preference?.includes('Keep current HOA') || false} 
                label="Keep current HOA landscaping service (knowing dues would increase)"
                value="Keep current HOA landscaping"
                field="q1_preference"
              />
              <RadioButton 
                selected={editedResponse.q1_preference?.includes('hire my own landscaper') || false} 
                label="Opt out and hire my own landscaper (and receive dues reduction)"
                value="Opt out and hire my own landscaper"
                field="q1_preference"
              />
              <RadioButton 
                selected={editedResponse.q1_preference?.includes('maintain it myself') || false} 
                label="Opt out and maintain it myself (and receive dues reduction)"
                value="Opt out and maintain it myself"
                field="q1_preference"
              />
            </div>
          </div>

          {/* Question 2 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              2. How would you rate the current landscaping services?
            </h4>
            <div className="ml-4 space-y-1">
              <RadioButton selected={editedResponse.q2_service_rating === 'Excellent'} label="Excellent" value="Excellent" field="q2_service_rating" />
              <RadioButton selected={editedResponse.q2_service_rating === 'Good'} label="Good" value="Good" field="q2_service_rating" />
              <RadioButton selected={editedResponse.q2_service_rating === 'Fair'} label="Fair" value="Fair" field="q2_service_rating" />
              <RadioButton selected={editedResponse.q2_service_rating === 'Poor'} label="Poor" value="Poor" field="q2_service_rating" />
              <RadioButton selected={editedResponse.q2_service_rating === 'Very Poor'} label="Very Poor" value="Very Poor" field="q2_service_rating" />
            </div>
          </div>

          {/* Question 3 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              3. If you already "opt-out" with no fee reduction by locking your gate, why? (Check all that apply)
            </h4>
            <div className="ml-4 space-y-1">
              <CheckBox checked={editedResponse.q3_maintain_self === 'Yes'} label="Prefer to maintain it myself" field="q3_maintain_self" />
              <CheckBox checked={editedResponse.q3_quality === 'Yes'} label="Quality concerns" field="q3_quality" />
              <CheckBox checked={editedResponse.q3_pet_safety === 'Yes'} label="Pet safety" field="q3_pet_safety" />
              <CheckBox checked={editedResponse.q3_privacy === 'Yes'} label="Privacy" field="q3_privacy" />
              <CheckBox 
                checked={showQ3Other} 
                label="Other" 
                field="has_q3_other"
              />
              {showQ3Other && (
                <div className="mt-2 ml-6">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedResponse.q3_other_text || ''}
                      onChange={(e) => updateField('q3_other_text', e.target.value)}
                      placeholder="Specify other reason..."
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-sm text-gray-600"><strong>Other:</strong> {editedResponse.q3_other_text}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Question 4 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              4. What specific landscaping issues have you experienced, if any? (Check all that apply)
            </h4>
            <div className="ml-4 space-y-1">
              <CheckBox checked={editedResponse.irrigation === 'Yes'} label="Irrigation/sprinkler problems" field="irrigation" />
              {editedResponse.irrigation === 'Yes' && (editedResponse.irrigation_detail || isEditing) && (
                <div className="ml-6">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedResponse.irrigation_detail || ''}
                      onChange={(e) => updateField('irrigation_detail', e.target.value)}
                      placeholder="Irrigation problem details..."
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-sm text-gray-600"><strong>Details:</strong> {editedResponse.irrigation_detail}</span>
                  )}
                </div>
              )}
              <CheckBox checked={editedResponse.poor_mowing === 'Yes'} label="Poor mowing quality" field="poor_mowing" />
              <CheckBox checked={editedResponse.property_damage === 'Yes'} label="Damage to personal property" field="property_damage" />
              <CheckBox checked={editedResponse.missed_service === 'Yes'} label="Missed service dates" field="missed_service" />
              <CheckBox checked={editedResponse.inadequate_weeds === 'Yes'} label="Inadequate weed control" field="inadequate_weeds" />
              <CheckBox 
                checked={showQ4Other} 
                label="Other (describe below)" 
                field="has_other_issues"
              />
              {showQ4Other && (
                <div className="mt-2 ml-6">
                  {isEditing ? (
                    <textarea
                      value={editedResponse.other_issues || ''}
                      onChange={(e) => updateField('other_issues', e.target.value)}
                      placeholder="Describe any other issues..."
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-sm text-gray-600"><strong>Description:</strong> {editedResponse.other_issues}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Question 5 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              5. Do you have documented irrigation/landscaping issues caused by construction?
            </h4>
            <div className="ml-4 space-y-1">
              <RadioButton selected={editedResponse.q5_construction_issues === 'Yes - I have photos/documentation'} label="Yes - I have photos/documentation" value="Yes - I have photos/documentation" field="q5_construction_issues" />
              <RadioButton selected={editedResponse.q5_construction_issues === 'Yes - but no documentation'} label="Yes - but no documentation" value="Yes - but no documentation" field="q5_construction_issues" />
              <RadioButton selected={editedResponse.q5_construction_issues === 'No'} label="No construction-related issues" value="No" field="q5_construction_issues" />
              <RadioButton selected={editedResponse.q5_construction_issues?.includes('Not sure') || false} label="Not sure" value="Not sure" field="q5_construction_issues" />
            </div>
            {(editedResponse.q5_construction_issues?.includes('Not sure') || editedResponse.q5_explanation) && (
              <div className="mt-2 ml-4">
                {isEditing ? (
                  <textarea
                    value={editedResponse.q5_explanation || ''}
                    onChange={(e) => updateField('q5_explanation', e.target.value)}
                    placeholder="Please explain..."
                    rows={2}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-sm text-gray-600"><strong>Explanation:</strong> {editedResponse.q5_explanation}</span>
                )}
              </div>
            )}
          </div>

          {/* Question 6 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              6. Would you participate in a group action to address builder defects?
            </h4>
            <div className="ml-4 space-y-1">
              <RadioButton selected={editedResponse.q6_group_action === 'Yes'} label="Yes" value="Yes" field="q6_group_action" />
              <RadioButton selected={editedResponse.q6_group_action === 'Maybe'} label="Maybe" value="Maybe" field="q6_group_action" />
              <RadioButton selected={editedResponse.q6_group_action === 'No'} label="No" value="No" field="q6_group_action" />
              <RadioButton selected={editedResponse.q6_group_action === 'Need more information'} label="Need more information" value="Need more information" field="q6_group_action" />
            </div>
          </div>
        </div>

        {/* Section 2: Resources & Interest */}
        <div className="space-y-6 pt-6 border-t">
          <div className="border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Section 2: Resources & Interest</h3>
            <p className="text-sm text-gray-600 mt-1">
              One potential solution to our landscaping costs is a resident-owned cooperative that could
              provide part-time employment for neighbors while significantly reducing expenses. This section
              will help us gauge community interest and resources.
            </p>
          </div>

          {/* Question 7 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              7. Would you be interested in any of the following? (Check all that apply)
            </h4>
            <div className="ml-4 space-y-1">
              <CheckBox checked={editedResponse.plant_selection === 'Yes'} label="Part-time paid landscaping work/management for the HOA" field="plant_selection" />
              <CheckBox checked={editedResponse.watering_irrigation === 'Yes'} label="Volunteering for community beautification projects" field="watering_irrigation" />
              <CheckBox checked={editedResponse.fertilizing_pest === 'Yes'} label="Joining a landscaping equipment co-op (shared tools)" field="fertilizing_pest" />
              <CheckBox checked={editedResponse.lawn_maintenance === 'Yes'} label="Sharing and learning skills through community mentorship" field="lawn_maintenance" />
              <CheckBox checked={editedResponse.seasonal_planning === 'Yes'} label="Managing a specific area near your home" field="seasonal_planning" />
            </div>
          </div>

          {/* Question 8 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              8. Do you own any of the following? (Check all that apply)
            </h4>
            <div className="ml-4 space-y-1">
              <CheckBox checked={editedResponse.lawn_mower === 'Yes'} label="Lawn mower" field="lawn_mower" />
              <CheckBox checked={editedResponse.trimmer === 'Yes'} label="Weed trimmer/edger" field="trimmer" />
              <CheckBox checked={editedResponse.blower === 'Yes'} label="Leaf blower" field="blower" />
              <CheckBox checked={editedResponse.basic_tools === 'Yes'} label="Basic landscaping tools" field="basic_tools" />
              <CheckBox checked={editedResponse.truck_trailer === 'Yes'} label="Truck/trailer for hauling" field="truck_trailer" />
            </div>
          </div>

          {/* Question 9 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              9. If opting out of HOA landscaping reduced your dues proportionally, would you:
            </h4>
            <div className="ml-4 space-y-1">
              <RadioButton selected={editedResponse.dues_preference?.includes('Still use HOA landscaping even if dues increase') || false} label="Still use HOA landscaping even if dues increase to cover the full cost" value="Still use HOA landscaping even if dues increase" field="dues_preference" />
              <RadioButton selected={editedResponse.dues_preference?.includes('Use HOA landscaping only if') || false} label="Use HOA landscaping only if it's significantly cheaper than private options" value="Use HOA landscaping only if it's significantly cheaper" field="dues_preference" />
              <RadioButton selected={editedResponse.dues_preference?.includes('Opt out and hire my own landscaper') || false} label="Opt out and hire my own landscaper with the savings" value="Opt out and hire my own landscaper" field="dues_preference" />
              <RadioButton selected={editedResponse.dues_preference?.includes('Opt out and do it myself') || false} label="Opt out and do it myself with the savings" value="Opt out and do it myself" field="dues_preference" />
              <RadioButton selected={editedResponse.dues_preference?.includes('Depends on how much') || false} label="Depends on how much the dues reduction would be" value="Depends on how much the dues reduction would be" field="dues_preference" />
              {editedResponse.dues_preference && !editedResponse.dues_preference.match(/(Still use HOA|Use HOA landscaping only|Opt out and hire|Opt out and do|Depends on how much)/i) && (
                <div className="mt-2">
                  <span className="text-sm"><strong>Other response:</strong> {editedResponse.dues_preference}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Additional Feedback */}
        <div className="space-y-6 pt-6 border-t">
          <div className="border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Section 3: Additional Feedback</h3>
          </div>

          {/* Question 10 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              10. What's your biggest concern about HOA finances?
            </h4>
            <div className="ml-4">
              {isEditing ? (
                <textarea
                  value={editedResponse.biggest_concern || ''}
                  onChange={(e) => updateField('biggest_concern', e.target.value)}
                  placeholder="Share your concerns..."
                  rows={3}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="border-b border-gray-300 min-h-16 pb-1 mb-2">
                  <span className="text-sm">
                    {editedResponse.biggest_concern || <span className="text-gray-400 italic">No response provided</span>}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Question 11 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              11. Other ideas for reducing landscaping costs?
            </h4>
            <div className="ml-4">
              {isEditing ? (
                <textarea
                  value={editedResponse.cost_reduction_ideas || ''}
                  onChange={(e) => updateField('cost_reduction_ideas', e.target.value)}
                  placeholder="Share your ideas..."
                  rows={3}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="border-b border-gray-300 min-h-16 pb-1 mb-2">
                  <span className="text-sm">
                    {editedResponse.cost_reduction_ideas || <span className="text-gray-400 italic">No response provided</span>}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Question 12 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              12. Would you like to be involved in finding solutions?
            </h4>
            <div className="ml-4 space-y-2">
              <RadioButton selected={editedResponse.involvement_preference === 'Yes'} label="Yes - contact me" value="Yes" field="involvement_preference" />
              <RadioButton selected={editedResponse.involvement_preference === 'No'} label="No - just keep me informed" value="No" field="involvement_preference" />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="pt-6 border-t">
          <NotesSection 
            notes={notes} 
            responseId={response.response_id}
            editable={true}
          />
        </div>

        {/* Survey Footer */}
        <div className="pt-6 border-t text-center">
          <p className="text-lg font-semibold text-gray-900">Thank you for your input!</p>
          <p className="text-base text-gray-800 mt-2">- Ben</p>
        </div>
      </div>
    </div>
    
    {/* PDF Viewer Column */}
    {showPDF && (
      <div className="lg:col-span-1 mt-6 lg:mt-0">
        <div className="sticky top-6">
          {/* PDF Upload Section (only show when editing) */}
          {isEditing && (
            <div className="mb-4">
              <PDFUpload
                responseId={response.response_id}
                currentPdfUrl={pdfUrl}
                onUploadComplete={handlePDFUpload}
              />
            </div>
          )}
          
          {/* PDF Viewer */}
          <PDFViewer
            pdfUrl={pdfUrl}
            responseId={response.response_id}
            isVisible={showPDF}
            onToggle={togglePDF}
            height="h-[700px]"
          />
        </div>
      </div>
    )}
  </div>
  </div>
  );
}
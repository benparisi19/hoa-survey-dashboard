'use client';

import { useState } from 'react';
import { Edit3, Save, X, FileText, User, MapPin, Mail, Phone } from 'lucide-react';
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
  q1_q2_notes: string | null;
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
  equipment_notes: string | null;
  dues_preference: string | null;
  dues_notes: string | null;
  biggest_concern: string | null;
  cost_reduction_ideas: string | null;
  involvement_preference: string | null;
  involvement_notes: string | null;
}

interface SurveyFormViewProps {
  response: ResponseData;
}

export default function SurveyFormView({ response }: SurveyFormViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedResponse, setEditedResponse] = useState(response);
  const [isSaving, setIsSaving] = useState(false);
  
  const contactInfo = parseContactInfo(response.email_contact);

  const CheckBox = ({ 
    checked, 
    label, 
    field,
    disabled = false 
  }: { 
    checked: boolean; 
    label: string; 
    field?: keyof ResponseData;
    disabled?: boolean;
  }) => (
    <div className="flex items-center space-x-2 mb-1">
      <div className={`w-4 h-4 border border-gray-400 rounded ${checked ? 'bg-blue-600' : 'bg-white'} flex items-center justify-center`}>
        {checked && <span className="text-white text-xs">✓</span>}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );

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
    field?: keyof ResponseData;
    disabled?: boolean;
  }) => (
    <div className="flex items-center space-x-2 mb-1">
      <div className={`w-4 h-4 border border-gray-400 rounded-full ${selected ? 'bg-blue-600' : 'bg-white'} flex items-center justify-center`}>
        {selected && <div className="w-2 h-2 bg-white rounded-full"></div>}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );

  const TextResponse = ({ 
    value, 
    placeholder = "No response provided",
    multiline = false 
  }: { 
    value: string | null; 
    placeholder?: string;
    multiline?: boolean;
  }) => (
    <div className={`border-b border-gray-300 ${multiline ? 'min-h-16' : 'min-h-8'} pb-1 mb-2`}>
      <span className="text-sm">
        {value || <span className="text-gray-400 italic">{placeholder}</span>}
      </span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Review Controls Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="h-6 w-6 text-gray-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Survey Response #{response.response_id}</h2>
              <p className="text-sm text-gray-600">Reviewing completed survey form</p>
            </div>
          </div>
          
          <ReviewControls
            responseId={response.response_id}
            currentStatus={response.review_status}
            reviewedBy={response.reviewed_by}
            reviewedAt={response.reviewed_at}
            reviewNotes={response.review_notes}
          />
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
              <span><strong>Name:</strong> {response.name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              <span><strong>Address:</strong> {response.address || 'Not provided'}</span>
            </div>
            <div className="flex items-center space-x-2">
              {contactInfo.type === 'email' ? <Mail className="h-4 w-4 text-gray-600" /> :
               contactInfo.type === 'phone' ? <Phone className="h-4 w-4 text-gray-600" /> :
               contactInfo.type === 'both' ? <Mail className="h-4 w-4 text-gray-600" /> :
               <span className="h-4 w-4" />}
              <span><strong>Contact:</strong> {contactInfo.displayText}</span>
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
                selected={response.q1_preference?.includes('Keep current HOA') || false} 
                label="Keep current HOA landscaping service (knowing dues would increase)"
                value="Keep current HOA"
              />
              <RadioButton 
                selected={response.q1_preference?.includes('hire my own landscaper') || false} 
                label="Opt out and hire my own landscaper (and receive dues reduction)"
                value="hire my own landscaper"
              />
              <RadioButton 
                selected={response.q1_preference?.includes('maintain it myself') || false} 
                label="Opt out and maintain it myself (and receive dues reduction)"
                value="maintain it myself"
              />
            </div>
            {response.q1_q2_notes && (
              <div className="mt-2 ml-4">
                <span className="text-sm text-gray-600"><strong>Notes:</strong> {response.q1_q2_notes}</span>
              </div>
            )}
          </div>

          {/* Question 2 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              2. How would you rate the current landscaping services?
            </h4>
            <div className="ml-4 space-y-1">
              <RadioButton selected={response.q2_service_rating === 'Excellent'} label="Excellent" value="Excellent" />
              <RadioButton selected={response.q2_service_rating === 'Good'} label="Good" value="Good" />
              <RadioButton selected={response.q2_service_rating === 'Fair'} label="Fair" value="Fair" />
              <RadioButton selected={response.q2_service_rating === 'Poor'} label="Poor" value="Poor" />
              <RadioButton selected={response.q2_service_rating === 'Very Poor'} label="Very Poor" value="Very Poor" />
            </div>
          </div>

          {/* Question 3 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              3. If you already "opt-out" with no fee reduction by locking your gate, why? (Check all that apply)
            </h4>
            <div className="ml-4 space-y-1">
              <CheckBox checked={response.q3_maintain_self === 'Yes'} label="Prefer to maintain it myself" />
              <CheckBox checked={response.q3_quality === 'Yes'} label="Quality concerns" />
              <CheckBox checked={response.q3_pet_safety === 'Yes'} label="Pet safety" />
              <CheckBox checked={response.q3_privacy === 'Yes'} label="Privacy" />
              {response.q3_other_text && (
                <div className="mt-2">
                  <span className="text-sm"><strong>Other:</strong> {response.q3_other_text}</span>
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
              <CheckBox checked={response.irrigation === 'Yes'} label="Irrigation/sprinkler problems" />
              {response.irrigation === 'Yes' && response.irrigation_detail && (
                <div className="ml-6 text-sm text-gray-600">
                  <strong>Details:</strong> {response.irrigation_detail}
                </div>
              )}
              <CheckBox checked={response.poor_mowing === 'Yes'} label="Poor mowing quality" />
              <CheckBox checked={response.property_damage === 'Yes'} label="Damage to personal property" />
              <CheckBox checked={response.missed_service === 'Yes'} label="Missed service dates" />
              <CheckBox checked={response.inadequate_weeds === 'Yes'} label="Inadequate weed control" />
              {response.other_issues && (
                <div className="mt-2">
                  <span className="text-sm"><strong>Other issues:</strong> {response.other_issues}</span>
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
              <RadioButton selected={response.q5_construction_issues === 'Yes - I have photos/documentation'} label="Yes - I have photos/documentation" value="Yes - I have photos/documentation" />
              <RadioButton selected={response.q5_construction_issues === 'Yes - but no documentation'} label="Yes - but no documentation" value="Yes - but no documentation" />
              <RadioButton selected={response.q5_construction_issues === 'No'} label="No construction-related issues" value="No" />
              <RadioButton selected={response.q5_construction_issues?.includes('Not sure') || false} label="Not sure" value="Not sure" />
            </div>
            {response.q5_explanation && (
              <div className="mt-2 ml-4">
                <span className="text-sm text-gray-600"><strong>Explanation:</strong> {response.q5_explanation}</span>
              </div>
            )}
          </div>

          {/* Question 6 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              6. Would you participate in a group action to address builder defects?
            </h4>
            <div className="ml-4 space-y-1">
              <RadioButton selected={response.q6_group_action === 'Yes'} label="Yes" value="Yes" />
              <RadioButton selected={response.q6_group_action === 'Maybe'} label="Maybe" value="Maybe" />
              <RadioButton selected={response.q6_group_action === 'No'} label="No" value="No" />
              <RadioButton selected={response.q6_group_action === 'Need more information'} label="Need more information" value="Need more information" />
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
              7. Would you be interested in learning about any of the following? (Check all that apply)
            </h4>
            <div className="ml-4 space-y-1">
              <CheckBox checked={response.plant_selection === 'Yes'} label="Plant selection" />
              <CheckBox checked={response.watering_irrigation === 'Yes'} label="Watering/irrigation" />
              <CheckBox checked={response.fertilizing_pest === 'Yes'} label="Fertilizing/pest control" />
              <CheckBox checked={response.lawn_maintenance === 'Yes'} label="Lawn maintenance" />
              <CheckBox checked={response.seasonal_planning === 'Yes'} label="Seasonal planning" />
              {response.other_interests && (
                <div className="mt-2">
                  <span className="text-sm"><strong>Other interests:</strong> {response.other_interests}</span>
                </div>
              )}
            </div>
          </div>

          {/* Question 8 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              8. Do you own any of the following? (Check all that apply)
            </h4>
            <div className="ml-4 space-y-1">
              <CheckBox checked={response.lawn_mower === 'Yes'} label="Lawn mower" />
              <CheckBox checked={response.trimmer === 'Yes'} label="Weed trimmer/edger" />
              <CheckBox checked={response.blower === 'Yes'} label="Leaf blower" />
              <CheckBox checked={response.basic_tools === 'Yes'} label="Basic landscaping tools" />
              <CheckBox checked={response.truck_trailer === 'Yes'} label="Truck/trailer for hauling" />
              {response.equipment_notes && (
                <div className="mt-2">
                  <span className="text-sm"><strong>Notes:</strong> {response.equipment_notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Question 9 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              9. If opting out of HOA landscaping reduced your dues proportionally, would you:
            </h4>
            <div className="ml-4 space-y-1">
              <RadioButton selected={response.dues_preference?.includes('maintain it myself') || false} label="Maintain it myself (and keep the savings)" value="maintain it myself" />
              <RadioButton selected={response.dues_preference?.includes('hire my own landscaper') || false} label="Hire my own landscaper (and keep some savings)" value="hire my own landscaper" />
              <RadioButton selected={response.dues_preference?.includes('participate in cooperative') || false} label="Participate in a resident-owned cooperative" value="participate in cooperative" />
              <RadioButton selected={response.dues_preference?.includes('stay with HOA') || false} label="Stay with HOA service even with higher dues" value="stay with HOA" />
              {response.dues_preference && !response.dues_preference.match(/(maintain it myself|hire my own landscaper|participate in cooperative|stay with HOA)/i) && (
                <div className="mt-2">
                  <span className="text-sm"><strong>Other response:</strong> {response.dues_preference}</span>
                </div>
              )}
              {response.dues_notes && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600"><strong>Notes:</strong> {response.dues_notes}</span>
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
              <TextResponse value={response.biggest_concern} multiline />
            </div>
          </div>

          {/* Question 11 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              11. Other ideas for reducing landscaping costs?
            </h4>
            <div className="ml-4">
              <TextResponse value={response.cost_reduction_ideas} multiline />
            </div>
          </div>

          {/* Question 12 */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              12. Would you like to be involved in finding solutions?
            </h4>
            <div className="ml-4 space-y-2">
              <RadioButton selected={response.involvement_preference === 'Yes'} label="Yes - contact me" value="Yes" />
              <RadioButton selected={response.involvement_preference === 'No'} label="No - just keep me informed" value="No" />
              {response.involvement_notes && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600"><strong>Notes:</strong> {response.involvement_notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Survey Footer */}
        <div className="pt-6 border-t text-center">
          <p className="text-lg font-semibold text-gray-900">Thank you for your input!</p>
          <p className="text-base text-gray-800 mt-2">- Ben</p>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, User, Mail, Phone, Calendar, Star } from 'lucide-react';

interface Person {
  person_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  preferred_contact_method: 'email' | 'phone' | 'text' | 'mail';
}

interface Resident {
  resident_id: string;
  relationship_type: 'owner' | 'renter' | 'family_member' | 'unknown';
  is_primary_contact: boolean;
  is_hoa_responsible: boolean;
  start_date: string;
  end_date: string | null;
  move_in_reason?: string;
  move_out_reason?: string;
  notes: string;
  people: Person;
}

interface ResidentManagerProps {
  propertyId: string;
  residents: Resident[];
  onResidentsChange?: (residents: Resident[]) => void;
}

interface ResidentFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  relationship_type: 'owner' | 'renter' | 'family_member' | 'unknown';
  is_primary_contact: boolean;
  is_hoa_responsible: boolean;
  start_date: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  preferred_contact_method: 'email' | 'phone' | 'text' | 'mail';
  notes: string;
}

function ResidentForm({ 
  resident, 
  onSave, 
  onCancel 
}: { 
  resident?: Resident; 
  onSave: (data: ResidentFormData) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<ResidentFormData>({
    first_name: resident?.people.first_name || '',
    last_name: resident?.people.last_name || '',
    email: resident?.people.email || '',
    phone: resident?.people.phone || '',
    relationship_type: resident?.relationship_type || 'unknown',
    is_primary_contact: resident?.is_primary_contact || false,
    is_hoa_responsible: resident?.is_hoa_responsible || true,
    start_date: resident?.start_date || new Date().toISOString().split('T')[0],
    emergency_contact_name: resident?.people.emergency_contact_name || '',
    emergency_contact_phone: resident?.people.emergency_contact_phone || '',
    preferred_contact_method: resident?.people.preferred_contact_method || 'email',
    notes: resident?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field: keyof ResidentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {resident ? 'Edit Resident' : 'Add New Resident'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => updateField('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => updateField('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Relationship Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship Type
                </label>
                <select
                  value={formData.relationship_type}
                  onChange={(e) => updateField('relationship_type', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="owner">Owner</option>
                  <option value="renter">Renter</option>
                  <option value="family_member">Family Member</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Move-in Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateField('start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="primary_contact"
                  checked={formData.is_primary_contact}
                  onChange={(e) => updateField('is_primary_contact', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="primary_contact" className="ml-2 block text-sm text-gray-900">
                  Primary Contact for Property
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hoa_responsible"
                  checked={formData.is_hoa_responsible}
                  onChange={(e) => updateField('is_hoa_responsible', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="hoa_responsible" className="ml-2 block text-sm text-gray-900">
                  Responsible for HOA Communications
                </label>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact_name}
                  onChange={(e) => updateField('emergency_contact_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Preferred Contact Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Contact Method
              </label>
              <select
                value={formData.preferred_contact_method}
                onChange={(e) => updateField('preferred_contact_method', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="email">Email</option>
                <option value="phone">Phone Call</option>
                <option value="text">Text Message</option>
                <option value="mail">Physical Mail</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Additional notes about this resident..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                {resident ? 'Update Resident' : 'Add Resident'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResidentManager({ propertyId, residents, onResidentsChange }: ResidentManagerProps) {
  const [isAddingResident, setIsAddingResident] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddResident = async (formData: ResidentFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}/residents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newResident = await response.json();
        const updatedResidents = [...residents, newResident];
        onResidentsChange?.(updatedResidents);
        setIsAddingResident(false);
      } else {
        console.error('Failed to add resident');
      }
    } catch (error) {
      console.error('Error adding resident:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditResident = async (formData: ResidentFormData) => {
    if (!editingResident) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}/residents/${editingResident.resident_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedResident = await response.json();
        const updatedResidents = residents.map(r => 
          r.resident_id === editingResident.resident_id ? updatedResident : r
        );
        onResidentsChange?.(updatedResidents);
        setEditingResident(null);
      } else {
        console.error('Failed to update resident');
      }
    } catch (error) {
      console.error('Error updating resident:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveResident = async (residentId: string) => {
    if (!confirm('Are you sure you want to remove this resident?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}/residents/${residentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const updatedResidents = residents.filter(r => r.resident_id !== residentId);
        onResidentsChange?.(updatedResidents);
      } else {
        console.error('Failed to remove resident');
      }
    } catch (error) {
      console.error('Error removing resident:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Residents</h3>
        <button
          onClick={() => setIsAddingResident(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Resident
        </button>
      </div>

      {/* Residents List */}
      {residents.length > 0 ? (
        <div className="space-y-3">
          {residents.map((resident) => (
            <div key={resident.resident_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">
                        {resident.people.first_name} {resident.people.last_name}
                      </h4>
                      {resident.is_primary_contact && (
                        <Star className="h-4 w-4 text-yellow-400 ml-2" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {resident.relationship_type.replace('_', ' ')}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      {resident.people.email && (
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          <span>{resident.people.email}</span>
                        </div>
                      )}
                      {resident.people.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          <span>{resident.people.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Since {new Date(resident.start_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingResident(resident)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveResident(resident.resident_id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {resident.notes && (
                <div className="mt-2 text-sm text-gray-600">
                  {resident.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No residents added yet</p>
          <button
            onClick={() => setIsAddingResident(true)}
            className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Add the first resident
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-4 rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        </div>
      )}

      {/* Forms */}
      {isAddingResident && (
        <ResidentForm
          onSave={handleAddResident}
          onCancel={() => setIsAddingResident(false)}
        />
      )}

      {editingResident && (
        <ResidentForm
          resident={editingResident}
          onSave={handleEditResident}
          onCancel={() => setEditingResident(null)}
        />
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useAuth, useProfile } from '@/lib/auth-context-v2';
import { getUserState, UserState } from '@/lib/user-state';
import Link from 'next/link';
import {
  Info,
  X,
  ArrowRight,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface UserStateGuidanceProps {
  page?: string; // Current page context for customized guidance
  className?: string;
  dismissible?: boolean;
}

const GUIDANCE_STORAGE_KEY = 'userGuidanceDismissed';

export default function UserStateGuidance({ 
  page = 'general', 
  className = '',
  dismissible = true 
}: UserStateGuidanceProps) {
  const { user } = useAuth();
  const { userProfile } = useProfile();
  const userState = getUserState(user, userProfile);
  
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const dismissed = localStorage.getItem(`${GUIDANCE_STORAGE_KEY}_${userState}_${page}`);
      return dismissed === 'true';
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(`${GUIDANCE_STORAGE_KEY}_${userState}_${page}`, 'true');
    } catch {
      // Ignore localStorage errors
    }
  };

  if (isDismissed && dismissible) {
    return null;
  }

  const getGuidanceContent = () => {
    switch (userState) {
      case UserState.AUTHENTICATED_NO_PROFILE:
        return {
          icon: <Info className="h-5 w-5 text-blue-600" />,
          title: "Complete Your Profile",
          message: "You need to set up your profile before accessing community features.",
          action: { text: "Set Up Profile", href: "/auth/setup-profile" },
          style: "bg-blue-50 border-blue-200 text-blue-800"
        };

      case UserState.PROFILE_NO_PROPERTIES:
        if (page === 'dashboard') {
          return {
            icon: <Search className="h-5 w-5 text-purple-600" />,
            title: "Find Your Property",
            message: "To access your property dashboard and community features, you need to request access to your property first.",
            action: { text: "Search Properties", href: "/property-search" },
            style: "bg-purple-50 border-purple-200 text-purple-800",
            tip: "💡 Tip: Have your exact property address ready for faster searching"
          };
        }
        
        if (page === 'property-search') {
          return {
            icon: <Lightbulb className="h-5 w-5 text-yellow-600" />,
            title: "How to Search",
            message: "Enter your complete address or use the interactive map to find your property. Be as specific as possible.",
            style: "bg-yellow-50 border-yellow-200 text-yellow-800",
            tip: "💡 Try different formats if you don't see results: '123 Main St' vs '123 Main Street'"
          };
        }

        return {
          icon: <Search className="h-5 w-5 text-purple-600" />,
          title: "Property Access Required",
          message: "You'll need to find and request access to your property to use community features.",
          action: { text: "Find Property", href: "/property-search" },
          style: "bg-purple-50 border-purple-200 text-purple-800"
        };

      case UserState.HAS_PROPERTIES:
        if (page === 'dashboard') {
          return {
            icon: <CheckCircle className="h-5 w-5 text-green-600" />,
            title: "Welcome to Your Community!",
            message: "You now have access to all community features. Explore your properties and participate in community activities.",
            style: "bg-green-50 border-green-200 text-green-800",
            tip: "💡 Check for active surveys and community updates regularly"
          };
        }

        if (page === 'properties') {
          return {
            icon: <Info className="h-5 w-5 text-blue-600" />,
            title: "Managing Your Properties",
            message: "You can view details, invite household members, and manage settings for each of your properties.",
            style: "bg-blue-50 border-blue-200 text-blue-800",
            tip: "💡 Property owners can invite family members and tenants to access the portal"
          };
        }

        return null; // No general guidance needed for users with properties

      case UserState.ADMIN:
        if (page === 'admin-dashboard') {
          return {
            icon: <Info className="h-5 w-5 text-indigo-600" />,
            title: "Admin Dashboard",
            message: "Monitor survey responses, review access requests, and manage community analytics from here.",
            style: "bg-indigo-50 border-indigo-200 text-indigo-800",
            tip: "💡 Check the 'Unreviewed Responses' metric regularly for pending items"
          };
        }

        if (page === 'access-requests') {
          return {
            icon: <Clock className="h-5 w-5 text-orange-600" />,
            title: "Reviewing Access Requests",
            message: "Approve or deny property access requests. Verify the requester's relationship to the property before approving.",
            style: "bg-orange-50 border-orange-200 text-orange-800",
            tip: "💡 When in doubt, contact the property owner directly to verify the request"
          };
        }

        return null; // No general guidance for admins

      default:
        return null;
    }
  };

  const guidance = getGuidanceContent();
  
  if (!guidance) {
    return null;
  }

  return (
    <div className={`rounded-lg border p-4 ${guidance.style} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {guidance.icon}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {guidance.title}
          </h3>
          <p className="text-sm mt-1 opacity-90">
            {guidance.message}
          </p>
          
          {guidance.tip && (
            <p className="text-xs mt-2 opacity-80 font-medium">
              {guidance.tip}
            </p>
          )}
          
          {guidance.action && (
            <Link
              href={guidance.action.href}
              className="inline-flex items-center mt-3 text-sm font-medium hover:underline"
            >
              {guidance.action.text}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>
        
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-3 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Specialized guidance for specific situations
export function PropertySearchGuidance() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-blue-900 mb-2">Property Search Tips</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <div className="flex items-start">
              <span className="font-medium mr-2">📍</span>
              <span>Use your complete street address (e.g., "123 Main Street" not "123 Main")</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">🗺️</span>
              <span>Try the interactive map if address search doesn't work</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">🏠</span>
              <span>Make sure the property details match your residence before requesting access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccessRequestGuidance() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-green-900 mb-2">Request Submitted Successfully</h3>
          <div className="text-sm text-green-800 space-y-2">
            <p>Your access request has been sent to the property owner and HOA administrators.</p>
            <div className="flex items-start">
              <span className="font-medium mr-2">⏱️</span>
              <span>Requests are typically reviewed within 24-48 hours</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">📧</span>
              <span>You'll receive an email notification when your request is reviewed</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">❓</span>
              <span>Contact support if you don't hear back within 3 business days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorStateGuidance({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-red-900 mb-2">Something went wrong</h3>
          <p className="text-sm text-red-800 mb-3">{error}</p>
          <div className="flex items-center space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm font-medium text-red-700 hover:text-red-800 underline"
              >
                Try Again
              </button>
            )}
            <Link
              href="/help"
              className="text-sm font-medium text-red-700 hover:text-red-800 underline"
            >
              Get Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
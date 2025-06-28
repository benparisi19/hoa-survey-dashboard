'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { useAuth, useProfile } from '@/lib/auth-context-v2';
import { getUserState, UserState } from '@/lib/user-state';

interface Tooltip {
  id: string;
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  page: string; // Which page this tooltip applies to
  userStates: UserState[]; // Which user states should see this tooltip
  step?: number; // For multi-step tours
}

const TOOLTIP_STORAGE_KEY = 'onboardingTooltips';

// Define tooltips for different pages and user states
const TOOLTIPS: Tooltip[] = [
  {
    id: 'property-search-input',
    target: 'input[placeholder*="address"]',
    title: 'Enter Your Address',
    content: 'Type your complete street address here. Be as specific as possible for best results.',
    position: 'bottom',
    page: 'property-search',
    userStates: [UserState.PROFILE_NO_PROPERTIES],
    step: 1
  },
  {
    id: 'property-search-tips',
    target: '[data-tooltip="search-tips"]',
    title: 'Search Tips',
    content: 'Having trouble finding your property? Try different address formats or use the map view.',
    position: 'left',
    page: 'property-search',
    userStates: [UserState.PROFILE_NO_PROPERTIES],
    step: 2
  },
  {
    id: 'dashboard-properties',
    target: '[data-tooltip="properties-section"]',
    title: 'Your Properties',
    content: 'This shows all properties you have access to. Click on any property to view details and manage settings.',
    position: 'top',
    page: 'dashboard',
    userStates: [UserState.HAS_PROPERTIES],
    step: 1
  },
  {
    id: 'dashboard-add-property',
    target: '[data-tooltip="add-property"]',
    title: 'Add More Properties',
    content: 'You can add access to additional properties if you own or rent multiple units in the community.',
    position: 'left',
    page: 'dashboard',
    userStates: [UserState.HAS_PROPERTIES],
    step: 2
  },
  {
    id: 'admin-unreviewed',
    target: '[data-tooltip="unreviewed-metric"]',
    title: 'Unreviewed Responses',
    content: 'This shows survey responses that need your review. Click to view and manage them.',
    position: 'bottom',
    page: 'admin-dashboard',
    userStates: [UserState.ADMIN],
    step: 1
  },
  {
    id: 'access-request-approve',
    target: '[data-tooltip="approve-button"]',
    title: 'Approving Requests',
    content: 'Verify the requester\'s relationship to the property before approving. When in doubt, contact the property owner.',
    position: 'top',
    page: 'access-requests',
    userStates: [UserState.ADMIN],
    step: 1
  }
];

interface OnboardingTooltipsProps {
  page: string;
  enabled?: boolean;
}

export default function OnboardingTooltips({ page, enabled = true }: OnboardingTooltipsProps) {
  const { user } = useAuth();
  const { userProfile } = useProfile();
  const userState = getUserState(user, userProfile);
  
  const [currentTooltip, setCurrentTooltip] = useState<Tooltip | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const [completedTooltips, setCompletedTooltips] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem(`${TOOLTIP_STORAGE_KEY}_${userState}`);
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  });

  // Get tooltips for current page and user state
  const pageTooltips = TOOLTIPS.filter(tooltip => 
    tooltip.page === page && 
    tooltip.userStates.includes(userState) &&
    !completedTooltips.has(tooltip.id)
  ).sort((a, b) => (a.step || 0) - (b.step || 0));

  useEffect(() => {
    if (!enabled || pageTooltips.length === 0) return;

    const showNextTooltip = () => {
      const tooltip = pageTooltips.find(t => (t.step || 1) === currentStep);
      if (!tooltip) return;

      const targetElement = document.querySelector(tooltip.target);
      if (!targetElement) {
        // If target not found, try next step
        setCurrentStep(prev => prev + 1);
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      switch (tooltip.position) {
        case 'top':
          top = rect.top - (tooltipRect?.height || 100) - 10;
          left = rect.left + rect.width / 2 - (tooltipRect?.width || 150) / 2;
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2 - (tooltipRect?.width || 150) / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - (tooltipRect?.height || 50) / 2;
          left = rect.left - (tooltipRect?.width || 300) - 10;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - (tooltipRect?.height || 50) / 2;
          left = rect.right + 10;
          break;
      }

      setPosition({ top, left });
      setCurrentTooltip(tooltip);
      setIsVisible(true);
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(showNextTooltip, 500);
    return () => clearTimeout(timer);
  }, [currentStep, pageTooltips, enabled]);

  const handleNext = () => {
    if (currentTooltip) {
      markTooltipCompleted(currentTooltip.id);
    }
    
    const nextStep = currentStep + 1;
    const hasNextTooltip = pageTooltips.some(t => (t.step || 1) === nextStep);
    
    if (hasNextTooltip) {
      setCurrentStep(nextStep);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 1) {
      setCurrentStep(prevStep);
    }
  };

  const handleClose = () => {
    if (currentTooltip) {
      markTooltipCompleted(currentTooltip.id);
    }
    setIsVisible(false);
    setCurrentTooltip(null);
  };

  const markTooltipCompleted = (tooltipId: string) => {
    const newCompleted = new Set(Array.from(completedTooltips).concat(tooltipId));
    setCompletedTooltips(newCompleted);
    
    try {
      localStorage.setItem(
        `${TOOLTIP_STORAGE_KEY}_${userState}`,
        JSON.stringify(Array.from(newCompleted))
      );
    } catch {
      // Ignore localStorage errors
    }
  };

  const skipAllTooltips = () => {
    const allIds = pageTooltips.map(t => t.id);
    const newCompleted = new Set(Array.from(completedTooltips).concat(allIds));
    setCompletedTooltips(newCompleted);
    
    try {
      localStorage.setItem(
        `${TOOLTIP_STORAGE_KEY}_${userState}`,
        JSON.stringify(Array.from(newCompleted))
      );
    } catch {
      // Ignore localStorage errors
    }
    
    setIsVisible(false);
    setCurrentTooltip(null);
  };

  if (!isVisible || !currentTooltip || !enabled) {
    return null;
  }

  const currentStepIndex = pageTooltips.findIndex(t => t.id === currentTooltip.id) + 1;
  const totalSteps = pageTooltips.length;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
            <span className="text-xs text-gray-500 font-medium">
              {currentStepIndex} of {totalSteps}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="font-medium text-gray-900 mb-1">
            {currentTooltip.title}
          </h3>
          <p className="text-sm text-gray-600">
            {currentTooltip.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={skipAllTooltips}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Skip tour
          </button>
          
          <div className="flex items-center space-x-2">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              {currentStepIndex === totalSteps ? 'Finish' : 'Next'}
              {currentStepIndex < totalSteps && <ArrowRight className="h-3 w-3 ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Simple tooltip component for individual elements
interface SimpleTooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function SimpleTooltip({ 
  children, 
  content, 
  position = 'top', 
  className = '' 
}: SimpleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div className={`
          absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap
          ${position === 'top' ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-1' : ''}
          ${position === 'bottom' ? 'top-full left-1/2 transform -translate-x-1/2 mt-1' : ''}
          ${position === 'left' ? 'right-full top-1/2 transform -translate-y-1/2 mr-1' : ''}
          ${position === 'right' ? 'left-full top-1/2 transform -translate-y-1/2 ml-1' : ''}
        `}>
          {content}
          
          {/* Arrow */}
          <div className={`
            absolute w-0 h-0 border-2 border-transparent border-gray-900
            ${position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900 border-b-0' : ''}
            ${position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900 border-t-0' : ''}
            ${position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900 border-r-0' : ''}
            ${position === 'right' ? 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900 border-l-0' : ''}
          `} />
        </div>
      )}
    </div>
  );
}
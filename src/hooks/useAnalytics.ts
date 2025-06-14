
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}

export const useAnalytics = () => {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname,
      });
    }
  }, [location]);

  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  const trackPayment = (programName: string, amount: number, currency: string, gateway: string) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'purchase', {
        transaction_id: `${Date.now()}`,
        value: amount,
        currency: currency,
        items: [{
          item_id: programName,
          item_name: programName,
          category: 'Subscription',
          quantity: 1,
          price: amount,
        }]
      });
      
      trackEvent('payment_completed', 'Payment', `${programName} - ${gateway}`, amount);
    }
  };

  const trackVideoComplete = (videoName: string) => {
    trackEvent('video_complete', 'Engagement', videoName);
  };

  const trackRecipeSave = (recipeId: string, recipeName: string) => {
    trackEvent('recipe_save', 'Content', recipeName);
  };

  const trackRecipeUnsave = (recipeId: string, recipeName: string) => {
    trackEvent('recipe_unsave', 'Content', recipeName);
  };

  const trackPostCreate = (category: string) => {
    trackEvent('post_create', 'Community', category);
  };

  const trackPostLike = (postId: string) => {
    trackEvent('post_like', 'Community', postId);
  };

  const trackFormSubmit = (formName: string) => {
    trackEvent('form_submit', 'Form', formName);
  };

  const trackButtonClick = (buttonName: string, location: string) => {
    trackEvent('button_click', 'UI', `${buttonName} - ${location}`);
  };

  const trackMealUpload = (mealType: string) => {
    trackEvent('meal_upload', 'Content', mealType);
  };

  const trackProgressView = () => {
    trackEvent('progress_view', 'Engagement', 'Progress Page');
  };

  const trackAssessmentComplete = (assessmentType: string) => {
    trackEvent('assessment_complete', 'Engagement', assessmentType);
  };

  return {
    trackEvent,
    trackPayment,
    trackVideoComplete,
    trackRecipeSave,
    trackRecipeUnsave,
    trackPostCreate,
    trackPostLike,
    trackFormSubmit,
    trackButtonClick,
    trackMealUpload,
    trackProgressView,
    trackAssessmentComplete,
  };
};

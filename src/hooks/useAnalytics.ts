
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    GA_MEASUREMENT_ID: string;
  }
}

export const useAnalytics = () => {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    if (typeof window.gtag !== 'undefined' && window.GA_MEASUREMENT_ID) {
      window.gtag('config', window.GA_MEASUREMENT_ID, {
        page_path: location.pathname,
        page_title: document.title,
      });
      
      // Send page view event
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [location]);

  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window.gtag !== 'undefined' && window.GA_MEASUREMENT_ID) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        custom_map: {
          dimension1: 'yogi_app',
        },
      });
    }
  };

  const trackPayment = (programName: string, amount: number, currency: string, gateway: string) => {
    if (typeof window.gtag !== 'undefined' && window.GA_MEASUREMENT_ID) {
      const transactionId = `yogi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Enhanced ecommerce tracking
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: amount,
        currency: currency,
        payment_type: gateway,
        items: [{
          item_id: programName.toLowerCase().replace(/\s+/g, '_'),
          item_name: programName,
          item_category: 'Wellness_Program',
          item_category2: 'Subscription',
          quantity: 1,
          price: amount,
        }]
      });
      
      // Custom payment completion event
      trackEvent('payment_completed', 'Payment', `${programName} - ${gateway}`, amount);
      
      // Track conversion
      window.gtag('event', 'conversion', {
        send_to: window.GA_MEASUREMENT_ID,
        transaction_id: transactionId,
        value: amount,
        currency: currency,
      });
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

  const trackSignup = (method: string) => {
    trackEvent('sign_up', 'Authentication', method);
  };

  const trackLogin = (method: string) => {
    trackEvent('login', 'Authentication', method);
  };

  const trackSubscriptionStart = (programName: string) => {
    trackEvent('begin_checkout', 'Subscription', programName);
  };

  const trackUserEngagement = (action: string, content?: string) => {
    trackEvent('user_engagement', 'Engagement', content, 1);
  };

  const trackSearch = (searchTerm: string, category: string) => {
    trackEvent('search', 'Content', `${category}: ${searchTerm}`);
  };

  const trackShare = (contentType: string, contentId?: string) => {
    trackEvent('share', 'Social', `${contentType}${contentId ? ': ' + contentId : ''}`);
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
    trackSignup,
    trackLogin,
    trackSubscriptionStart,
    trackUserEngagement,
    trackSearch,
    trackShare,
  };
};

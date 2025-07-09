
import { useEffect, useCallback } from 'react';
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

  const trackEvent = useCallback((action: string, category: string, label?: string, value?: number) => {
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
  }, []);

  const trackPayment = useCallback((programName: string, amount: number, currency: string, gateway: string) => {
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
  }, [trackEvent]);

  const trackVideoComplete = useCallback((videoName: string) => {
    trackEvent('video_complete', 'Engagement', videoName);
  }, [trackEvent]);

  const trackRecipeSave = useCallback((recipeId: string, recipeName: string) => {
    trackEvent('recipe_save', 'Content', recipeName);
  }, [trackEvent]);

  const trackRecipeUnsave = useCallback((recipeId: string, recipeName: string) => {
    trackEvent('recipe_unsave', 'Content', recipeName);
  }, [trackEvent]);

  const trackPostCreate = useCallback((category: string) => {
    trackEvent('post_create', 'Community', category);
  }, [trackEvent]);

  const trackPostLike = useCallback((postId: string) => {
    trackEvent('post_like', 'Community', postId);
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formName: string) => {
    trackEvent('form_submit', 'Form', formName);
  }, [trackEvent]);

  const trackButtonClick = useCallback((buttonName: string, location: string) => {
    trackEvent('button_click', 'UI', `${buttonName} - ${location}`);
  }, [trackEvent]);

  const trackMealUpload = useCallback((mealType: string) => {
    trackEvent('meal_upload', 'Content', mealType);
  }, [trackEvent]);

  const trackProgressView = useCallback(() => {
    trackEvent('progress_view', 'Engagement', 'Progress Page');
  }, [trackEvent]);

  const trackAssessmentComplete = useCallback((assessmentType: string) => {
    trackEvent('assessment_complete', 'Engagement', assessmentType);
  }, [trackEvent]);

  const trackSignup = useCallback((method: string) => {
    trackEvent('sign_up', 'Authentication', method);
  }, [trackEvent]);

  const trackLogin = useCallback((method: string) => {
    trackEvent('login', 'Authentication', method);
  }, [trackEvent]);

  const trackSubscriptionStart = useCallback((programName: string) => {
    trackEvent('begin_checkout', 'Subscription', programName);
  }, [trackEvent]);

  const trackUserEngagement = useCallback((action: string, content?: string) => {
    trackEvent('user_engagement', 'Engagement', content, 1);
  }, [trackEvent]);

  const trackSearch = useCallback((searchTerm: string, category: string) => {
    trackEvent('search', 'Content', `${category}: ${searchTerm}`);
  }, [trackEvent]);

  const trackShare = useCallback((contentType: string, contentId?: string) => {
    trackEvent('share', 'Social', `${contentType}${contentId ? ': ' + contentId : ''}`);
  }, [trackEvent]);

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

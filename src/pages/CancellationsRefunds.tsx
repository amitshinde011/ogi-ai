
import React from 'react';
import LegalHeader from '@/components/legal/LegalHeader';
import LegalLayout from '@/components/legal/LegalLayout';
import LegalSection from '@/components/legal/LegalSection';
import ContactInfo from '@/components/legal/ContactInfo';

const CancellationsRefunds = () => {
  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-4xl mx-auto">
        <LegalHeader title="Cancellations and Refunds" />
        
        <LegalLayout lastUpdated="December 2024">
          <LegalSection title="1. Subscription Cancellation">
            <p>
              You can cancel your subscription at any time through your account settings or by contacting our support team.
            </p>
            <h3 className="font-semibold text-slate-800">How to Cancel:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Go to Settings → Subscription in the app</li>
              <li>Click "Cancel Subscription"</li>
              <li>Follow the confirmation steps</li>
              <li>Or email us at support@yogi.care</li>
            </ul>
            <p>
              <strong>Important:</strong> Cancellation will take effect at the end of your current billing period. You will continue to have access to premium features until then.
            </p>
          </LegalSection>

          <LegalSection title="2. Refund Policy">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="font-semibold text-red-800 mb-2">
                ⚠️ All Sales Are Final - No Refunds Policy
              </p>
              <p className="text-red-700">
                All subscription purchases are final and non-refundable. Once you complete your purchase, no refunds will be provided under any circumstances.
              </p>
            </div>
            
            <p>
              By purchasing a subscription to our wellness app, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>All payments are final and non-refundable</li>
              <li>You have reviewed the subscription terms before purchase</li>
              <li>You understand the services included in your subscription</li>
              <li>No refunds will be provided for any reason, including but not limited to:</li>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Change of mind</li>
                <li>Unused subscription time</li>
                <li>Technical difficulties on your device</li>
                <li>Dissatisfaction with the service</li>
                <li>Inability to access the service due to personal circumstances</li>
              </ul>
            </ul>
          </LegalSection>

          <LegalSection title="3. Exceptions to Non-Refund Policy">
            <p>
              The only exceptions to our non-refund policy are:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Duplicate charges due to technical processing errors (with verification)</li>
              <li>Unauthorized charges (subject to fraud investigation and verification)</li>
              <li>Legal requirements under applicable consumer protection laws</li>
            </ul>
            
            <p className="mt-4">
              <strong>Note:</strong> Any exception claims must be reported within 48 hours of the charge and will be reviewed on a case-by-case basis.
            </p>
          </LegalSection>

          <LegalSection title="4. Dispute Process">
            <p>
              If you believe you have been charged in error:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact our support team immediately at support@yogi.care</li>
              <li>Include your account details and transaction information</li>
              <li>Provide clear documentation of the claimed error</li>
              <li>Allow up to 5 business days for investigation</li>
            </ol>
            
            <p className="mt-4">
              <strong>Important:</strong> Disputes are only considered for technical errors, not for dissatisfaction with the service or change of mind.
            </p>
          </LegalSection>

          <LegalSection title="5. Auto-Renewal and Billing">
            <p>
              Subscriptions automatically renew unless cancelled before the next billing cycle. 
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You will be notified 7 days before renewal</li>
              <li>Cancel anytime to avoid the next charge</li>
              <li>Changes take effect at the end of the current period</li>
              <li>No refunds for mid-cycle cancellations</li>
            </ul>
            
            <p className="mt-4 font-semibold text-slate-800">
              Remember: It is your responsibility to cancel before the renewal date if you do not wish to continue your subscription.
            </p>
          </LegalSection>

          <LegalSection title="6. Free Trial Cancellations">
            <p>
              If you're on a free trial:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cancel anytime during the trial period to avoid charges</li>
              <li>You'll retain access until the trial ends</li>
              <li>No charges will be applied if cancelled before trial expiry</li>
              <li>Failure to cancel will result in automatic subscription activation</li>
              <li><strong>Once the trial converts to a paid subscription, the non-refund policy applies</strong></li>
            </ul>
          </LegalSection>

          <LegalSection title="7. Payment Method Changes">
            <p>
              If your payment method fails or expires:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Update your payment information promptly</li>
              <li>Service may be suspended for non-payment</li>
              <li>Account reactivation upon successful payment</li>
              <li>No refunds for service interruptions due to payment failures</li>
            </ul>
          </LegalSection>

          <LegalSection title="8. Contact Information">
            <p>
              For cancellations or billing questions:
            </p>
            <ContactInfo
              appName="Yogi Wellness App"
              email="support@yogi.care"
              note="Support can help with cancellations and technical issues, but cannot provide refunds per our non-refund policy."
            />
          </LegalSection>

          <LegalSection title="9. Policy Updates">
            <p>
              This policy may be updated periodically. Significant changes will be communicated via email or app notification. Continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </LegalSection>
        </LegalLayout>
      </div>
    </div>
  );
};

export default CancellationsRefunds;

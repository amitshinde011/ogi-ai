import React from 'react';
import LegalHeader from '@/components/legal/LegalHeader';
import LegalLayout from '@/components/legal/LegalLayout';
import LegalSection from '@/components/legal/LegalSection';
import ContactInfo from '@/components/legal/ContactInfo';

const CancellationsRefunds = () => {
  return (
    <Layout noContainer>
      <div className="min-h-screen bg-gradient-peaceful py-4">
      <LegalHeader title="Cancellations and Refunds" />

      <LegalLayout lastUpdated="August 2025">
        <LegalSection title="1. Subscription Cancellation">
          <p>
            You can cancel your subscription at any time through your account settings or by contacting our support team.
          </p>
          <h3 className="font-semibold text-slate-800">How to Cancel:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Go to <strong>Settings → Subscription</strong> in the app</li>
            <li>Click <strong>“Cancel Subscription”</strong></li>
            <li>Follow the confirmation steps</li>
            <li>Or email us at <strong>support@yogi.care</strong></li>
          </ul>
          <p>
            <strong>Note:</strong> Cancellation takes effect at the end of your current billing period. You will continue to have access to premium features until then (unless a refund is issued—see below).
          </p>
        </LegalSection>

        <LegalSection title="2. Refund Policy">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
            <p className="font-semibold text-emerald-900 mb-2">
              ✅ 7-Day, No-Questions-Asked Refund
            </p>
            <p className="text-emerald-800">
              You may request a <strong>full refund within 7 days</strong> of the initial purchase or any renewal charge—no explanation needed.
            </p>
          </div>

          <h3 className="font-semibold text-slate-800 mt-4">How to request a refund (email only):</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email <strong>support@yogi.care</strong> within 7 days of the charge.</li>
            <li>Include: your account email, transaction ID/receipt, and the word <strong>“Refund”</strong> in the subject.</li>
          </ul>

          <h3 className="font-semibold text-slate-800 mt-4">Important details:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Refunds are issued to the <strong>original payment method</strong>.</li>
            <li>Once processed, <strong>premium access ends immediately</strong> for the refunded period.</li>
            <li>Allow <strong>5–10 business days</strong> for funds to appear.</li>
            <li>
              If you purchased via Apple App Store or Google Play, email us at <strong>support@yogi.care</strong> and
              we’ll guide you through the store’s refund flow (final approval processed by the store).
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="3. Refunds After 7 Days (Exceptions Only)">
          <p>
            After the 7-day window, refunds are generally not available except in the following cases:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Duplicate charges due to processing errors (with verification)</li>
            <li>Unauthorized charges (subject to fraud investigation and verification)</li>
            <li>Where required by applicable consumer protection laws</li>
          </ul>
          <p className="mt-4">
            <strong>Deadline:</strong> Exception claims should be reported within <strong>48 hours</strong> of the charge to <strong>support@yogi.care</strong>.
          </p>
        </LegalSection>

        <LegalSection title="4. Dispute & Support Process">
          <p>
            For any refunds or billing disputes, contact <strong>support@yogi.care</strong>. For 7-day refunds, no justification is required.
          </p>
          <ol className="list-decimal pl-6 space-y-2 mt-2">
            <li>Email <strong>support@yogi.care</strong> with your account and transaction details</li>
            <li>Attach any relevant documentation</li>
            <li>Allow up to <strong>5 business days</strong> for investigation/processing</li>
          </ol>
        </LegalSection>

        <LegalSection title="5. Auto-Renewal and Billing">
          <p>Subscriptions automatically renew unless cancelled before the next billing cycle.</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You will be notified 7 days before renewal (where supported)</li>
            <li>Cancel anytime to avoid the next charge</li>
            <li>
              If a renewal is charged, you have a <strong>7-day window</strong> to request a full refund via <strong>support@yogi.care</strong>
            </li>
            <li>No refunds for mid-cycle cancellations <strong>after</strong> the 7-day window</li>
          </ul>
        </LegalSection>

        <LegalSection title="6. Free Trial Cancellations">
          <p>If you're on a free trial:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Cancel anytime during the trial to avoid charges</li>
            <li>You'll retain access until the trial ends</li>
            <li>
              If the trial converts to a paid subscription, the <strong>7-day refund window</strong> starts from the charge date—submit via <strong>support@yogi.care</strong>
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="7. Payment Method Changes">
          <p>If your payment method fails or expires:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Update your payment information promptly</li>
            <li>Service may be suspended for non-payment</li>
            <li>Account reactivation upon successful payment</li>
            <li>
              Charges collected after an update/renewal remain eligible for the <strong>7-day refund window</strong> via <strong>support@yogi.care</strong>
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="8. Contact Information">
          <p>For cancellations, refunds, or billing questions:</p>
          <ContactInfo
            appName="Yogi Wellness App"
            email="support@yogi.care"
            note="All refund requests must be submitted by email to support@yogi.care."
          />
        </LegalSection>

        <LegalSection title="9. Policy Updates">
          <p>
            This policy may be updated periodically. Significant changes will be communicated via email or app
            notification. Continued use of the service after changes constitutes acceptance of the updated policy.
          </p>
        </LegalSection>
      </LegalLayout>
      </div>
    </Layout>
  );
};

export default CancellationsRefunds;

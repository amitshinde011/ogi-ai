
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CancellationsRefunds = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-white/20"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Cancellations and Refunds</h1>
        </div>

        {/* Content */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 space-y-6">
            <div className="text-sm text-slate-600 mb-4">
              Last updated: December 2024
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">1. Subscription Cancellation</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  You can cancel your subscription at any time through your account settings or by contacting our support team.
                </p>
                <h3 className="font-semibold text-slate-800">How to Cancel:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Go to Settings → Subscription in the app</li>
                  <li>Click "Cancel Subscription"</li>
                  <li>Follow the confirmation steps</li>
                  <li>Or email us at support@yogiai.in</li>
                </ul>
                <p>
                  <strong>Important:</strong> Cancellation will take effect at the end of your current billing period. You will continue to have access to premium features until then.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">2. Refund Policy</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  We want you to be satisfied with our service. Our refund policy is designed to be fair and transparent.
                </p>
                
                <h3 className="font-semibold text-slate-800">7-Day Money-Back Guarantee</h3>
                <p>
                  New subscribers are eligible for a full refund within 7 days of their initial purchase, provided:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>The request is made within 7 days of the original purchase</li>
                  <li>The account has not been used excessively (determined at our discretion)</li>
                  <li>No violation of our terms of service has occurred</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">3. Refund Eligibility</h2>
              <div className="text-slate-700 space-y-3">
                <p>Refunds may be considered in the following situations:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Technical issues preventing app usage that cannot be resolved</li>
                  <li>Duplicate charges due to processing errors</li>
                  <li>Unauthorized charges (with proper verification)</li>
                  <li>Service unavailability for extended periods</li>
                </ul>
                
                <h3 className="font-semibold text-slate-800 mt-4">Non-Refundable Situations:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Change of mind after the 7-day period</li>
                  <li>Failure to use the service</li>
                  <li>Account termination due to policy violations</li>
                  <li>Partial months of subscription (pro-rated cancellations)</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">4. Refund Process</h2>
              <div className="text-slate-700 space-y-3">
                <p>To request a refund:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Contact our support team at support@yogiai.in</li>
                  <li>Include your account details and reason for refund</li>
                  <li>Provide any relevant transaction information</li>
                  <li>Allow 3-5 business days for review</li>
                  <li>Approved refunds are processed within 5-10 business days</li>
                </ol>
                
                <p className="mt-4">
                  <strong>Processing Time:</strong> Refunds are typically processed within 5-10 business days after approval. The time it takes to appear in your account depends on your payment method and financial institution.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">5. Auto-Renewal and Billing</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  Subscriptions automatically renew unless cancelled before the next billing cycle. 
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You will be notified 7 days before renewal</li>
                  <li>Cancel anytime to avoid the next charge</li>
                  <li>Changes take effect at the end of the current period</li>
                  <li>No partial refunds for mid-cycle cancellations</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">6. Free Trial Cancellations</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  If you're on a free trial:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Cancel anytime during the trial period to avoid charges</li>
                  <li>You'll retain access until the trial ends</li>
                  <li>No charges will be applied if cancelled before trial expiry</li>
                  <li>Failure to cancel will result in automatic subscription activation</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">7. Dispute Resolution</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  If you have a billing dispute or refund concern:
                </p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Contact our support team first</li>
                  <li>Provide detailed information about the issue</li>
                  <li>Allow us 48 hours to investigate and respond</li>
                  <li>We'll work with you to resolve the matter fairly</li>
                </ol>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">8. Payment Method Changes</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  If your payment method fails or expires:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Update your payment information promptly</li>
                  <li>Service may be suspended for non-payment</li>
                  <li>Account reactivation upon successful payment</li>
                  <li>No refunds for service interruptions due to payment failures</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">9. Contact Information</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  For cancellations, refunds, or billing questions:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="font-medium">Yogi Wellness App Support</p>
                  <p>Email: support@yogiai.in</p>
                  <p>Response Time: Within 24 hours</p>
                  <p>Business Hours: Monday-Friday, 9 AM - 6 PM IST</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">10. Policy Updates</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  This policy may be updated periodically. Significant changes will be communicated via email or app notification. Continued use of the service after changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CancellationsRefunds;

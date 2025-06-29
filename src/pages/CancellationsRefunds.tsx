
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
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">3. Exceptions to Non-Refund Policy</h2>
              <div className="text-slate-700 space-y-3">
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
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">4. Dispute Process</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  If you believe you have been charged in error:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Contact our support team immediately at support@yogiai.in</li>
                  <li>Include your account details and transaction information</li>
                  <li>Provide clear documentation of the claimed error</li>
                  <li>Allow up to 5 business days for investigation</li>
                </ol>
                
                <p className="mt-4">
                  <strong>Important:</strong> Disputes are only considered for technical errors, not for dissatisfaction with the service or change of mind.
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
                  <li>No refunds for mid-cycle cancellations</li>
                </ul>
                
                <p className="mt-4 font-semibold text-slate-800">
                  Remember: It is your responsibility to cancel before the renewal date if you do not wish to continue your subscription.
                </p>
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
                  <li><strong>Once the trial converts to a paid subscription, the non-refund policy applies</strong></li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">7. Payment Method Changes</h2>
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
              <h2 className="text-xl font-semibold text-slate-900">8. Contact Information</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  For cancellations or billing questions:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="font-medium">Yogi Wellness App Support</p>
                  <p>Email: support@yogiai.in</p>
                  <p>Response Time: Within 24 hours</p>
                  <p>Business Hours: Monday-Friday, 9 AM - 6 PM IST</p>
                </div>
                
                <p className="mt-4 text-sm text-slate-600">
                  <strong>Note:</strong> Support can help with cancellations and technical issues, but cannot provide refunds per our non-refund policy.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">9. Policy Updates</h2>
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

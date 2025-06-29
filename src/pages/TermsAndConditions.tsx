
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const TermsAndConditions = () => {
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
          <h1 className="text-2xl font-bold text-slate-900">Terms and Conditions</h1>
        </div>

        {/* Content */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 space-y-6">
            <div className="text-sm text-slate-600 mb-4">
              Last updated: December 2024
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">1. Acceptance of Terms</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  By accessing and using the Yogi Wellness App ("the App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">2. Description of Service</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  Yogi Wellness App is a comprehensive wellness platform that provides:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Personalized wellness programs and recommendations</li>
                  <li>Meal tracking and nutrition guidance</li>
                  <li>Yoga and meditation sessions</li>
                  <li>Community features for social interaction</li>
                  <li>Progress tracking and analytics</li>
                  <li>Recipe suggestions and meal planning</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">3. User Accounts</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  To access certain features of the App, you must create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">4. User Conduct</h2>
              <div className="text-slate-700 space-y-3">
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use the App for any unlawful purpose</li>
                  <li>Post offensive, harmful, or inappropriate content</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Attempt to gain unauthorized access to the App</li>
                  <li>Share your account with others</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">5. Health and Medical Disclaimers</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  <strong>Important:</strong> The information provided by the App is for educational and informational purposes only and is not intended as medical advice. Always consult with qualified healthcare professionals before making any health-related decisions.
                </p>
                <p>
                  You acknowledge that:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>The App does not provide medical diagnosis or treatment</li>
                  <li>You use the wellness recommendations at your own risk</li>
                  <li>Results may vary and are not guaranteed</li>
                  <li>You should consult a doctor before starting any new wellness program</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">6. Subscription and Payments</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  Premium features require a paid subscription. By purchasing a subscription:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You agree to pay all fees associated with your subscription</li>
                  <li>Payments are processed securely through third-party providers</li>
                  <li>Subscriptions auto-renew unless cancelled</li>
                  <li>Refunds are subject to our cancellation policy</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">7. Intellectual Property</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  All content, features, and functionality of the App are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibent text-slate-900">8. Privacy</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">9. Limitation of Liability</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the App.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">10. Termination</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  We reserve the right to terminate or suspend your account at any time for violation of these terms or for any other reason we deem necessary.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">11. Changes to Terms</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of significant changes via email or app notification.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">12. Contact Information</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="font-medium">Yogi Wellness App</p>
                  <p>Email: support@yogiai.in</p>
                  <p>Address: [Your Company Address]</p>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;

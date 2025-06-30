
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPolicy = () => {
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
          <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
        </div>

        {/* Content */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 space-y-6">
            <div className="text-sm text-slate-600 mb-4">
              Last updated: December 2024
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">1. Information We Collect</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  We collect information you provide directly to us, such as when you create an account, 
                  complete your profile, upload meal photos, or interact with our community features.
                </p>
                <p>This may include:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Personal information (name, email address, age, gender)</li>
                  <li>Health and wellness data (weight, height, dietary preferences, health conditions)</li>
                  <li>Photos and content you share</li>
                  <li>Community interactions and messages</li>
                  <li>Usage data and app interactions</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">2. How We Use Your Information</h2>
              <div className="text-slate-700 space-y-3">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide and improve our wellness services</li>
                  <li>Personalize your experience and recommendations</li>
                  <li>Track your progress and provide insights</li>
                  <li>Enable community features and social interactions</li>
                  <li>Send you notifications and updates</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">3. Information Sharing</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  without your consent, except as described in this policy.
                </p>
                <p>We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Service providers who assist us in operating our app</li>
                  <li>Healthcare professionals (only with your explicit consent)</li>
                  <li>Other users (only information you choose to make public)</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">4. Data Security</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  We implement appropriate security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction. However, no method of 
                  transmission over the internet is 100% secure.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">5. Your Rights</h2>
              <div className="text-slate-700 space-y-3">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Control your privacy settings</li>
                  <li>Opt-out of certain communications</li>
                  <li>Request a copy of your data</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">6. Health Information</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  Your health and wellness data is particularly sensitive. We take extra precautions 
                  to protect this information and will never share it without your explicit consent. 
                  This data is used solely to provide you with personalized wellness recommendations.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">7. Children's Privacy</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  Our service is not intended for children under 13 years of age. We do not knowingly 
                  collect personal information from children under 13.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">8. Changes to This Policy</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any 
                  significant changes by posting the new policy on this page and updating the 
                  "Last updated" date.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">9. Contact Us</h2>
              <div className="text-slate-700 space-y-3">
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="font-medium">Yogi Wellness App</p>
                  <p>Email: privacy@yogi-app.com</p>
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

export default PrivacyPolicy;

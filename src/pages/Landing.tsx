import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Star, Users, Globe, ShieldCheck, Check, Heart, Brain, Leaf, Zap, Clock, Target, Award, Gift, HelpCircle, Sparkles } from 'lucide-react';
import TestimonialsCarousel from '@/components/auth/TestimonialsCarousel';
import { PricingDisplay } from '@/components/PricingDisplay';
import { useLocationDetection } from '@/hooks/useLocationDetection';
import { useSubscriptionData } from '@/hooks/useSubscriptionData';
import { IMAGES } from '@/constants/images';
import Footer from '@/components/Footer';

const Landing = () => {
  const navigate = useNavigate();
  const { isIndiaUser, userLocation } = useLocationDetection();
  const { programs, loading } = useSubscriptionData();

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const getTransformationImage = (durationDays: number) => {
    // This function remains the same
    switch (durationDays) {
      case 21:
        return '/lovable-uploads/21days.webp';
      case 49:
        return '/lovable-uploads/49days.webp';
      case 108:
        return '/lovable-uploads/108days.webp';
      default:
        return null;
    }
  };
  
  // NEW: Data for "How It Works" Section
  const howItWorksSteps = [
    {
      step: 1,
      title: "Choose Your Path",
      description: "Select the transformation program that aligns with your wellness goals.",
      icon: Target
    },
    {
      step: 2,
      title: "Follow Daily Guidance",
      description: "Commit to simple, 20-minute daily routines of yoga, meditation, and nutrition.",
      icon: Clock
    },
    {
      step: 3,
      title: "Witness Your Transformation",
      description: "Track your progress and feel the profound changes in your energy, clarity, and peace.",
      icon: Award
    }
  ];

  // NEW: Data for FAQ Section
  const faqData = [
    {
      question: "Is this program suitable for beginners?",
      answer: "Absolutely! Our programs are designed to be accessible for all levels, from complete beginners to experienced practitioners. We provide clear, step-by-step guidance."
    },
    {
      question: "What if I'm too busy? How much time does it take?",
      answer: "We designed this for busy lifestyles. The core daily practice takes just 20 minutes. That's less than 2% of your day to invest in your long-term health and happiness."
    },
    {
      question: "What kind of results can I expect?",
      answer: "While results vary, most members report reduced stress, improved energy, better sleep, and enhanced mental clarity within the first 21 days. The longer programs yield deeper, more lasting transformations."
    },
    {
      question: "What is your refund policy?",
      answer: "We offer a 14-day, no-questions-asked money-back guarantee. If you're not satisfied with the program for any reason, contact us within 14 days of purchase for a full refund."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* =======================================================================
          HERO SECTION (Conversion-Optimized)
      ======================================================================= */}
      <section className="relative py-12 sm:py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-peaceful opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="mx-auto bg-primary/10 text-primary border-primary/20">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 10,000+ happy members in 50+ countries
            </Badge>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Escape The <span className="text-primary">Burnout</span>.
                <br />
                Reclaim Your <span className="text-primary">Energy</span>.
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Unlock lasting wellness with our science-backed yogic system. Just 20 minutes a day to reduce stress, boost vitality, and find your inner peace.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <PricingDisplay isIndiaUser={isIndiaUser} userLocation={userLocation} />
            </div>

            <div className="flex flex-col gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={handleSignup}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Start My Transformation
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              {/* NEW: Risk Reversal Guarantee */}
              <div className="flex items-center text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 mr-2 text-green-600" />
                100% Secure Checkout & 14-Day Money-Back Guarantee
              </div>
            </div>
            
             <div className="flex flex-wrap justify-center items-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">Lives Transformed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Countries Reached</div>
              </div>
               <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">4.8/5</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* =======================================================================
          PROBLEM / AGITATION SECTION (NEW)
      ======================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-card/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
             Tired of Feeling Stressed, Drained, and Disconnected?
           </h2>
           <p className="text-lg text-muted-foreground mb-12">
             In today's fast-paced world, it's easy to lose balance. If any of this sounds familiar, you're in the right place.
           </p>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
             <div className="bg-background p-4 rounded-lg shadow-sm"><Check className="text-primary inline-block mr-2"/>Constant fatigue</div>
             <div className="bg-background p-4 rounded-lg shadow-sm"><Check className="text-primary inline-block mr-2"/>Anxiety & stress</div>
             <div className="bg-background p-4 rounded-lg shadow-sm"><Check className="text-primary inline-block mr-2"/>Poor sleep</div>
             <div className="bg-background p-4 rounded-lg shadow-sm"><Check className="text-primary inline-block mr-2"/>Lack of focus</div>
           </div>
        </div>
      </section>

      {/* =======================================================================
          SOCIAL PROOF SECTION (Existing, but with stronger heading)
      ======================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Don't Just Take Our Word For It
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands who have already transformed their lives through our proven system.
            </p>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* =======================================================================
          HOW IT WORKS SECTION (NEW)
      ======================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Your Journey to Wellness in <span className="text-primary">3 Simple Steps</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We make transformation accessible and achievable for everyone.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {howItWorksSteps.map((step) => (
              <div key={step.step} className="flex flex-col items-center">
                <div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================================================
          PROGRAM OVERVIEW SECTION (Enhanced)
      ======================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Choose Your <span className="text-primary">Transformation Program</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Each program is a complete, guided journey to holistic well-being. Start with the one that feels right for you.
            </p>
          </div>
          
          {/* Risk Reversal Guarantee Box (NEW) */}
          <div className="max-w-2xl mx-auto mb-12 bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg flex items-center gap-4">
              <ShieldCheck className="w-12 h-12 text-green-600 flex-shrink-0" />
              <div>
                  <h3 className="font-bold text-lg">Your Satisfaction is Guaranteed</h3>
                  <p className="text-sm">Try any program risk-free. If you don't feel a positive change within 14 days, we'll give you a full refund. No hoops, no hassle.</p>
              </div>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading programs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {programs.map((program) => {
                const isPopular = program.duration_days === 49;
                const transformationImage = getTransformationImage(program.duration_days);
                
                return (
                  <Card 
                    key={program.id} 
                    className={`flex flex-col border-0 shadow-lg bg-background hover:shadow-2xl transition-all duration-300 overflow-hidden relative ${
                      isPopular ? 'border-2 border-primary transform scale-105' : 'hover:scale-105'
                    }`}
                  >
                  {isPopular && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-semibold flex items-center justify-center gap-2 text-sm whitespace-nowrap shadow-lg">
                        <Star className="w-4 h-4 fill-current" />
                        Best Value
                      </Badge>
                    </div>
                  )}
                    <div className="p-6 pt-12">
                      {transformationImage && (
                        <div className="mb-4">
                          <img 
                            src={transformationImage} 
                            alt={`${program.name} transformation`} 
                            className="w-full aspect-video object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-foreground mb-2">{program.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4 h-10">{program.description}</p>
                        
                        <div className="text-3xl font-bold text-primary mb-2">
                          {isIndiaUser ? `₹${program.price_inr}` : `$${program.price}`}
                        </div>
                        <div className="text-sm text-muted-foreground">{program.duration_days} Day Guided Program</div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 flex-grow flex flex-col justify-between">
                      <div className="space-y-4 mb-6">
                          <h4 className="font-semibold text-foreground mb-3 text-center">What you'll master:</h4>
                           <ul className="text-sm text-muted-foreground space-y-2">
                              {program.features.slice(0, 4).map((feature, idx) => (
                                <li key={idx} className="flex items-start">
                                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                           </ul>
                      </div>
                      <Button
                        onClick={handleSignup}
                        size="lg"
                        className={`w-full font-semibold py-3 ${
                          isPopular 
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                            : 'bg-primary/80 hover:bg-primary/90 text-primary-foreground'
                        }`}
                      >
                        Begin {program.duration_days}-Day Journey
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =======================================================================
          LIMITED TIME OFFER / URGENCY (NEW)
      ======================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Gift className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Get a <span className="text-primary">Free Bonus</span> When You Join Today!
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sign up now and receive our exclusive eBook, "The Yogi's Guide to Mindful Eating" (a $29 value), absolutely free. Kickstart your nutrition journey alongside your practice.
          </p>
          <Button
            size="lg"
            onClick={handleSignup}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Claim My Free Bonus Now
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </div>
      </section>

      {/* =======================================================================
          FAQ SECTION (NEW)
      ======================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
             <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              We have answers. If you have other questions, feel free to contact us.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* =======================================================================
          FINAL CTA SECTION (Enhanced)
      ======================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Your Transformation Awaits.
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            You are one decision away from a more vibrant, peaceful, and energized life. Why wait another day to feel your best?
          </p>
          
          <div className="flex flex-col gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={handleSignup}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Start My Journey Today
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              <div className="flex items-center text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 mr-2 text-green-600" />
                Risk-Free with our 14-Day Money-Back Guarantee
              </div>
          </div>
        </div>
      </section>

      {/* Footer remains the same, but you could consider using the imported Footer component */}
      <Footer />
    </div>
  );
};

export default Landing;

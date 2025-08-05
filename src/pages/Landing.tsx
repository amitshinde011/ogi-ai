import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Star, Users, Globe, ShieldCheck, Check, Heart, Brain, Leaf, Zap, Clock, Target, Award, Gift, HelpCircle, Sparkles, Play, TrendingUp, MessageCircle, Timer, ChefHat } from 'lucide-react';
import TestimonialsCarousel from '@/components/auth/TestimonialsCarousel';
import { PricingDisplay } from '@/components/PricingDisplay';
import { useLocationDetection } from '@/hooks/useLocationDetection';
import { useSubscriptionData } from '@/hooks/useSubscriptionData';
import { usePricingConfig } from '@/hooks/usePricingConfig';
import { calculatePricing, formatCurrency } from '@/utils/pricingUtils';
import { IMAGES } from '@/constants/images';

const Landing = () => {
  const navigate = useNavigate();
  const { isIndiaUser, userLocation } = useLocationDetection();
  const { programs, loading } = useSubscriptionData();
  const pricingConfig = usePricingConfig();

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const getTransformationImage = (durationDays: number) => {
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
      question: "What support do I get as a member?",
      answer: "You get lifetime access to our exclusive community, extensive healthy recipe library, guided meditation sessions, comprehensive yoga practices, and ongoing support from fellow members on their wellness journey."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* =======================================================================
          URGENT ANNOUNCEMENT BANNER
      ======================================================================= */}
      <div className="bg-primary text-primary-foreground text-center py-3 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 text-sm sm:text-base">
            <Timer className="w-4 h-4 animate-pulse" />
            <span className="font-semibold">LIMITED TIME:</span>
            <span>Get {pricingConfig.discountPercentage}% OFF + Free Community Access - Ends Soon!</span>
            <Timer className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>

      {/* =======================================================================
          HERO SECTION (Conversion-Optimized)
      ======================================================================= */}
      <section className="relative py-12 sm:py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="mx-auto bg-primary/10 text-primary border-primary/20 animate-pulse">
              <TrendingUp className="w-4 h-4 mr-2" />
              Join 10,000+ Members Transforming Their Lives Daily
            </Badge>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Transform Your Life in Just
                <br />
                <span className="text-primary bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">20 Minutes a Day</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Break free from stress, boost your energy, and discover lasting peace with our proven yogic wellness system. 
                <span className="font-semibold text-foreground"> No gym required. No complicated routines.</span>
              </p>
            </div>

            {/* Social Proof Numbers - Enhanced */}
            <div className="flex flex-wrap justify-center items-center gap-8 py-8 bg-card/30 rounded-2xl mx-auto max-w-2xl">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  10,000+
                </div>
                <div className="text-sm text-muted-foreground">Lives Transformed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center">
                  <Globe className="w-6 h-6 mr-2" />
                  50+
                </div>
                <div className="text-sm text-muted-foreground">Countries Reached</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center">
                  <Star className="w-6 h-6 mr-2 fill-current" />
                  4.8/5
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>

            {/* Enhanced Pricing Display */}
            <div className="max-w-md mx-auto bg-card/50 rounded-2xl p-6 border border-primary/20">
              <PricingDisplay isIndiaUser={isIndiaUser} userLocation={userLocation} />
              <div className="text-center mt-4">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Check className="w-3 h-3 mr-1" />
                  {pricingConfig.discountPercentage}% OFF Limited Time
                </Badge>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={handleSignup}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 animate-pulse"
              >
                <Play className="w-6 h-6 mr-2" />
                Start My Transformation NOW
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-green-600" />
                  Instant Access • Lifetime Community Support
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Join our supportive community of wellness warriors
                </div>
              </div>
              
              <Button
                variant="ghost"
                onClick={handleLogin}
                className="text-muted-foreground hover:text-foreground"
              >
                Already a member? <span className="underline ml-1">Sign in here</span>
              </Button>
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
          SOCIAL PROOF SECTION
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
          WELLNESS IMAGES SECTION 
      ======================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Experience the Journey</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Real Transformations, <span className="text-primary">Real Results</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              See how our community members have transformed their bodies, minds, and lives through our proven wellness system.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {IMAGES.WELLNESS_CAROUSEL.map((image, index) => (
              <div key={index} className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <img 
                  src={image} 
                  alt={`Wellness transformation ${index + 1}`}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-sm font-semibold">Day {((index * 7) + 1)}</div>
                    <div className="text-xs opacity-90">Progress Update</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={handleSignup}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
            >
              Start Your Transformation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* =======================================================================
          HOW IT WORKS SECTION (Enhanced)
      ======================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Your Journey to Wellness in <span className="text-primary">3 Simple Steps</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We make transformation accessible and achievable for everyone, regardless of experience level.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={step.step} className="relative">
                {/* Connection Line */}
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-primary/20 z-0" 
                       style={{ width: 'calc(100% - 80px)', left: '60px' }}></div>
                )}
                
                <div className="relative z-10 flex flex-col items-center text-center bg-background p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 border-4 border-primary/20">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================================================
          PROGRAM OVERVIEW SECTION (REVERTED TO ORIGINAL, FUNCTIONAL CODE)
      ======================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Discover Your Path</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Personalized <span className="text-primary">Wellness Programs</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Transform your life through ancient wisdom with modern web-based tools. 
              Start with our foundational programs designed for today's busy lifestyle.
            </p>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading programs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {programs.map((program, index) => {
                const isPopular = program.duration_days === 49;
                const transformationImage = getTransformationImage(program.duration_days);
                
                return (
                  <Card 
                    key={program.id} 
                    className={`border-0 shadow-lg bg-background hover:shadow-xl transition-all duration-300 overflow-hidden relative ${
                      isPopular ? 'border-2 border-primary' : ''
                    }`}
                  >
                  {isPopular && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1 rounded-full font-semibold flex items-center justify-center gap-2 text-sm whitespace-nowrap shadow-md">
                        <Star className="w-4 h-4 fill-current" />
                        Most Popular
                        <Star className="w-4 h-4 fill-current" />
                      </Badge>
                    </div>
                  )}
                    
                    <div className={`bg-gradient-to-br p-6 ${
                      program.duration_days === 21 ? 'from-green-50 to-green-100' :
                      program.duration_days === 49 ? 'from-blue-50 to-blue-100' :
                      'from-purple-50 to-purple-100'
                    }`}>
                      {transformationImage && (
                        <div className="mb-4">
                          <img 
                            src={transformationImage} 
                            alt={`${program.name} transformation`} 
                            className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-foreground mb-2">{program.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{program.description}</p>
                        
                        {/* Pricing with Discount Display */}
                        <div className="space-y-2">
                          {pricingConfig.discountPercentage > 0 && pricingConfig.isSpecialOccasion && (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-200 mb-2">
                              🎉 {pricingConfig.occasionName} - {pricingConfig.discountPercentage}% OFF!
                            </Badge>
                          )}
                          
                          {(() => {
                            const originalPrice = isIndiaUser ? program.price_inr : program.price;
                            const currency = isIndiaUser ? 'INR' : 'USD';
                            const pricing = calculatePricing(
                              originalPrice,
                              pricingConfig.discountPercentage,
                              0, // No tax on landing page for simplicity
                              0  // No coupon on landing page
                            );
                            
                            return (
                              <div>
                                {pricingConfig.discountPercentage > 0 ? (
                                  <div className="flex items-center justify-center gap-2 mb-1">
                                    <span className="text-lg line-through text-muted-foreground">
                                      {formatCurrency(originalPrice, currency)}
                                    </span>
                                    <span className="text-2xl font-bold text-primary">
                                      {formatCurrency(pricing.discountedPrice, currency)}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-2xl font-bold text-primary">
                                    {formatCurrency(originalPrice, currency)}
                                  </div>
                                )}
                                {pricingConfig.discountPercentage > 0 && (
                                  <div className="text-xs text-green-600 font-medium">
                                    Save {formatCurrency(pricing.discountAmount, currency)} ({pricingConfig.discountPercentage}% OFF)
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          
                          <div className="text-sm text-muted-foreground">{program.duration_days} days program</div>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-foreground mb-3 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            What's Included
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-2">
                            {program.features.map((feature, idx) => {
                              const highlightedFeature = feature
                                .replace(/(\d+[\s-]*(?:Day|Days|Minute|Minutes|Hour|Hours))/gi, '<strong>$1</strong>')
                                .replace(/(Daily|Morning|Evening|Weekly|Monthly|Guided|Personal|Complete|Ultimate|Premium|Advanced|Basic|Fundamental)/gi, '<strong>$1</strong>')
                                .replace(/(Yoga|Meditation|Diet|Recipes|Routine|Plan|Tracker|Community)/gi, '<strong>$1</strong>')
                                .replace(/(Foundational|Yogic|Wisdom|Level|Intermediate|Yogic|Science|2|1|3|Mastery)/gi, '<strong>$1</strong>')
                                .replace(/(Vibrant|Motivating|Holistic|Satvic|Protocol|Prescriptive|Lifestyle)/gi, '<strong>$1</strong>');
                              return (
                                <li key={idx} className="flex items-start">
                                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <span dangerouslySetInnerHTML={{ __html: highlightedFeature }} />
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-foreground mb-3 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Benefits You'll Get
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-2">
                            {program.benefits.map((benefit, idx) => {
                              const keywords = [
                                'Mental', 'Physical', 'Emotional', 'Spiritual', 'Health', 'Wellness', 'Energy', 'Strength',
                                'Flexibility', 'Balance', 'Focus', 'Clarity', 'Peace', 'Calm', 'Confidence', 'Vitality',
                                'Recovery', 'Improved', 'Enhanced', 'Increased', 'Reduced', 'Better', 'Optimal', 'Maximum',
                                'Complete', 'Total', 'Deep', 'Profound', 'Significant', 'dramatically', 'significantly',
                                'substantially', 'Calmness', 'Restorative', 'Sleep', 'Sharpened', 'Awakened', 'Vibrant',
                                'Active', 'Body', 'Initial', 'Hormonal', 'Harmony', 'Bloating', 'Digestion', 'Measurable',
                                'Leap', 'Rooted', 'Optimized', 'Cycles', 'Cognitive', 'Function', 'Weight', 'Correction',
                                'regular', 'cycles', 'PMS', 'calmer', 'nervous', 'system', 'lowering', 'cortisol', 'Alleviation',
                                'Chronic', 'Aches', 'Exuberant', 'Joyful', 'Being', 'Embodying', 'True', 'Confident', 'Metabolic',
                                'Healing', 'Mastery', 'Over', 'Form', 'Recomposition', 'Superconscious', 'Intuition', 'Peak',
                                'Performance', 'Unshakeable', 'Inner', 'Bliss', 'Energetic', 'Realignment'
                              ];
                              const highlightRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
                              const highlightedBenefit = benefit.replace(highlightRegex, (match) => {
                                return `<strong>${match}</strong>`;
                              });
                              return (
                                <li key={idx} className="flex items-start">
                                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <span dangerouslySetInnerHTML={{ __html: highlightedBenefit }} />
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        
                        <Button 
                          onClick={handleSignup}
                          className={`w-full font-semibold py-2 px-4 rounded-lg ${
                            isPopular 
                              ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                              : program.duration_days === 21
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          Get Started
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =======================================================================
          EXCLUSIVE MEMBER BENEFITS SECTION
      ======================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Join Our <span className="text-primary">Exclusive Community</span> Today!
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get instant access to our supportive community, nourishing and tasty recipes, guided meditation sessions, and simple and comprehensive yoga practices to transform your wellness journey.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-background p-6 rounded-xl shadow-lg">
              <ChefHat className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Healthy Recipes</h3>
              <p className="text-sm text-muted-foreground">Access to nutritious, easy-to-follow and tasty recipes for every meal</p>
            </div>
            <div className="bg-background p-6 rounded-xl shadow-lg">
              <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Guided Meditation</h3>
              <p className="text-sm text-muted-foreground">Fuel your day with empowering, energy-boosting meditation.</p>
            </div>
            <div className="bg-background p-6 rounded-xl shadow-lg">
              <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Guided Yoga</h3>
              <p className="text-sm text-muted-foreground">Simple and step-by-step yoga practices for all levels and abilities</p>
            </div>
          </div>
          <Button
            size="lg"
            onClick={handleSignup}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Join Our Community
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
                Become the best version of yourself
              </div>
          </div>
        </div>
      </section>

      {/* =======================================================================
          FOOTER SECTION (REVERTED TO ORIGINAL)
      ======================================================================= */}
      <footer className="bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <img 
                src={IMAGES.LOGO_MAIN} 
                alt="Yogi Logo" 
                className="h-8 w-auto"
              />
              <span className="text-slate-400 text-sm">Copyright © 2025 Yogi Care

All rights reserved. No part of this application may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of Yogi Care, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.

Yogi™ is a trademark of Yogi Care.</span>
            </div>

            {/* Legal Links - Horizontal Layout */}
            <div className="flex flex-wrap justify-center md:justify-end items-center space-x-6 text-sm text-slate-400">
              <Link to="/privacy-policy" className="hover:text-slate-600 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-and-conditions" className="hover:text-slate-600 transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/cancellations-refunds" className="hover:text-slate-600 transition-colors">
                Cancellations & Refunds
              </Link>
              <Link to="/contact" className="hover:text-slate-600 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

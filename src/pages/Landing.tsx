import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Users, Globe, Shield, Check, Heart, Brain, Leaf, Zap, Clock, Target, Award } from 'lucide-react';
import TestimonialsCarousel from '@/components/auth/TestimonialsCarousel';
import WellnessCarousel from '@/components/auth/WellnessCarousel';
import { PricingDisplay } from '@/components/PricingDisplay';
import { useLocationDetection } from '@/hooks/useLocationDetection';
import { useSubscriptionData } from '@/hooks/useSubscriptionData';
import { IMAGES } from '@/constants/images';
import Footer from '@/components/Footer';

const Landing = () => {
  const navigate = useNavigate();
  const { isIndiaUser, userLocation } = useLocationDetection();
  const { programs, loading } = useSubscriptionData();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
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

  const features = [
    {
      icon: Heart,
      title: "Daily 20-Minute Routines",
      description: "Practical wellness that fits your busy lifestyle"
    },
    {
      icon: Brain,
      title: "Guided Meditations",
      description: "Dhatu meditation with expert audio guidance"
    },
    {
      icon: Leaf,
      title: "Ayurvedic Nutrition",
      description: "Satvic recipes for clean, energizing meals"
    },
    {
      icon: Zap,
      title: "Progress Tracking",
      description: "Monitor your transformation with detailed analytics"
    },
    {
      icon: Users,
      title: "Global Community",
      description: "Connect with thousands in your wellness journey"
    },
    {
      icon: Star,
      title: "Expert Guidance",
      description: "Authentic yogic wisdom from qualified teachers"
    }
  ];

  const benefits = [
    "Reduced stress and anxiety levels",
    "Improved energy and vitality",
    "Better sleep quality",
    "Enhanced mental clarity",
    "Stronger immune system",
    "Deeper spiritual connection",
    "Sustainable weight management",
    "Increased life satisfaction"
  ];

  const stats = [
    { number: "10,000+", label: "Lives Transformed" },
    { number: "50+", label: "Countries Reached" },
    { number: "94%", label: "Success Rate" },
    { number: "4.8/5", label: "User Rating" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-peaceful opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            {/* Trust Badge */}
            <Badge variant="secondary" className="mx-auto bg-primary/10 text-primary border-primary/20">
              <Star className="w-4 h-4 mr-2" />
              Trusted by thousands worldwide
            </Badge>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Transform Your <span className="text-primary">Life</span>
                <br />
                Through <span className="text-primary">Sacred Science</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Ancient wisdom meets modern results. Start your personalized 
                <span className="font-semibold text-foreground"> transformation journey</span> with 
                science-backed yogic practices that fit your busy lifestyle.
              </p>
            </div>

            {/* Pricing Display */}
            <div className="max-w-md mx-auto">
              <PricingDisplay isIndiaUser={isIndiaUser} userLocation={userLocation} />
            </div>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={handleSignup}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleLogin}
                className="border-primary text-primary hover:bg-primary/10 px-8 py-4 text-lg font-semibold"
              >
                Sign In
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Real People, Real <span className="text-primary">Transformations</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands who have already transformed their lives through our proven system
            </p>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* Wellness Images Grid Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Experience <span className="text-primary">Transformation</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Immerse yourself in the journey of wellness and discover what awaits you
            </p>
          </div>
          
          {/* Individual Wellness Images */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {IMAGES.WELLNESS_CAROUSEL.map((image, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-md">
                <img
                  src={image}
                  alt={`Wellness practice ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Program Overview Section */}
      <section className="py-16 sm:py-20 lg:py-24">
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

          {/* Real Program Cards with Subscription Details */}
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
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground z-10 px-4 py-1 rounded-full font-semibold flex items-center justify-center gap-2 text-sm whitespace-nowrap">
                        <Star className="w-4 h-4 fill-current" />
                        Most Popular
                        <Star className="w-4 h-4 fill-current" />
                      </Badge>
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
                        
                        <div className="text-2xl font-bold text-primary mb-2">
                          {isIndiaUser ? `₹${program.price_inr}` : `$${program.price}`}
                        </div>
                        <div className="text-sm text-muted-foreground">{program.duration_days} days program</div>
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
                              // Highlight important words in features - same as SubscriptionCard
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
                              // Highlight important words in benefits - same as SubscriptionCard
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

      {/* Features Showcase */}
      <section className="py-16 sm:py-20 lg:py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Everything You Need for <span className="text-primary">Complete Wellness</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform combines ancient wisdom with modern technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md bg-background hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Scientific Approach Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">Sacred Science</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Ancient Wisdom, <span className="text-primary">Modern Results</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our methodology combines 5,000-year-old yogic science with modern research. 
                We focus on Prana (life force), Agni (digestive fire), and the three Gunas 
                to create lasting transformation at the cellular level.
              </p>

              <div className="space-y-4">
                {benefits.slice(0, 4).map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3"
                onClick={handleSignup}
              >
                Get Started Today
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {benefits.slice(4).map((benefit, index) => (
                <Card key={index} className="border-0 shadow-sm bg-card/50 p-4">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Join Our Global <span className="text-primary">Sangha</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with like-minded individuals on the same journey. Share progress, 
              get support, and celebrate transformations together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-md bg-background text-center p-8">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Supportive Community</h3>
              <p className="text-muted-foreground">
                Get encouragement and advice from thousands of wellness seekers worldwide
              </p>
            </Card>

            <Card className="border-0 shadow-md bg-background text-center p-8">
              <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Global Connection</h3>
              <p className="text-muted-foreground">
                Share your journey with members from over 50 countries
              </p>
            </Card>

            <Card className="border-0 shadow-md bg-background text-center p-8">
              <Star className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Expert Guidance</h3>
              <p className="text-muted-foreground">
                Access to qualified teachers and mentors for personalized support
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Secure & Transparent
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your privacy and security are our top priority. No hidden fees, transparent pricing, 
              and industry-standard security protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">Secure Payments</h4>
              <p className="text-sm text-muted-foreground">Bank-level encryption</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">No Hidden Fees</h4>
              <p className="text-sm text-muted-foreground">Transparent pricing</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">Expert Support</h4>
              <p className="text-sm text-muted-foreground">24/7 assistance</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">Global Access</h4>
              <p className="text-sm text-muted-foreground">Available worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to Begin Your <span className="text-primary">Transformation?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands who have already discovered the power of sacred science. 
            Your journey to wellness, clarity, and inner peace starts with a single step.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={handleSignup}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleLogin}
              className="border-primary text-primary hover:bg-primary/10 px-8 py-4 text-lg font-semibold"
            >
              Sign In
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Contact us: <a href="mailto:support@yogi.care" className="text-primary hover:underline">support@yogi.care</a>
          </p>
        </div>
      </section>

      {/* Custom Horizontal Footer for Landing Page */}
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
              <span className="text-slate-400 text-sm">© 2025 Yogi</span>
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
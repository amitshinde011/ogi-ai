import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Users, Globe, Shield, Check, Heart, Brain, Leaf, Zap, Clock, Target, Award } from 'lucide-react';
import TestimonialsCarousel from '@/components/auth/TestimonialsCarousel';
import WellnessCarousel from '@/components/auth/WellnessCarousel';
import { PricingDisplay } from '@/components/PricingDisplay';
import { useLocationDetection } from '@/hooks/useLocationDetection';
import Footer from '@/components/Footer';

const Landing = () => {
  const navigate = useNavigate();
  const { isIndiaUser, userLocation } = useLocationDetection();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
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

      {/* Wellness Carousel Section */}
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
          
          <div className="max-w-2xl mx-auto">
            <WellnessCarousel />
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

          {/* Enhanced Program Cards with Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 21-Day Catalyst Program */}
            <Card className="border-0 shadow-lg bg-background hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/80 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-2">21-Day Catalyst</h3>
                  <p className="text-sm text-muted-foreground mb-4">Perfect for beginners seeking energy reset</p>
                  <div className="text-2xl font-bold text-primary mb-2">
                    {isIndiaUser ? '₹999' : '$24.99'}
                  </div>
                  <Badge variant="secondary" className="text-xs">Beginner Friendly</Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">20 minutes daily</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Foundation building</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Energy & vitality boost</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-foreground mb-2">What you'll get:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Daily morning routines</li>
                    <li>• Basic meditation practices</li>
                    <li>• Simple yogic breathing</li>
                    <li>• Community support</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={handleSignup}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* 49-Day Metamorphosis Program */}
            <Card className="border-2 border-primary shadow-lg bg-background hover:shadow-xl transition-all duration-300 overflow-hidden relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground z-10">
                Most Popular
              </Badge>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/80 rounded-full flex items-center justify-center">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-2">49-Day Metamorphosis</h3>
                  <p className="text-sm text-muted-foreground mb-4">Complete body and mind transformation</p>
                  <div className="text-2xl font-bold text-primary mb-2">
                    {isIndiaUser ? '₹1,999' : '$34.99'}
                  </div>
                  <Badge variant="secondary" className="text-xs">Best Value</Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">25 minutes daily</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Weight management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Mental clarity boost</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-foreground mb-2">What you'll get:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Advanced yoga sequences</li>
                    <li>• Guided meditations</li>
                    <li>• Ayurvedic nutrition plan</li>
                    <li>• Progress tracking tools</li>
                    <li>• Personal routine tracker</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={handleSignup}
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Transform Now
                </Button>
              </CardContent>
            </Card>

            {/* 108-Day Evolution Program */}
            <Card className="border-0 shadow-lg bg-background hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/80 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-2">108-Day Evolution</h3>
                  <p className="text-sm text-muted-foreground mb-4">Complete life transformation journey</p>
                  <div className="text-2xl font-bold text-primary mb-2">
                    {isIndiaUser ? '₹2,999' : '$49.99'}
                  </div>
                  <Badge variant="secondary" className="text-xs">Master Level</Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">30 minutes daily</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Peak performance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Spiritual awakening</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-foreground mb-2">What you'll get:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Master-level practices</li>
                    <li>• Advanced spiritual techniques</li>
                    <li>• Complete lifestyle transformation</li>
                    <li>• Expert mentorship access</li>
                    <li>• Lifetime community access</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={handleSignup}
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Evolve Yourself
                </Button>
              </CardContent>
            </Card>
          </div>
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
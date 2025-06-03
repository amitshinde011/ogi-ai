
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.needsProfileSetup) {
        navigate('/profile-setup');
      } else {
        navigate('/home');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Show loading screen while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-sage/20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-sage rounded-full mx-auto flex items-center justify-center mb-6 animate-scale-in">
          <span className="text-4xl text-white">🧘</span>
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2 animate-fade-in">Yogi-ai</h1>
        <p className="text-muted-foreground animate-fade-in">Track Your Meals. Share the Journey.</p>
        <div className="mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;

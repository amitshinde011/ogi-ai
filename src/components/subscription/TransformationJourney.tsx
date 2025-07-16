import React from 'react';

export const TransformationJourney = () => {
  const journeySteps = [
    {
      duration: "21 Days",
      title: "Foundation & Mindfulness",
      description: "Build healthy habits and establish a mindful routine with your partner",
      image: "/lovable-uploads/51db591c-55ea-4e0a-a02c-fe3b4a2a3908.png",
      highlights: ["Daily meditation", "Stress reduction", "Better sleep"]
    },
    {
      duration: "49 Days", 
      title: "Active Transformation",
      description: "Increase energy levels and build strength through consistent practice",
      image: "/lovable-uploads/c50b2bf3-abf2-4e37-b77b-995db9f5a4c0.png",
      highlights: ["Enhanced fitness", "Increased energy", "Weight management"]
    },
    {
      duration: "108 Days",
      title: "Complete Wellness",
      description: "Achieve harmony and balance in both body and mind",
      image: "/lovable-uploads/7ce890e3-0d84-44ae-a1e1-a4b91bc3b569.png",
      highlights: ["Total transformation", "Inner balance", "Lasting wellness"]
    }
  ];

  return (
    <div className="w-full mb-12 lg:mb-16">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Your <span className="text-primary">Transformation Journey</span>
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          See the progressive wellness outcomes you can achieve with each program duration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
        {journeySteps.map((step, index) => (
          <div 
            key={index}
            className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            {/* Image Container */}
            <div className="aspect-square overflow-hidden">
              <img 
                src={step.image}
                alt={`${step.duration} transformation`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <span className="text-primary font-bold text-lg">{step.duration.split(' ')[0]}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                
                {/* Highlights */}
                <div className="space-y-2">
                  {step.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center justify-center text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Duration Badge */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-sm font-semibold text-primary">{step.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  age: number;
  location: string;
  rating: number;
  headline: string;
  testimonial: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah K.",
    age: 34,
    location: "London, UK",
    rating: 5,
    headline: "The ultimate antidote to my chaotic corporate life.",
    testimonial: "Working in finance in London, my mind was always 'on,' and my stress levels were through the roof. Yogi has been a complete game-changer. The 10-minute guided Pranayama (breathwork) before my morning meetings is now my non-negotiable secret weapon. Learning the science of how specific foods impact my Agni (digestive fire) has given me more sustained energy than three espressos ever did. It's practical, profound, and designed for the realities of a busy modern life. I feel calmer, more focused, and more in control.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b332c6a0?w=400&h=400&fit=crop&crop=face&auto=format"
  },
  {
    id: 2,
    name: "Marcus T.",
    age: 42,
    location: "Austin, Texas, USA",
    rating: 5,
    headline: "I was looking for a fitness app. I found a new way of life.",
    testimonial: "Between work and parenting, I felt completely drained. I downloaded Yogi just to get some basic stretches in. I ended up with so much more. The daily 10-minute asanas are perfect for my schedule, but it's the wisdom that truly hooked me. The recipes are incredible—they call them Sattvic, and I just call them delicious. My whole family is eating better. And the global community, the Sangha, is so incredibly supportive. It's amazing to connect with people from all over the world on the same path. This app helped me find my balance again.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format"
  },
  {
    id: 3,
    name: "Chloe N.",
    age: 28,
    location: "Sydney, Australia",
    rating: 5,
    headline: "This is the depth I've been searching for in wellness.",
    testimonial: "I love HIIT workouts and running, but I always felt like something was missing—a mind-body connection. Other 'yoga apps' were just glorified stretching videos. Yogi is completely different. It teaches the 'why'—the sacred science behind everything. Understanding the Gunas helped me make sense of my energy levels and moods, and learning to build my Prana has given me more stamina than any pre-workout supplement. It perfectly bridges the gap between physical fitness and true, holistic well-being. It's the real deal.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&auto=format"
  },
  {
    id: 4,
    name: "Lars B.",
    age: 41,
    location: "Berlin, Germany",
    rating: 5,
    headline: "I'm an engineer. I was skeptical, but the results are logical and undeniable.",
    testimonial: "I'm not typically into 'spirituality,' but I was suffering from burnout and nothing else was working. The 'science-based' approach of the Yogi app appealed to me. It didn't just tell me to 'relax'; it explained the mechanics of calming a Rajasic (restless) mind. It didn't just say 'detox'; it taught me how specific foods and poses reduce Ama (toxins). The process was systematic, the instructions were clear, and the results were undeniable. I have more mental clarity, my focus has improved, and I feel fundamentally grounded. This isn't magic; it's a practical science for the human system.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format"
  }
];

const TestimonialsCarousel = () => {
  const [api, setApi] = useState<any>(null);

  // Auto-slide functionality
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [api]);

  const renderStars = (rating: number) => {
    return Array.from({ length: rating }, (_, i) => (
      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    ));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Trusted by thousands worldwide
        </h2>
        <p className="text-gray-600">
          Real stories from real people on their wellness journey
        </p>
      </div>
      
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.id} className="basis-full">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mx-2">
                <div className="flex items-start space-x-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-100"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random&size=400`;
                      }}
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      {renderStars(testimonial.rating)}
                    </div>
                    
                    {/* Headline */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      "{testimonial.headline}"
                    </h3>
                    
                    {/* Testimonial */}
                    <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                      "{testimonial.testimonial}"
                    </p>
                    
                    {/* Author Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {testimonial.name}, {testimonial.age}
                        </p>
                        <p className="text-sm text-gray-500">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-white/80 hover:bg-white border-gray-200 text-gray-600 hover:text-gray-800" />
        <CarouselNext className="right-4 bg-white/80 hover:bg-white border-gray-200 text-gray-600 hover:text-gray-800" />
      </Carousel>
    </div>
  );
};

export default TestimonialsCarousel;

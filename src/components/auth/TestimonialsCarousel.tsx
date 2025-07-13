
import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { IMAGES } from '@/constants/images';

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
    image: IMAGES.TESTIMONIAL_SARAH
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
    name: "Gurmit B.",
    age: 41,
    location: "Delhi, India",
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
      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
    ));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-4">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-2">
          Trusted by thousands worldwide
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
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
        <CarouselContent className="-ml-2 sm:-ml-4">
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.id} className="pl-2 sm:pl-4 basis-full">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Profile Picture */}
                  <Avatar className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 ring-2 ring-gray-100">
                    <AvatarImage 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-sage text-white font-semibold text-sm sm:text-lg">
                      {getInitials(testimonial.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Content */}
                  <div className="space-y-3 max-w-2xl">
                    {/* Rating */}
                    <div className="flex items-center justify-center">
                      {renderStars(testimonial.rating)}
                    </div>
                    
                    {/* Headline */}
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 leading-tight">
                      "{testimonial.headline}"
                    </h3>
                    
                    {/* Testimonial */}
                    <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-base">
                      "{testimonial.testimonial}"
                    </p>
                    
                    {/* Author Info */}
                    <div className="pt-2">
                      <p className="font-medium text-gray-800 text-sm sm:text-base">
                        {testimonial.name}, {testimonial.age}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex left-2 lg:left-4 bg-white/80 hover:bg-white border-gray-200 text-gray-600 hover:text-gray-800" />
        <CarouselNext className="hidden sm:flex right-2 lg:right-4 bg-white/80 hover:bg-white border-gray-200 text-gray-600 hover:text-gray-800" />
      </Carousel>
    </div>
  );
};

export default TestimonialsCarousel;

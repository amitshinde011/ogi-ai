
import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const WellnessCarousel = () => {
  const images = [
    '/lovable-uploads/906020d3-1d95-40e6-b186-7bac6f5f47bf.png',
    '/lovable-uploads/ea82c1d4-6670-43f8-b1d9-453ffdf8c180.png',
    '/lovable-uploads/aded644f-d28a-41e0-87d6-c2e78e474c1b.png',
    '/lovable-uploads/1050cead-b512-4b83-b3c4-31b4286048d9.png',
    '/lovable-uploads/5f229e33-65cf-403e-8336-0e153afa7950.png',
    '/lovable-uploads/f9bfc242-1704-4d11-8fb4-7d7e5486d7a0.png',
    '/lovable-uploads/d183ce62-241a-4d56-8eff-e7a895107408.png',
    '/lovable-uploads/8c1cd0b6-97c5-4b83-8c55-504f1c93a5b8.png',
    '/lovable-uploads/8b74f19c-90e7-4f59-b2f9-e6e787700f29.png'
  ];

  const [api, setApi] = useState<any>(null);

  // Auto-slide functionality
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index} className="basis-full">
              <div className="relative w-full aspect-[3/3] sm:aspect-[3/3] md:aspect-[3/3] overflow-hidden rounded-2xl">
                <img
                  src={image}
                  alt={`Wellness inspiration ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-transparent hover:bg-black/20 border-transparent text-white hover:text-white" />
        <CarouselNext className="right-4 bg-transparent hover:bg-black/20 border-transparent text-white hover:text-white" />
      </Carousel>
    </div>
  );
};

export default WellnessCarousel;


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
    '/lovable-uploads/0c0444a7-0c07-43d0-8fac-7aed6ee52d41.png',
    '/lovable-uploads/9007c4a8-556e-4720-b175-bcd1ccd3fa7a.png',
    '/lovable-uploads/00650227-f546-403b-847b-177618181db4.png',
    '/lovable-uploads/38e93c2a-67d3-4899-a801-be95bff4bbcb.png',
    '/lovable-uploads/b81ced20-6a91-448e-bac9-57b644e4787e.png',
    '/lovable-uploads/16c28ccf-38c0-4b4f-b1e3-a2dd98ddd3fe.png',
    '/lovable-uploads/f576ca68-0529-41ad-b7ee-dd9aec0bb5b8.png',
    '/lovable-uploads/1d846cf4-d07a-4a9d-bce2-33f967d61ff8.png'
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

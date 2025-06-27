
import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const WellnessCarousel = () => {
  const imageIds = [
    'bc37fb04-6356-4903-f35b-b28b2e891300',
    'bfc0c878-5985-4af9-685c-51a970a6a200',
    'e505f2f8-50b4-4b3a-4704-0636a265ac00',
    '5b9282e0-5d2e-463c-6f5d-8c2819a75500',
    'fb24fed9-1885-412a-b077-500fe5ee8200',
    'c94586bb-93dc-4216-ce83-509faac19a00',
    '5031a597-6156-49f8-8171-40399facba00',
    'dc5473c1-f6a0-4e4e-1a86-bc5253d57300'
  ];

  // Convert Cloudflare image IDs to URLs using the correct format
  const images = imageIds.map(id => 
    `https://imagedelivery.net/A_Wtx2a2fSW25WEMOQdcw/${id}/public`
  );

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
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto px-4">
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
            <CarouselItem key={imageIds[index]} className="basis-full">
              <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-[3/2] overflow-hidden rounded-xl sm:rounded-2xl">
                <img
                  src={image}
                  alt={`Wellness inspiration ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    console.error(`Failed to load image: ${image}`);
                    // Fallback to a placeholder or handle error
                  }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 sm:left-4 bg-white/80 hover:bg-white/90 border-white/20 text-gray-800 hover:text-gray-900 h-8 w-8 sm:h-10 sm:w-10" />
        <CarouselNext className="right-2 sm:right-4 bg-white/80 hover:bg-white/90 border-white/20 text-gray-800 hover:text-gray-900 h-8 w-8 sm:h-10 sm:w-10" />
      </Carousel>
    </div>
  );
};

export default WellnessCarousel;

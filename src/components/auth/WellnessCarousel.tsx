
import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { getCloudflareImageUrl } from '@/utils/cloudflareImages';

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

  // Use the utility function to generate proper Cloudflare URLs
  const images = imageIds.map(id => getCloudflareImageUrl(id));

  const [api, setApi] = useState<any>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Auto-slide functionality
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [api]);

  const handleImageError = (imageUrl: string) => {
    console.error(`Failed to load image: ${imageUrl}`);
    setImageErrors(prev => new Set(prev).add(imageUrl));
  };

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
              <div className="relative w-full aspect-square overflow-hidden rounded-xl sm:rounded-2xl bg-gray-100">
                {!imageErrors.has(image) ? (
                  <img
                    src={image}
                    alt={`Wellness inspiration ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={() => handleImageError(image)}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sage/20 to-sage/10">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-sage/20 rounded-full">
                        <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sage font-medium">Wellness Image</p>
                      <p className="text-gray-500 text-sm mt-1">Inspiring your journey</p>
                    </div>
                  </div>
                )}
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

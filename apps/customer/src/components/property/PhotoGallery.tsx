import { useState } from 'react';
import type { PhotoResponse } from '@/types';
import Modal from '@/components/common/Modal';

interface PhotoGalleryProps {
  photos: PhotoResponse[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="w-full h-72 bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl flex items-center justify-center">
        <svg className="h-16 w-16 text-brand-500 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const primary = photos.find((p) => p.primary) ?? photos[0];
  const secondary = photos.filter((p) => p.id !== primary.id).slice(0, 4);

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden md:grid grid-cols-2 gap-2 rounded-2xl overflow-hidden h-96 relative">
        {/* Primary photo */}
        <button
          className="relative col-span-1 row-span-2 overflow-hidden group"
          onClick={() => openLightbox(0)}
          aria-label="View photo"
        >
          <img
            src={primary.url}
            alt={primary.caption ?? 'Property photo'}
            className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
          />
        </button>

        {/* 2×2 grid of secondaries */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2">
          {[0, 1, 2, 3].map((i) => {
            const photo = secondary[i];
            if (!photo) {
              return <div key={i} className="bg-gray-100" />;
            }
            return (
              <button
                key={photo.id}
                onClick={() => openLightbox(i + 1)}
                className="relative overflow-hidden group"
                aria-label="View photo"
              >
                <img
                  src={photo.url}
                  alt={photo.caption ?? 'Property photo'}
                  className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
                />
              </button>
            );
          })}
        </div>

        {/* Show all photos */}
        {photos.length > 5 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 bg-white border border-gray-300 text-gray-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Show all {photos.length} photos
          </button>
        )}
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden relative rounded-2xl overflow-hidden aspect-[4/3]">
        <img
          src={photos[carouselIndex].url}
          alt={photos[carouselIndex].caption ?? 'Property photo'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <button
            onClick={() => setCarouselIndex((i) => Math.max(0, i - 1))}
            disabled={carouselIndex === 0}
            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center disabled:opacity-30 shadow hover:bg-white transition-colors"
            aria-label="Previous photo"
          >
            <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCarouselIndex((i) => Math.min(photos.length - 1, i + 1))}
            disabled={carouselIndex === photos.length - 1}
            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center disabled:opacity-30 shadow hover:bg-white transition-colors"
            aria-label="Next photo"
          >
            <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {photos.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === carouselIndex ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
        <button
          onClick={() => openLightbox(carouselIndex)}
          className="absolute bottom-8 right-3 bg-white/90 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg"
        >
          {carouselIndex + 1}/{photos.length}
        </button>
      </div>

      {/* Lightbox modal */}
      <Modal isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} size="lg" title={`Photo ${lightboxIndex + 1} of ${photos.length}`}>
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
            <img
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].caption ?? 'Property photo'}
              className="w-full h-full object-cover"
            />
          </div>
          {photos[lightboxIndex].caption && (
            <p className="text-sm text-gray-600 text-center">{photos[lightboxIndex].caption}</p>
          )}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setLightboxIndex((i) => Math.max(0, i - 1))}
              disabled={lightboxIndex === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ← Previous
            </button>
            <div className="flex gap-1.5 overflow-x-auto max-w-xs">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setLightboxIndex(i)}
                  className={`flex-shrink-0 w-12 h-9 rounded overflow-hidden border-2 transition-colors ${
                    i === lightboxIndex ? 'border-brand-500' : 'border-transparent'
                  }`}
                >
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setLightboxIndex((i) => Math.min(photos.length - 1, i + 1))}
              disabled={lightboxIndex === photos.length - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

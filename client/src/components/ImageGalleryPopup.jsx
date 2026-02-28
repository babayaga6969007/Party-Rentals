import { useState, useEffect, useCallback } from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

/**
 * Reusable image gallery popup/lightbox.
 * Expects images: array of { _id, image: { url }, title?, subtitle? }
 * Props: isOpen, images, initialIndex, onClose
 */
const ImageGalleryPopup = ({ isOpen, images = [], initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)));
    }
  }, [isOpen, initialIndex, images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, goPrev, goNext]);

  if (!isOpen) return null;

  const current = images[currentIndex];
  const hasMultiple = images.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
    >
      <div
        className="relative flex flex-col items-center justify-center w-full max-w-5xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 z-10 p-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition"
          aria-label="Close"
        >
          <FiX className="w-8 h-8" />
        </button>

        {/* Image area with nav arrows */}
        <div className="relative flex items-center justify-center w-full">
          {hasMultiple && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-0 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition -translate-x-2 md:-translate-x-4"
              aria-label="Previous image"
            >
              <FiChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
            </button>
          )}

          {current && (
            <div className="flex flex-col items-center max-w-full">
              <img
                src={current.image?.url}
                alt={current.title || "Gallery image"}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="mt-4 text-center text-white max-w-xl">
                {current.title && (
                  <h3 className="text-lg md:text-xl font-semibold">{current.title}</h3>
                )}
                {current.subtitle && (
                  <p className="mt-1 text-sm md:text-base text-white/85">{current.subtitle}</p>
                )}
              </div>
            </div>
          )}

          {hasMultiple && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-0 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition translate-x-2 md:translate-x-4"
              aria-label="Next image"
            >
              <FiChevronRight className="w-8 h-8 md:w-10 md:h-10" />
            </button>
          )}
        </div>

        {/* Counter */}
        {hasMultiple && (
          <p className="mt-4 text-sm text-white/70">
            {currentIndex + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageGalleryPopup;

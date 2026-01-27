import { useEffect, useState } from "react";
import { api } from "../../utils/api";

const Gallery = () => {
  const [signageImages, setSignageImages] = useState([]);
  const [vinylImages, setVinylImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      
      const [signageRes, vinylRes] = await Promise.all([
        api("/gallery?category=signage"),
        api("/gallery?category=vinyl-wraps"),
      ]);

      setSignageImages(signageRes?.images || []);
      setVinylImages(vinylRes?.images || []);
    } catch (err) {
      console.error("Failed to load images:", err);
    } finally {
      setLoading(false);
    }
  };

  // Pinterest-style masonry grid component
  const MasonryGrid = ({ images, title, subtitle }) => {
    if (images.length === 0) return null;

    return (
      <section className="mb-32">
        <div className="text-center mb-20">
          <h2
            className="text-3xl md:text-4xl font-semibold text-[#2D2926] mb-4"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="text-[#2D2926]/80 text-xl max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {images.map((img) => (
            <div
              key={img._id}
              className="break-inside-avoid mb-6 group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
                <img
                  src={img.image?.url}
                  alt={img.title}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3
                      className="font-semibold text-lg md:text-xl mb-1"
                      style={{ fontFamily: '"Cormorant Garamond", serif' }}
                    >
                      {img.title}
                    </h3>
                    {img.subtitle && (
                      <p
                        className="text-base text-gray-200 leading-relaxed"
                        style={{ fontFamily: '"Cormorant Garamond", serif' }}
                      >
                        {img.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5C42] mb-4"></div>
          <p
            className="text-[#2D2926]/80 text-xl leading-relaxed"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Loading visual showcase...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-40 pb-24 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Signage Section */}
        <MasonryGrid
          images={signageImages}
          title="Custom Signage"
          subtitle="Beautiful, professional signage designs for your events"
        />

        {/* Vinyl Wraps Section */}
        <MasonryGrid
          images={vinylImages}
          title="Vinyl Wraps"
          subtitle="Eye-catching vinyl wrap designs that make a statement"
        />

        {/* Empty State */}
        {signageImages.length === 0 && vinylImages.length === 0 && (
          <div className="text-center py-32">
            <p
              className="text-[#2D2926]/80 text-xl leading-relaxed"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              No images available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;

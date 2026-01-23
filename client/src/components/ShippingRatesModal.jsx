import { useState, useEffect } from "react";
import { api } from "../utils/api";

const ShippingRatesModal = ({ isOpen, onClose }) => {
  const [zipCode, setZipCode] = useState("");
  const [detectedZone, setDetectedZone] = useState(null);
  const [zipError, setZipError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shippingConfig, setShippingConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Warehouse location - will be loaded from config
  const [warehouse, setWarehouse] = useState({
    address: "2031 Via Burton Street, Suite A, USA",
    lat: 34.0522,
    lng: -118.2437,
  });

  // Haversine formula to calculate distance between two coordinates in miles
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Geocode ZIP code using Nominatim (OpenStreetMap) - Free, no API key required
  const geocodeZipCode = async (zip) => {
    try {
      // Use Nominatim API to geocode the ZIP code
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=US&format=json&limit=1`,
        {
          headers: {
            "User-Agent": "Party-Rentals-App", // Required by Nominatim
          },
        }
      );

      if (!response.ok) {
        throw new Error("Geocoding service unavailable");
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error("ZIP code not found");
      }

      const location = data[0];
      return {
        lat: parseFloat(location.lat),
        lon: parseFloat(location.lon),
        displayName: location.display_name,
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  };

  // Alternative: Geocode using Google Maps API (if API key is available)
  const geocodeZipCodeGoogle = async (zip) => {
    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_API_KEY) {
      throw new Error("Google Maps API key not configured");
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${GOOGLE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Google Geocoding service unavailable");
      }

      const data = await response.json();

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        throw new Error("ZIP code not found");
      }

      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lon: location.lng,
        displayName: data.results[0].formatted_address,
      };
    } catch (error) {
      console.error("Google Geocoding error:", error);
      throw error;
    }
  };

  // Calculate distance from ZIP code using geocoding
  const calculateDistanceFromZip = async (zip) => {
    try {
      // Try Google Maps first if API key is available, otherwise use Nominatim
      const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      let destinationCoords;

      if (GOOGLE_API_KEY) {
        try {
          destinationCoords = await geocodeZipCodeGoogle(zip);
        } catch (error) {
          // Fallback to Nominatim if Google fails
          console.warn("Google geocoding failed, falling back to Nominatim:", error);
          destinationCoords = await geocodeZipCode(zip);
        }
      } else {
        destinationCoords = await geocodeZipCode(zip);
      }

      const distanceInMiles = calculateDistance(
        warehouse.lat,
        warehouse.lng,
        destinationCoords.lat,
        destinationCoords.lon
      );

      return {
        distance: Math.round(distanceInMiles),
        address: destinationCoords.displayName,
      };
    } catch (error) {
      console.error("Distance calculation error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchShippingConfig = async () => {
      try {
        setConfigLoading(true);
        const res = await api("/shipping-config");
        if (res && res.config) {
          setShippingConfig(res.config);
          if (res.config.warehouse) {
            setWarehouse({
              address: res.config.warehouse.address || "2031 Via Burton Street, Suite A, USA",
              lat: res.config.warehouse.lat || 34.0522,
              lng: res.config.warehouse.lng || -118.2437,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load shipping config:", err);
      } finally {
        setConfigLoading(false);
      }
    };

    if (isOpen) {
      fetchShippingConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Calculate shipping price based on distance using admin-configured prices
  const calculateShippingPrice = (distanceInMiles) => {
    if (!shippingConfig || !shippingConfig.distanceRanges) {
      // Fallback if config not loaded
      return {
        price: null,
        distanceRange: "N/A",
      };
    }

    // Sort ranges by minDistance (ascending)
    const sortedRanges = [...shippingConfig.distanceRanges].sort(
      (a, b) => a.minDistance - b.minDistance
    );

    // Find the matching range
    for (const range of sortedRanges) {
      const minMatch = distanceInMiles >= range.minDistance;
      const maxMatch =
        range.maxDistance === null || distanceInMiles <= range.maxDistance;

      if (minMatch && maxMatch) {
        return {
          price: range.price,
          distanceRange: range.label,
        };
      }
    }

    // If no range matches, return custom quote
    return {
      price: null,
      distanceRange: "Out of range",
    };
  };

  // Detect zone and calculate distance/pricing from ZIP
  const detectZoneFromZip = async (zip) => {
    setIsLoading(true);
    setZipError("");
    
    try {
      const { distance: distanceInMiles, address } = await calculateDistanceFromZip(zip);
      
      const pricing = calculateShippingPrice(distanceInMiles);
      
      return {
        distance: distanceInMiles,
        address: address,
        distanceRange: pricing.distanceRange,
        price: pricing.price,
      };
    } catch (error) {
      setZipError(
        error.message || "Unable to calculate distance. Please try again or contact support."
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="bg-white max-w-3xl w-full rounded-xl shadow-lg p-6 relative">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {/* HEADER */}
        <h2 className="text-2xl font-semibold text-[#2D2926]">
          Shipping Rates
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          All deliveries are dispatched from our warehouse at:
          <br />
          <strong>{warehouse.address}</strong>
        </p>

        {/* ZIP CODE CHECK */}
        <div className="mt-5 bg-[#FAF7F5] p-4 rounded-lg border">
          <h4 className="font-semibold text-[#2D2926] mb-2">
            Check Delivery Availability by ZIP Code
          </h4>

          <div className="flex gap-3 flex-col sm:flex-row">
            <input
              type="text"
              value={zipCode}
              maxLength={5}
              placeholder="Enter ZIP code"
              className="flex-1 p-3 border rounded-lg"
              onChange={(e) => {
                setZipCode(e.target.value);
                setZipError("");
                setDetectedZone(null);
              }}
            />

            <button
              type="button"
              onClick={async () => {
                if (!/^\d{5}$/.test(zipCode)) {
                  setZipError("Please enter a valid 5-digit ZIP code");
                  return;
                }

                setZipError("");
                setDetectedZone(null);
                
                try {
                  const result = await detectZoneFromZip(zipCode);
                  setDetectedZone(result);
                } catch {
                  // Error is already handled in detectZoneFromZip
                  setDetectedZone(null);
                }
              }}
              disabled={isLoading}
              className="px-5 py-3 rounded-lg bg-black text-white hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Calculating..." : "Check"}
            </button>
          </div>

          {zipError && (
            <p className="mt-2 text-sm text-red-600">{zipError}</p>
          )}

          {detectedZone && (
            <div className="mt-4 bg-white p-4 rounded-lg border text-sm">
              {detectedZone.address && (
                <p className="mb-2">
                  <strong>Location:</strong> {detectedZone.address}
                </p>
              )}
              <p>
                <strong>Distance:</strong> {detectedZone.distance} miles
              </p>
              <p>
                <strong>Distance Range:</strong> {detectedZone.distanceRange}
              </p>

              {detectedZone.price !== null && detectedZone.price !== undefined ? (
                <p className="mt-1">
                  <strong>Shipping Price:</strong> $ {detectedZone.price}
                </p>
              ) : (
                <p className="mt-2 text-orange-600 font-medium">
                  Custom shipping quote required
                </p>
              )}
            </div>
          )}
        </div>

        {/* DISTANCE-BASED PRICING TABLE */}
        <div className="mt-6 overflow-x-auto">
          {configLoading ? (
            <p className="text-center text-gray-500 py-4">Loading pricing table...</p>
          ) : (
            <table className="w-full border border-gray-200 rounded-lg text-sm">
              <thead className="bg-[#F5F7FF]">
                <tr>
                  <th className="px-4 py-3 text-left">Distance Range</th>
                  <th className="px-4 py-3 text-left">Price</th>
                </tr>
              </thead>

              <tbody>
                {shippingConfig?.distanceRanges
                  ?.sort((a, b) => a.minDistance - b.minDistance)
                  .map((range) => (
                    <tr key={range._id} className="border-t">
                      <td className="px-4 py-3 font-medium">{range.label}</td>
                      <td className="px-4 py-3">
                        {range.price > 0 ? `$${range.price}` : "Custom"}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="2" className="px-4 py-3 text-center text-gray-500">
                        No pricing configured
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          * Shipping charges are indicative. Final cost may vary based on access,
          timing, and handling requirements.
        </p>
      </div>
    </div>
  );
};

export default ShippingRatesModal;

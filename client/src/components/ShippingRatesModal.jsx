import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";

const ShippingRatesModal = ({ isOpen, onClose, onShippingCalculated }) => {
  const [addressInput, setAddressInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [detectedZone, setDetectedZone] = useState(null);
  const [addressError, setAddressError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [shippingConfig, setShippingConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Warehouse location - will be loaded from config
  const [warehouse, setWarehouse] = useState({
    address: "2031 Via Burton Street, Anaheim, USA",
    lat: 33.8436,
    lng: -117.8864,
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

  // Search addresses using Photon API (free, no API key required)
  const searchAddress = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setIsSearching(true);
      // Photon API with location bias to prioritize results near warehouse
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lat=${warehouse.lat}&lon=${warehouse.lng}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Address search service unavailable");
      }

      const data = await response.json();

      if (!data.features || data.features.length === 0) {
        setSuggestions([]);
        return;
      }

      // Map Photon results to our format
      const mappedSuggestions = data.features.map((f) => {
        const parts = [
          f.properties.name,
          f.properties.city,
          f.properties.state,
          f.properties.postcode,
        ].filter(Boolean);

        return {
          label: parts.join(", "),
          lat: f.geometry.coordinates[1], // Photon returns [lng, lat]
          lon: f.geometry.coordinates[0],
          fullAddress: parts.join(", "),
        };
      });

      setSuggestions(mappedSuggestions);
    } catch (error) {
      console.error("Address search error:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };
  // Get road distance using OSRM API (driving distance, not straight-line)
  const getRoadDistance = async (warehouseLat, warehouseLng, destLat, destLng) => {
    try {
      // OSRM API format: /route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=false
      // Note: OSRM uses longitude first, then latitude
      // Don't include custom headers to avoid CORS issues
      const url = `https://router.project-osrm.org/route/v1/driving/${warehouseLng},${warehouseLat};${destLng},${destLat}?overview=false`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("OSRM routing service unavailable");
      }

      const data = await response.json();

      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw new Error("No route found");
      }

      // Distance is returned in meters
      const distanceInMeters = data.routes[0].distance;
      
      // Convert meters to miles (1 meter = 0.000621371 miles)
      const distanceInMiles = distanceInMeters * 0.000621371;
      
      return Math.round(distanceInMiles);
    } catch (error) {
      console.error("OSRM routing error:", error);
      throw error;
    }
  };

  // Calculate distance from selected address coordinates
  const calculateDistanceFromAddress = async (selectedAddress) => {
    try {
      // Try to get actual driving distance using OSRM
      let distanceInMiles;
      try {
        distanceInMiles = await getRoadDistance(
          warehouse.lat,
          warehouse.lng,
          selectedAddress.lat,
          selectedAddress.lon
        );
      } catch (osrmError) {
        // Fallback to Haversine (straight-line) distance if OSRM fails
        console.warn("OSRM routing failed, falling back to straight-line distance:", osrmError);
        distanceInMiles = Math.round(
          calculateDistance(
            warehouse.lat,
            warehouse.lng,
            selectedAddress.lat,
            selectedAddress.lon
          )
        );
      }

      return {
        distance: distanceInMiles,
        address: selectedAddress.fullAddress || selectedAddress.label,
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
              address: res.config.warehouse.address || "2031 Via Burton Street, Anaheim, USA",
              lat: res.config.warehouse.lat || 33.8436,
              lng: res.config.warehouse.lng || -117.8864,
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

  // Handle address selection from dropdown
  const handleAddressSelect = async (selectedAddress) => {
    setAddressInput(selectedAddress.label);
    setSuggestions([]);
    setAddressError("");
    setDetectedZone(null);
    setIsLoading(true);

    try {
      const { distance: distanceInMiles, address } = await calculateDistanceFromAddress(selectedAddress);
      
      const pricing = calculateShippingPrice(distanceInMiles);
      
      const result = {
        distance: distanceInMiles,
        address: address,
        distanceRange: pricing.distanceRange,
        price: pricing.price,
      };
      
      setDetectedZone(result);
      
      // Don't auto-call callback - let user review and click "Apply" button
    } catch (error) {
      setAddressError(
        error.message || "Unable to calculate distance. Please try again or contact support."
      );
      setDetectedZone(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 py-4 overflow-y-auto">
      <div className="bg-white max-w-3xl w-full rounded-xl shadow-lg relative my-auto max-h-[90vh] flex flex-col">
        {/* STICKY HEADER */}
        <div className="sticky top-0 bg-white rounded-t-xl z-10 p-6 pb-4 border-b border-gray-200">
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            ✕
          </button>

          {/* HEADER */}
          <h2 className="text-2xl font-semibold text-[#2D2926] pr-8">
            Shipping Rates
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            All deliveries are dispatched from our warehouse at:
            <br />
            <strong>{warehouse.address}</strong>
          </p>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto flex-1 p-6 pt-4">
          {/* ADDRESS SEARCH */}
        <div className="mt-5 bg-[#FAF7F5] p-4 rounded-lg border">
          <h4 className="font-semibold text-[#2D2926] mb-2">
            Check Delivery Availability by Address
          </h4>

          <div className="relative z-20">
            <input
              type="text"
              value={addressInput}
              placeholder="Enter address, city, or ZIP code"
              className="w-full p-3 border rounded-lg"
              onChange={(e) => {
                const value = e.target.value;
                setAddressInput(value);
                setAddressError("");
                setDetectedZone(null);
                searchAddress(value);
              }}
              onBlur={() => {
                // Delay hiding suggestions to allow click
                setTimeout(() => setSuggestions([]), 200);
              }}
              onFocus={() => {
                if (addressInput.length >= 3) {
                  searchAddress(addressInput);
                }
              }}
            />

            {/* Autocomplete Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isSearching && (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    Searching...
                  </div>
                )}
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
                    onClick={() => handleAddressSelect(suggestion)}
                  >
                    <div className="text-sm text-[#2D2926]">{suggestion.label}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {addressError && (
            <p className="mt-2 text-sm text-red-600">{addressError}</p>
          )}

          {isLoading && (
            <p className="mt-2 text-sm text-gray-600">Calculating distance...</p>
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

              {detectedZone.distance > 75 ? (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 font-medium">
                    For this distance you need to contact us for confirmation.
                  </p>
                  <Link
                    to="/contact"
                    onClick={onClose}
                    className="mt-3 inline-flex items-center justify-center w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                  >
                    Go to Contact Page
                  </Link>
                </div>
              ) : detectedZone.price !== null && detectedZone.price !== undefined ? (
                <>
                  <p className="mt-1">
                    <strong>Shipping Price:</strong> $ {detectedZone.price}
                  </p>
                  {onShippingCalculated && (
                    <button
                      type="button"
                      onClick={() => {
                        onShippingCalculated({
                          distance: detectedZone.distance,
                          address: detectedZone.address,
                          distanceRange: detectedZone.distanceRange,
                          price: detectedZone.price,
                        });
                        onClose();
                      }}
                      className="mt-3 w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      Apply Shipping Cost
                    </button>
                  )}
                </>
              ) : (
                <div className="mt-3">
                  <p className="text-orange-600 font-medium">
                    Custom shipping quote required
                  </p>
                  <Link
                    to="/contact"
                    onClick={onClose}
                    className="mt-2 inline-flex items-center justify-center w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Contact us for a quote
                  </Link>
                </div>
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
    </div>
  );
};

export default ShippingRatesModal;

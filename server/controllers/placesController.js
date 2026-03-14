/**
 * Proxy to Google Places API (New). API key stays on server only.
 * Requires GOOGLE_PLACES_API_KEY in env. Enable "Places API (New)" in Google Cloud Console.
 */

const PLACES_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const PLACES_DETAILS_BASE = "https://places.googleapis.com/v1/places";

exports.autocomplete = async (req, res) => {
  try {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key || !key.trim()) {
      return res.status(200).json({ suggestions: [] });
    }

    const input = (req.query.input || "").trim();
    if (input.length < 2) {
      return res.status(200).json({ suggestions: [] });
    }

    const response = await fetch(PLACES_AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Places autocomplete HTTP error:", response.status, errText);
      return res.status(200).json({ suggestions: [] });
    }

    const data = await response.json();
    const rawSuggestions = data.suggestions || [];

    const suggestions = rawSuggestions
      .filter((s) => s.placePrediction && s.placePrediction.placeId)
      .map((s) => ({
        placeId: s.placePrediction.placeId,
        description: s.placePrediction.text?.text || s.placePrediction.structuredFormat?.mainText?.text || "",
      }))
      .filter((s) => s.description);

    res.json({ suggestions });
  } catch (err) {
    console.error("Places autocomplete error:", err);
    res.status(500).json({ error: "Address search failed" });
  }
};

exports.placeDetails = async (req, res) => {
  try {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key || !key.trim()) {
      return res.status(400).json({ error: "Places API not configured" });
    }

    const placeId = (req.query.place_id || "").trim();
    if (!placeId) {
      return res.status(400).json({ error: "place_id required" });
    }

    const url = `${PLACES_DETAILS_BASE}/${encodeURIComponent(placeId)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "formattedAddress,location",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Places details HTTP error:", response.status, errText);
      return res.status(404).json({ error: "Place not found" });
    }

    const data = await response.json();
    const loc = data.location;
    const lat = loc?.latitude;
    const lng = loc?.longitude;
    const formattedAddress = data.formattedAddress || "";

    if (lat == null || lng == null) {
      return res.status(404).json({ error: "Place has no coordinates" });
    }

    res.json({
      lat: Number(lat),
      lng: Number(lng),
      formatted_address: formattedAddress,
    });
  } catch (err) {
    console.error("Places details error:", err);
    res.status(500).json({ error: "Failed to get place details" });
  }
};

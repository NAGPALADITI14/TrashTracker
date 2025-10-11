import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GarbageReport = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [receiverEmail, setReceiverEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          showMessage("Location obtained successfully.", "success");
        },
        (error) => {
          console.error("Error accessing location:", error);
          showMessage("Error accessing location. Please enable location permissions.", "error");
        }
      );
    } else {
      showMessage("Geolocation is not supported by this browser.", "error");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    const getUserAddress = async () => {
      const { latitude, longitude } = location;
      if (!latitude || !longitude) return;

      const url = `https://api.opencagedata.com/geocode/v1/json?key=OPEN_CAGE_KEY=${latitude},${longitude}&pretty=1&no_annotations=1`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results?.[0]) {
          setUserAddress(data.results[0].formatted);
        } else {
          setUserAddress("Unknown Address");
          showMessage("Unable to retrieve address.", "error");
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        setUserAddress("Unknown Address");
        showMessage("Error fetching address.", "error");
      }
    };

    if (location.latitude && location.longitude) {
      getUserAddress();
    }
  }, [location]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.latitude || !location.longitude) {
      showMessage("Please provide your location.", "error");
      return;
    }
    if (!image) {
      showMessage("Please upload an image.", "error");
      return;
    }
    if (!receiverEmail) {
      showMessage("Please provide the receiver's email.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("latitude", location.latitude);
    formData.append("longitude", location.longitude);
    formData.append("address", userAddress || "Unknown Address");
    formData.append("image", image);
    formData.append("receiverEmail", receiverEmail);

    try {
      setLoading(true);
      const token = "YOUR_AUTH_TOKEN_HERE";
      const response = await fetch(
        "https://trashtrackerbackend.onrender.com/api/garbage-report",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      showMessage("Mail sent and report submitted successfully!", "success");
      setImage(null);
      setPreview(null);
      setReceiverEmail("");
   
    } catch (error) {
      console.error("Error reporting garbage:", error);
      showMessage("Error reporting garbage. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Removed <script> and <style> tags */}
        <div className="max-w-xl w-full mx-auto p-6 sm:p-8 bg-white rounded-3xl shadow-xl">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 inline-block mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Report Garbage
          </h2>

          {message && (
            <div
              className={`mb-4 text-center px-4 py-3 rounded-xl font-medium ${
                messageType === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {location.latitude && location.longitude ? (
            <div className="bg-green-50 p-4 rounded-xl mb-6 text-sm text-green-800">
              <p className="font-semibold">Your Location:</p>
              <p className="mt-1">
                <span className="font-medium">Latitude:</span> {location.latitude.toFixed(6)}
              </p>
              <p>
                <span className="font-medium">Longitude:</span> {location.longitude.toFixed(6)}
              </p>
              {userAddress && (
                <p className="mt-2">
                  <span className="font-medium">Address:</span> {userAddress}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-xl mb-6 text-sm text-yellow-800 text-center animate-pulse">
              Fetching location...
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 rounded-lg border border-gray-300 p-1"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-4 w-full h-48 object-cover rounded-lg shadow-md border border-gray-200"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Receiver Email
              </label>
              <input
                type="email"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                placeholder="Enter receiver's email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default GarbageReport;
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// We remove the hardcoded style={{ height: '500px', width: '100%' }}
// and let the parent component (MunicipalDashboard.js) control the size 
// using Tailwind classes (e.g., h-96 or h-screen-75).

const ChoroplethMap = ({ geoJsonData, sectorData }) => {
    useEffect(() => {
        // Logging for debugging purposes
        console.log("GeoJSON Data:", JSON.stringify(geoJsonData, null, 2)); 
        console.log("Sector Data:", sectorData); 
    }, [geoJsonData, sectorData]);

    const getColor = (frequency) => {
        // Heatmap style colors (Redder = higher frequency)
        if (frequency > 20) return '#800026'; // Dark Red
        if (frequency > 10) return '#BD0026'; // Red
        if (frequency > 6) return '#FC4E2A';  // Orange Red
        if (frequency > 3) return '#FD8D3C';  // Orange
        return '#FFEDA0'; // Light Yellow (Low Frequency)
    };

    const calculateFrequency = (geoJsonData) => {
        const frequencyCount = {};

        geoJsonData.features.forEach((feature) => {
            const sectorNumber = feature.properties.sectorNumber; 
            frequencyCount[sectorNumber] = (frequencyCount[sectorNumber] || 0) + 1; 
        });

        return frequencyCount;
    };

    const updatedSectorData = calculateFrequency(geoJsonData);

    // Tailwind is used in the parent to size this component.
    return (
        <MapContainer 
            // Removed inline style: style={{ height: '500px', width: '100%' }}
            center={[30.7333, 76.7794]} 
            zoom={13} 
            className="w-full h-full z-0" // Ensure it takes full width/height of parent and z-index is correct
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {geoJsonData.features.map((feature, index) => {
                const sectorNumber = feature.properties.sectorNumber;
                const frequency = updatedSectorData[sectorNumber] || 0;
                
                // Leaflet uses [lat, lng], GeoJSON uses [lng, lat]
                const position = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]; 

                return (
                    <Circle
                        key={index}
                        center={position}
                        radius={300} // Radius is fixed, or could be dynamic based on frequency * scaleFactor
                        fillColor={getColor(frequency)}
                        fillOpacity={0.4} // Slightly more opaque for better visibility
                        color={getColor(frequency)} // Set stroke color to match fill
                        weight={1}
                    >
                    </Circle>
                );
            })}
        </MapContainer>
    );
};

export default ChoroplethMap;
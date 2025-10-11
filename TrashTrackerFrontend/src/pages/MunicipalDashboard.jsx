import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Added for improved routing
import ChoroplethMap from './ChoroplethMap';
import 'leaflet/dist/leaflet.css'; // Keep the external map library CSS

const MunicipalDashboard = () => {

    const navigate = useNavigate();
    const token = localStorage.getItem('token'); 

    const [reports, setReports] = useState([]);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [sectorData, setSectorData] = useState({});
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); 
    const [timers, setTimers] = useState({});
    const [error, setError] = useState(null);
    const [showMap, setShowMap] = useState(false);

    // Function to handle logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth'); // Redirect to login page
    };

    // Helper function for messages
    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 5000);
    };

    const toggleMapVisibility = () => {
        setShowMap(prevShowMap => !prevShowMap);
    };

    const fetchReports = useCallback(async () => {
        if (!token) {
            setError('Authentication token missing. Please log in.');
            navigate('/auth');
            return;
        }

        try {
            const response = await axios.get('https://trashtrackerbackend.onrender.com/api/municipal/reports', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setReports(response.data);
            setError(null);

            // Initialize timers for in-progress reports
            const newTimers = {};
            response.data.forEach(report => {
                if (report.status === 'in-progress' && report.estimatedCompletionTime) {
                    newTimers[report._id] = new Date(report.estimatedCompletionTime).getTime();
                }
            });
            setTimers(newTimers);

            // --- GeoJSON Data Processing for Map ---
            const geoJsonFeatures = response.data.map(report => {
                const address = report.address || '';
                // Simple regex to extract sector number (e.g., Sector 1, S-1, Sector-1)
                const match = /(?:[Ss]ector\s*[\-]*\s*(\d+))/i.exec(address); 
                const sectorNumber = match ? match[1] : 'Unknown'; 

                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [report.location.longitude, report.location.latitude]
                    },
                    properties: {
                        sectorNumber: sectorNumber, 
                        status: report.status,
                        reportId: report._id
                    }
                };
            });

            const geoJsonData = {
                type: "FeatureCollection",
                features: geoJsonFeatures
            };
            
            setGeoJsonData(geoJsonData);
            const sectorFrequency = preprocessData(response.data);
            setSectorData(sectorFrequency);
        
        } catch (error) {
            console.error('Error fetching reports:', error);
            setError('Error fetching reports. Check if the server is running or if the token is valid.');
        }
    }, [token, navigate]);

    const preprocessData = (reports) => {
        const sectorFrequency = {};
        reports.forEach(report => {
            const address = report.address || '';
            const match = /[Ss]ector\s+(\d+)/.exec(address);
            if (match) {
                const sector = match[1];
                sectorFrequency[sector] = (sectorFrequency[sector] || 0) + 1;
            }
        });
        return sectorFrequency;
    };

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleUpdate = async (reportId, newStatus, estimatedCompletionTime) => {
        if (newStatus === 'in-progress' && !estimatedCompletionTime) {
            showMessage('Please set an estimated completion time.', 'error');
            return;
        }
        
        // Clear any old message before proceeding
        setMessage('');

        try {
            await axios.put(`https://trashtrackerbackend.onrender.com/api/garbage-report/${reportId}/status`, {
                status: newStatus,
                estimatedCompletionTime: newStatus === 'in-progress' ? estimatedCompletionTime : null
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showMessage('REPORT STATUS UPDATED SUCCESSFULLY!', 'success');
            
            // Update local state timers immediately
            if (newStatus === 'in-progress') {
                setTimers(prevTimers => ({
                    ...prevTimers,
                    [reportId]: new Date(estimatedCompletionTime).getTime()
                }));
            } else if (newStatus === 'completed' || newStatus === 'failed') {
                setTimers(prevTimers => {
                    const newTimers = { ...prevTimers };
                    delete newTimers[reportId];
                    return newTimers;
                });
            }

            // Refetch reports to ensure data consistency
            fetchReports();

        } catch (error) {
            console.error('Error updating report status:', error);
            showMessage('Error updating report status.', 'error');
        }
    };

    const handleDelete = async (reportId) => {
        if (!window.confirm("Are you sure you want to delete this report?")) {
            return;
        }

        try {
            await axios.delete(`https://trashtrackerbackend.onrender.com/api/garbage-report/${reportId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showMessage('REPORT DELETED SUCCESSFULLY!', 'success');
            
            // Update local state
            setTimers(prevTimers => {
                const newTimers = { ...prevTimers };
                delete newTimers[reportId];
                return newTimers;
            });
            fetchReports();

        } catch (error) {
            console.error('Error deleting report:', error);
            showMessage('Error deleting report.', 'error');
        }
    };

    const calculateRemainingTime = (reportId) => {
        const currentTime = new Date().getTime();
        const completionTime = timers[reportId];
        if (!completionTime) return '00:00:00';
        const diff = completionTime - currentTime;
        if (diff <= 0) return '00:00:00';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Timer Update Effect
    useEffect(() => {
        const interval = setInterval(() => {
            setReports(prevReports => 
                prevReports.map(report => {
                    if (report.status !== 'in-progress') return report;
                    const remainingTime = calculateRemainingTime(report._id);
                    // Check if time has run out
                    if (remainingTime === '00:00:00' && report.estimatedCompletionTime) {
                         // Note: We update the state locally here, but the DB status remains 'in-progress' 
                         // until an action (like Mark Completed) is taken or a dedicated background job updates it.
                         // For a better UX, we'll mark it visually as 'failed' locally.
                        return { ...report, status: 'failed' }; 
                    }
                    return report;
                })
            );
        }, 1000);
        return () => clearInterval(interval);
    }, [timers]);

    const getStatusClasses = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 font-semibold';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800 font-semibold';
            case 'failed':
                return 'bg-red-100 text-red-800 font-bold animate-pulse';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800 font-medium';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 md:p-12 font-sans">
            <div className="flex justify-between items-center mb-8 pb-4 border-b-4 border-green-500">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-green-700">
                    MUNICIPAL DASHBOARD
                </h2>
                <button 
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200 shadow-md" 
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>

            {/* Message Display */}
            {message && (
                <div 
                    className={`mb-4 p-3 rounded-lg text-center font-medium ${
                        messageType === 'success' 
                            ? 'bg-green-100 text-green-700 border border-green-300' 
                            : 'bg-red-100 text-red-700 border border-red-300'
                    }`}
                >
                    {message}
                </div>
            )}
            
            {error && <p className="mb-4 p-3 rounded-lg text-center font-medium bg-red-100 text-red-700 border border-red-300">{error}</p>}

            {/* Reports Table */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-green-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">ID (Short)</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Location/Address</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Est. Completion Time</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reports.length > 0 ? (
                                reports.map(report => (
                                    <tr key={report._id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {report._id ? report._id.substring(0, 8) + '...' : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={report.address}>
                                            {report.address}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 rounded-full ${getStatusClasses(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {report.status === 'completed' || report.status === 'failed' ? (
                                                <span className="text-gray-400">-</span>
                                            ) : report.status === 'in-progress' ? (
                                                <span className="font-mono text-blue-600">{calculateRemainingTime(report._id)}</span>
                                            ) : (
                                                <input 
                                                    type="datetime-local" 
                                                    onChange={(e) => handleUpdate(report._id, 'in-progress', e.target.value)}
                                                    className="p-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
                                                />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-2">
                                            {report.status !== 'completed' && report.status !== 'failed' && (
                                                <button 
                                                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md transition duration-150 text-xs font-semibold" 
                                                    onClick={() => handleUpdate(report._id, 'completed')}
                                                >
                                                    Mark Completed
                                                </button>
                                            )}
                                            <button 
                                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition duration-150 text-xs font-semibold" 
                                                onClick={() => handleDelete(report._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-500">
                                        No garbage reports found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Map Toggle and Display */}
            <button 
                onClick={toggleMapVisibility}
                className="w-full md:w-1/3 mx-auto flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition duration-200 shadow-lg"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>{showMap ? "Hide Map View" : "Display Hotspot Map"}</span>
            </button>
            
            {showMap && geoJsonData && (
                <div className="mt-8">
                    <h3 className="text-2xl font-semibold text-green-700 mb-4 border-b border-green-200 pb-2">Geographical Overview</h3>
                    <div className="h-96 md:h-screen-75 rounded-xl shadow-xl overflow-hidden border-2 border-green-300">
                        <ChoroplethMap geoJsonData={geoJsonData} sectorData={sectorData} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MunicipalDashboard;
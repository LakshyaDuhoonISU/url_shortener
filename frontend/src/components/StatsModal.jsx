import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import toast from 'react-hot-toast';

const StatsModal = ({ url, isOpen, onClose }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        if (isOpen && url) {
            fetchStats();
        }
    }, [isOpen, url, dateRange]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const params = {};
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;

            const response = await api.get(`/api/url/${url.id}/stats`, { params });
            setStats(response.data.stats);
        } catch (error) {
            toast.error('Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">URL Statistics</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* URL Info */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">
                                {url.title || 'Untitled URL'}
                            </h4>
                            <p className="text-sm text-gray-600 break-all">{url.originalUrl}</p>
                            <p className="text-sm text-primary-600 font-mono break-all">{url.shortUrl}</p>
                        </div>

                        {/* Date Range Filter */}
                        <div className="mb-6 flex flex-wrap gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={dateRange.startDate}
                                    onChange={handleDateChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={dateRange.endDate}
                                    onChange={handleDateChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                <p className="mt-2 text-gray-500">Loading statistics...</p>
                            </div>
                        ) : stats ? (
                            <div className="space-y-6">
                                {/* Overview Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-blue-600">Total Clicks</p>
                                        <p className="text-2xl font-bold text-blue-900">{stats.totalClicks}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-green-600">Unique Visitors</p>
                                        <p className="text-2xl font-bold text-green-900">{stats.uniqueIPs}</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-purple-600">Top Device</p>
                                        <p className="text-lg font-bold text-purple-900">
                                            {Object.keys(stats.deviceTypes).length > 0
                                                ? Object.entries(stats.deviceTypes).reduce((a, b) => stats.deviceTypes[a[0]] > stats.deviceTypes[b[0]] ? a : b)[0]
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-orange-600">Top Browser</p>
                                        <p className="text-lg font-bold text-orange-900">
                                            {Object.keys(stats.browsers).length > 0
                                                ? Object.entries(stats.browsers).reduce((a, b) => stats.browsers[a[0]] > stats.browsers[b[0]] ? a : b)[0]
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Charts */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Device Types */}
                                    <div className="bg-white border rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-3">Device Types</h4>
                                        <div className="space-y-2">
                                            {Object.entries(stats.deviceTypes).map(([device, count]) => (
                                                <div key={device} className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 capitalize">{device}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full"
                                                                style={{
                                                                    width: `${(count / stats.totalClicks) * 100}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{count}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Browsers */}
                                    <div className="bg-white border rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-3">Browsers</h4>
                                        <div className="space-y-2">
                                            {Object.entries(stats.browsers).map(([browser, count]) => (
                                                <div key={browser} className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">{browser}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-green-600 h-2 rounded-full"
                                                                style={{
                                                                    width: `${(count / stats.totalClicks) * 100}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{count}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Operating Systems */}
                                    <div className="bg-white border rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-3">Operating Systems</h4>
                                        <div className="space-y-2">
                                            {Object.entries(stats.operatingSystems).map(([os, count]) => (
                                                <div key={os} className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">{os}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-purple-600 h-2 rounded-full"
                                                                style={{
                                                                    width: `${(count / stats.totalClicks) * 100}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{count}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Clicks by Date */}
                                    <div className="bg-white border rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-3">Clicks by Date</h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {Object.entries(stats.clicksByDate)
                                                .sort(([a], [b]) => new Date(b) - new Date(a))
                                                .map(([date, count]) => (
                                                    <div key={date} className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">
                                                            {new Date(date).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-900">{count}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Clicks */}
                                {stats.recentClicks && stats.recentClicks.length > 0 && (
                                    <div className="bg-white border rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-3">Recent Clicks</h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Time
                                                        </th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Device
                                                        </th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Browser
                                                        </th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            OS
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {stats.recentClicks.map((click, index) => (
                                                        <tr key={index}>
                                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                                {new Date(click.timestamp).toLocaleString()}
                                                            </td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                                {click.deviceType}
                                                            </td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                {click.browser}
                                                            </td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                {click.os}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No statistics available</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            onClick={onClose}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsModal;
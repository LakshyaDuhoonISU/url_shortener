import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import URLShortener from '../components/URLShortener';
import URLCard from '../components/URLCard';
import StatsModal from '../components/StatsModal';
import EditURLModal from '../components/EditURLModal';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUrl, setSelectedUrl] = useState(null);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        total: 1,
        totalUrls: 0,
    });

    useEffect(() => {
        fetchUrls();
    }, []);

    const fetchUrls = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const response = await api.get('/api/url/my-urls', {
                params: {
                    page,
                    limit: 10,
                    search,
                },
            });

            setUrls(response.data.urls);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching URLs:', error);
            toast.error('Failed to fetch URLs');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUrls(1, searchQuery);
    };

    const handleUrlCreated = (newUrl) => {
        setUrls(prev => [newUrl, ...prev]);
        setPagination(prev => ({
            ...prev,
            totalUrls: prev.totalUrls + 1,
        }));
    };

    const handleToggleStatus = async (url) => {
        try {
            const endpoint = url.isActive ? 'disable' : 'enable';
            await api.put(`/api/url/${url.id}/${endpoint}`);

            setUrls(prev => prev.map(u =>
                u.id === url.id
                    ? { ...u, isActive: !u.isActive }
                    : u
            ));

            toast.success(`URL ${url.isActive ? 'disabled' : 'enabled'} successfully`);
        } catch (error) {
            toast.error(`Failed to ${url.isActive ? 'disable' : 'enable'} URL`);
        }
    };

    const handleEdit = (url) => {
        setSelectedUrl(url);
        setShowEditModal(true);
    };

    const handleDelete = async (url) => {
        // Show confirmation dialog
        const isConfirmed = window.confirm(
            `Are you sure you want to permanently delete "${url.title || url.originalUrl}"?\n\nThis action cannot be undone.`
        );

        if (!isConfirmed) {
            return;
        }

        try {
            await api.delete(`/api/url/${url.id}`);

            // Remove the URL from the state
            setUrls(prev => prev.filter(u => u.id !== url.id));

            toast.success('URL deleted successfully');
        } catch (error) {
            console.error('Error deleting URL:', error);
            toast.error('Failed to delete URL');
        }
    };

    const handleViewStats = (url) => {
        setSelectedUrl(url);
        setShowStatsModal(true);
    };

    const handleUrlUpdated = (updatedUrl) => {
        setUrls(prev => prev.map(u =>
            u.id === updatedUrl.id ? updatedUrl : u
        ));
        setShowEditModal(false);
        setSelectedUrl(null);
    };

    const handlePageChange = (newPage) => {
        fetchUrls(newPage, searchQuery);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">URL Shortener</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Welcome back, {user?.name}!
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* URL Shortener Form */}
                <div className="mb-8">
                    <URLShortener onUrlCreated={handleUrlCreated} />
                </div>

                {/* Search */}
                <div className="mb-6">
                    <form onSubmit={handleSearch} className="flex space-x-4">
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search your URLs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">URLs</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total URLs
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {pagination.totalUrls}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">✓</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Active URLs
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {urls.filter(url => url.isActive).length}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">👁</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Clicks
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {urls.reduce((total, url) => total + url.clickCount, 0)}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* URLs List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading your URLs...</p>
                        </div>
                    ) : urls.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">
                                {searchQuery ? 'No URLs found matching your search.' : 'No URLs created yet. Create your first short URL above!'}
                            </p>
                        </div>
                    ) : (
                        urls.map((url) => (
                            <URLCard
                                key={url.id}
                                url={url}
                                onEdit={handleEdit}
                                onToggleStatus={handleToggleStatus}
                                onViewStats={handleViewStats}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pagination.total > 1 && (
                    <div className="mt-8 flex justify-center">
                        <nav className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(pagination.current - 1)}
                                disabled={pagination.current === 1}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            <span className="px-4 py-2 text-sm text-gray-700">
                                Page {pagination.current} of {pagination.total}
                            </span>

                            <button
                                onClick={() => handlePageChange(pagination.current + 1)}
                                disabled={pagination.current === pagination.total}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}
            </main>

            {/* Modals */}
            {showStatsModal && selectedUrl && (
                <StatsModal
                    url={selectedUrl}
                    isOpen={showStatsModal}
                    onClose={() => {
                        setShowStatsModal(false);
                        setSelectedUrl(null);
                    }}
                />
            )}

            {showEditModal && selectedUrl && (
                <EditURLModal
                    url={selectedUrl}
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedUrl(null);
                    }}
                    onUrlUpdated={handleUrlUpdated}
                />
            )}
        </div>
    );
};

export default Dashboard;
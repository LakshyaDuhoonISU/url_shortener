import { useState } from 'react';
import { LinkIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import toast from 'react-hot-toast';

const URLShortener = ({ onUrlCreated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        originalUrl: '',
        customSlug: '',
        title: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/api/url/shorten', formData);

            toast.success('URL shortened successfully!');
            onUrlCreated?.(response.data.url);

            // Reset form
            setFormData({
                originalUrl: '',
                customSlug: '',
                title: '',
                description: '',
            });
            setIsOpen(false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to shorten URL';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Create Short URL</h2>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    {isOpen ? (
                        <XMarkIcon className="h-4 w-4 mr-1" />
                    ) : (
                        <PlusIcon className="h-4 w-4 mr-1" />
                    )}
                    {isOpen ? 'Cancel' : 'New URL'}
                </button>
            </div>

            {isOpen && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700">
                            Original URL *
                        </label>
                        <div className="mt-1 relative">
                            <input
                                type="url"
                                id="originalUrl"
                                name="originalUrl"
                                required
                                placeholder="https://example.com/very-long-url"
                                value={formData.originalUrl}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                            <LinkIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="customSlug" className="block text-sm font-medium text-gray-700">
                            Custom Slug (optional)
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                id="customSlug"
                                name="customSlug"
                                placeholder="my-custom-url"
                                value={formData.customSlug}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Leave empty for auto-generated short code
                            </p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title (optional)
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Give your link a title"
                            value={formData.title}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description (optional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder="Add a description for your link"
                            value={formData.description}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </div>
                            ) : (
                                'Create Short URL'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default URLShortener;
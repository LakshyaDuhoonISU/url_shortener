import { useState } from 'react';
import {
    LinkIcon,
    DocumentDuplicateIcon,
    ChartBarIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const URLCard = ({ url, onEdit, onToggleStatus, onViewStats, onDelete }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url.shortUrl);
            setCopied(true);
            toast.success('URL copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy URL');
        }
    };

    const openInNewTab = () => {
        window.open(url.shortUrl, '_blank', 'noopener,noreferrer');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const truncateUrl = (url, maxLength = 50) => {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    };

    return (
        <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    {/* Title or Original URL */}
                    <div className="mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                            {url.title || truncateUrl(url.originalUrl)}
                        </h3>
                        {url.title && (
                            <p className="text-sm text-gray-500 truncate">{url.originalUrl}</p>
                        )}
                    </div>

                    {/* Short URL */}
                    <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-md px-3 py-2 flex-1">
                            <LinkIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-mono text-primary-600 truncate">
                                {url.shortUrl}
                            </span>
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
                            title="Copy to clipboard"
                        >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={openInNewTab}
                            className="p-2 text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
                            title="Open in new tab"
                        >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Description */}
                    {url.description && (
                        <p className="text-sm text-gray-600 mb-3">{url.description}</p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                            <ChartBarIcon className="h-4 w-4 mr-1" />
                            {url.clickCount} clicks
                        </span>
                        <span>Created {formatDate(url.createdAt)}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${url.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {url.isActive ? 'Active' : 'Disabled'}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                    <button
                        onClick={() => onViewStats(url)}
                        className="p-2 text-gray-400 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
                        title="View statistics"
                    >
                        <ChartBarIcon className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => onEdit(url)}
                        className="p-2 text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
                        title="Edit URL"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => onToggleStatus(url)}
                        className="p-2 text-gray-400 hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
                        title={url.isActive ? 'Disable URL' : 'Enable URL'}
                    >
                        {url.isActive ? (
                            <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                            <EyeIcon className="h-4 w-4" />
                        )}
                    </button>

                    <button
                        onClick={() => onDelete(url)}
                        className="p-2 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md"
                        title="Delete URL"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {copied && (
                <div className="mt-2 text-xs text-green-600 font-medium">
                    Copied to clipboard!
                </div>
            )}
        </div>
    );
};

export default URLCard;
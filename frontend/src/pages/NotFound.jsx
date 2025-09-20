import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon, LinkIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200">
                    <div className="text-center">
                        {/* Logo/Brand */}
                        <div className="mb-6">
                            <LinkIcon className="mx-auto h-12 w-12 text-blue-600" />
                            <h2 className="mt-2 text-lg font-semibold text-gray-900">URL Shortener</h2>
                        </div>

                        {/* 404 Number */}
                        <div className="text-8xl md:text-9xl font-bold text-blue-600 mb-4 tracking-tight">
                            404
                        </div>

                        {/* Error Message */}
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            Page Not Found
                        </h1>

                        <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed">
                            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <HomeIcon className="w-5 h-5 mr-2" />
                                Go to Dashboard
                            </Link>

                            <button
                                onClick={() => window.history.back()}
                                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                                Go Back
                            </button>
                        </div>

                        {/* Additional Help */}
                        <div className="pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-4 font-medium">
                                What you can do:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                    Check the URL for typos
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                    Refresh the page
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                    Go back to dashboard
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                    Create a new short URL
                                </div>
                            </div>
                        </div>

                        {/* Fun Easter Egg */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                Error 404: The short URL to this page is probably shorter than this error message! 🔗
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
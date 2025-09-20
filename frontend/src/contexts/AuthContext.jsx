import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

// Helper function to check if token is expired
const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp < currentTime;
    } catch (error) {
        return true;
    }
};

// Helper function to get token expiration time
const getTokenExpiration = (token) => {
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
        return null;
    }
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                loading: true,
                error: null,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                token: null,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                error: null,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

const initialState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null,
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Function to handle logout (used for both manual logout and automatic expiration)
    const performLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
    };

    // Function to set up automatic logout timer
    const setupAutoLogout = (token) => {
        const expirationTime = getTokenExpiration(token);
        if (expirationTime) {
            const timeUntilExpiration = expirationTime - Date.now();
            // Only set up auto-logout for tokens expiring within 24 hours
            // This prevents memory issues with very long timeouts (like 7 days)
            if (timeUntilExpiration > 0 && timeUntilExpiration <= 24 * 60 * 60 * 1000) {
                setTimeout(() => {
                    performLogout();
                    alert('Your session has expired. Please login again.');
                }, timeUntilExpiration);
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            // Check if token is expired
            if (isTokenExpired(token)) {
                // Token is expired, logout automatically
                performLogout();
                // Set loading to false since we're done checking
                dispatch({ type: 'LOGIN_FAILURE', payload: 'Session expired' });
                return;
            }

            // Token is valid, restore authentication state
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    token,
                    user: JSON.parse(user),
                },
            });

            // Set up automatic logout when token expires
            setupAutoLogout(token);
        } else {
            // No token/user found, set loading to false
            dispatch({ type: 'LOGIN_FAILURE', payload: null });
        }
    }, []);

    const login = async (email, password) => {
        try {
            dispatch({ type: 'LOGIN_START' });

            const response = await api.post('/api/auth/login', {
                email,
                password,
            });

            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { token, user },
            });

            // Set up automatic logout for new token
            setupAutoLogout(token);

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: errorMessage,
            });
            return { success: false, error: errorMessage };
        }
    };

    const register = async (name, email, password) => {
        try {
            dispatch({ type: 'LOGIN_START' });

            const response = await api.post('/api/auth/register', {
                name,
                email,
                password,
            });

            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { token, user },
            });

            // Set up automatic logout for new token
            setupAutoLogout(token);

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: errorMessage,
            });
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        performLogout();
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
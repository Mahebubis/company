import axios from 'axios';

// API Base URL - Update this to your actual API URL
const API_BASE_URL = 'https://company.internshipstudio.com/api'; // Change this as needed

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Attach token to every request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('tpo_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 Unauthorized globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('tpo_token');
            localStorage.removeItem('tpo_token_expiry');
            localStorage.removeItem('tpo_user');
            window.location.href = '/login';
        }
        return Promise.reject(
            error.response?.data || { success: false, message: 'Network error' }
        );
    }
);


// API Service
const apiService = {
    /**
     * Login user
     * @param {Object} credentials - { email, password }
     * @returns {Promise}
     */
    login: async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login.php', credentials);

            if (response.data.success && response.data.data.token) {
                localStorage.setItem('tpo_token', response.data.data.token);
                localStorage.setItem('tpo_token_expiry', response.data.data.expiresAt);
                localStorage.setItem('tpo_user', JSON.stringify(response.data.data.user));
            }


            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Login failed' };
        }
    },

    /**
 * Fetch dashboard stats
 * @returns {Promise}
 */
    getDashboardStats: async () => {
        const response = await apiClient.get('/companies/dashboard.php');
        return response.data.data;
    },

    /**
     * Fetch paginated company list
     * @param {Object} params
     * @returns {Promise}
     */
    getCompaniesList: async (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
        );

        const response = await apiClient.get('/auth/list.php', {
            params: cleanParams,
        });

        return response.data.data; // { companies, pagination }
    },


    /**
     * Validate current session
     * @returns {Promise}
     */
    validateSession: async () => {
        try {
            const token = localStorage.getItem('tpo_token');

            if (!token) {
                return { success: false, message: 'No token found' };
            }

            const response = await apiClient.post('/auth/validate.php', { token });
            return response.data;
        } catch (error) {
            // If validation fails, clear localStorage
            localStorage.removeItem('tpo_token');
            localStorage.removeItem('tpo_token_expiry');
            throw error.response?.data || { success: false, message: 'Session validation failed' };
        }
    },

    /**
     * Logout user
     * @returns {Promise}
     */
    logout: async () => {
        try {
            const token = localStorage.getItem('tpo_token');

            if (token) {
                await apiClient.post('/auth/logout.php', { token });
            }

            // Clear localStorage
            localStorage.removeItem('tpo_token');
            localStorage.removeItem('tpo_token_expiry');

            return { success: true };
        } catch (error) {
            // Clear localStorage even if API call fails
            localStorage.removeItem('tpo_token');
            localStorage.removeItem('tpo_token_expiry');
            return { success: true };
        }
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated: () => {
        const token = localStorage.getItem('tpo_token');
        const expiry = localStorage.getItem('tpo_token_expiry');

        if (!token || !expiry) {
            return false;
        }

        // Check if token is expired
        const expiryDate = new Date(expiry);
        if (expiryDate < new Date()) {
            localStorage.removeItem('tpo_token');
            localStorage.removeItem('tpo_token_expiry');
            return false;
        }

        return true;
    },
};

export const dashboardApi = {
    getStats: apiService.getDashboardStats,
};

export const companiesApi = {
    list: apiService.getCompaniesList,
};



export default apiService;
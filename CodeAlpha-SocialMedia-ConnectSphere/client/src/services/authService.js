import api from '../api/axiosInstance';

/**
 * Register a new user
 * @param {{ username: string, email: string, password: string }} data
 */
export const registerUser = (data) => api.post('/auth/register', data);

/**
 * Login an existing user
 * @param {{ email: string, password: string }} data
 */
export const loginUser = (data) => api.post('/auth/login', data);

/**
 * Get the current authenticated user's profile
 */
export const getMyProfile = () => api.get('/auth/profile');

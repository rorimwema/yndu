import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '../graphql/types';

// Auth-related types
export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    preferredLanguage?: 'en' | 'sw';
}

export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    preferredLanguage?: 'en' | 'sw';
}

// Storage keys
const STORAGE_KEYS = {
    TOKEN: 'yndu_auth_token',
    REFRESH_TOKEN: 'yndu_refresh_token',
    USER: 'yndu_user',
} as const;

// Mock API responses for development
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref<User | null>(null);
    const token = ref<string | null>(null);
    const refreshToken = ref<string | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Getters
    const isAuthenticated = computed(() => !!token.value && !!user.value);
    const userFullName = computed(() => {
        if (!user.value?.profile) return '';
        return `${user.value.profile.firstName} ${user.value.profile.lastName}`;
    });
    const userInitials = computed(() => {
        if (!user.value?.profile) return '';
        return `${user.value.profile.firstName[0]}${user.value.profile.lastName[0]}`.toUpperCase();
    });

    // Initialize from localStorage on store creation
    // Note: in SSR this needs care, usually we init from cookie or client-only
    const initAuth = () => {
        if (import.meta.server) return; // Skip on server if using localStorage

        // In Nuxt useCookie is preferred but let's stick to localStorage for quick migration
        // We can wrap in onMounted in the component or use client-only init

        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
            try {
                token.value = storedToken;
                refreshToken.value = storedRefreshToken;
                user.value = JSON.parse(storedUser);
            } catch (e) {
                // Invalid stored data, clear it
                clearAuthData();
            }
        }
    };

    // Persist auth data to localStorage
    const persistAuthData = () => {
        if (import.meta.server) return;

        if (token.value) {
            localStorage.setItem(STORAGE_KEYS.TOKEN, token.value);
        }
        if (refreshToken.value) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken.value);
        }
        if (user.value) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user.value));
        }
    };

    // Clear auth data from state and storage
    const clearAuthData = () => {
        user.value = null;
        token.value = null;
        refreshToken.value = null;

        if (import.meta.server) return;
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
    };

    // Actions
    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        isLoading.value = true;
        error.value = null;

        try {
            // Mock API call - replace with actual API integration
            await mockDelay(1000);

            // Simulate validation
            if (!credentials.email || !credentials.password) {
                throw new Error('Email and password are required');
            }

            // Simulate login success (mock user)
            const mockUser: User = {
                id: 'user-' + Date.now(),
                email: credentials.email,
                phone: '+254700000000',
                profile: {
                    firstName: 'John',
                    lastName: 'Doe',
                    preferredLanguage: 'en',
                },
                addresses: [],
                createdAt: new Date().toISOString(),
            };

            user.value = mockUser;
            token.value = 'mock-jwt-token-' + Date.now();
            refreshToken.value = 'mock-refresh-token-' + Date.now();

            persistAuthData();
            return true;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Login failed';
            return false;
        } finally {
            isLoading.value = false;
        }
    };

    const register = async (data: RegisterData): Promise<boolean> => {
        isLoading.value = true;
        error.value = null;

        try {
            // Mock API call - replace with actual API integration
            await mockDelay(1500);

            // Simulate validation
            if (!data.email || !data.password || !data.firstName || !data.lastName) {
                throw new Error('All fields are required');
            }

            if (data.password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            // Simulate registration success (mock user)
            const mockUser: User = {
                id: 'user-' + Date.now(),
                email: data.email,
                phone: data.phone,
                profile: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    preferredLanguage: data.preferredLanguage || 'en',
                },
                addresses: [],
                createdAt: new Date().toISOString(),
            };

            user.value = mockUser;
            token.value = 'mock-jwt-token-' + Date.now();
            refreshToken.value = 'mock-refresh-token-' + Date.now();

            persistAuthData();
            return true;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Registration failed';
            return false;
        } finally {
            isLoading.value = false;
        }
    };

    const logout = async (): Promise<void> => {
        isLoading.value = true;

        try {
            // Mock API call to invalidate token - replace with actual API
            await mockDelay(500);
            clearAuthData();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            isLoading.value = false;
        }
    };

    const refreshAccessToken = async (): Promise<boolean> => {
        try {
            if (!refreshToken.value) {
                throw new Error('No refresh token available');
            }

            // Mock API call - replace with actual API integration
            await mockDelay(800);

            // Simulate token refresh
            token.value = 'mock-jwt-token-refreshed-' + Date.now();
            persistAuthData();
            return true;
        } catch (err) {
            clearAuthData();
            return false;
        }
    };

    const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
        isLoading.value = true;
        error.value = null;

        try {
            // Mock API call - replace with actual API integration
            await mockDelay(800);

            if (!user.value) {
                throw new Error('User not authenticated');
            }

            user.value = {
                ...user.value,
                profile: {
                    ...user.value.profile,
                    ...data,
                },
            };

            persistAuthData();
            return true;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to update profile';
            return false;
        } finally {
            isLoading.value = false;
        }
    };

    const forgotPassword = async (email: string): Promise<boolean> => {
        isLoading.value = true;
        error.value = null;

        try {
            // Mock API call - replace with actual API integration
            await mockDelay(1000);

            if (!email) {
                throw new Error('Email is required');
            }

            // Simulate sending reset email
            return true;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to send reset email';
            return false;
        } finally {
            isLoading.value = false;
        }
    };

    const clearError = () => {
        error.value = null;
    };

    return {
        // State
        user,
        token,
        refreshToken,
        isLoading,
        error,
        // Getters
        isAuthenticated,
        userFullName,
        userInitials,
        // Actions
        initAuth,
        login,
        register,
        logout,
        refreshAccessToken,
        updateProfile,
        forgotPassword,
        clearError,
    };
});

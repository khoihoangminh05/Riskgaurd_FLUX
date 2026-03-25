'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { toast } from 'sonner';

interface Company {
    id: string;
    ticker: string;
    name?: string;
    industry?: string;
    sector?: string;
    isSetupComplete?: boolean;
}

interface User {
    id: string;
    email: string;
    fullName: string;
    isSetupComplete: boolean;
    company: Company;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    updateCompany: (updatedCompany: Company) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:3000'; 

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const token = Cookies.get('access_token');

        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        } else {
            setUser(null);
            localStorage.removeItem('user');
            Cookies.remove('access_token');
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { access_token, user: userData } = response.data;

            Cookies.set('access_token', access_token, { expires: 1 }); // 1 day
            Cookies.set('is_setup_complete', String(userData.company.isSetupComplete), { expires: 1 });

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            toast.success('Logged in successfully');

            return userData;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw error;
        }
    };

    const register = async (data: any) => {
        try {
            await axios.post(`${API_URL}/auth/register`, data);
            toast.success('Registration successful! Please login.');
            router.push('/login');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        Cookies.remove('access_token');
        Cookies.remove('is_setup_complete');
        router.push('/login');
        toast.info('Logged out');
    };

    const updateCompany = (updatedCompany: Company) => {
        if (user) {
            const newUser = { ...user, company: updatedCompany };
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateCompany }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

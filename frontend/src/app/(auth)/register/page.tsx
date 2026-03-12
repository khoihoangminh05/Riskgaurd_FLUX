'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { User, Mail, Lock, Building, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    const { register: registerAuth } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data: any) => {
        await registerAuth(data);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-white">Create your account</h2>
                <p className="text-slate-400 text-sm mt-1">Start managing your enterprise risks today</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 block">Company Name</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            {...register('companyName', { required: 'Company name is required' })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            placeholder="e.g. Acme Corp"
                        />
                    </div>
                    {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 block">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            {...register('fullName', { required: 'Full name is required' })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            placeholder="John Doe"
                        />
                    </div>
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 block">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            placeholder="john@example.com"
                        />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 block">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="password"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Minimum 6 characters' }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message as string}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all mt-4 group"
                >
                    {isSubmitting ? 'Creating account...' : (
                        <>
                            Register
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="text-center pt-2">
                <p className="text-slate-400 text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

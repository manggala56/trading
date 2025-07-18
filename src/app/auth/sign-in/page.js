    // app/auth/sign-in/page.js
    'use client'; // Ini adalah Client Component

    import { useState } from 'react';
    import { supabase } from '../../../lib/supabase'; // Sesuaikan path jika perlu
    import { useRouter } from 'next/navigation';

    export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        });

        if (error) {
        setMessage(`Error: ${error.message}`);
        } else {
        setMessage('Login berhasil! Mengarahkan ke jurnal...');
        router.push('/journal'); // Arahkan ke halaman jurnal setelah login
        }
        setLoading(false);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = await supabase.auth.signUp({
        email,
        password,
        });

        if (error) {
        setMessage(`Error: ${error.message}`);
        } else {
        setMessage('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login atau Daftar</h2>
            <form className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
                </label>
                <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
                </label>
                <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                />
            </div>
            {message && (
                <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {message}
                </p>
            )}
            <div className="flex justify-between space-x-4">
                <button
                type="submit"
                onClick={handleSignIn}
                disabled={loading}
                className="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                {loading ? 'Memuat...' : 'Login'}
                </button>
                <button
                type="submit"
                onClick={handleSignUp}
                disabled={loading}
                className="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                {loading ? 'Memuat...' : 'Daftar'}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
    }

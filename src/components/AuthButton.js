    // components/AuthButton.js
    'use client'; // Ini adalah Client Component

    import { useState, useEffect } from 'react';
    import { supabase } from '../lib/supabase'; // Sesuaikan path jika perlu
    import { useRouter } from 'next/navigation';

    export default function AuthButton() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Pastikan kita mendapatkan objek 'subscription' dari data yang dikembalikan
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        // Opsional: Redirect jika sesi berakhir atau berubah signifikan (misal: SIGNED_OUT)
        if (_event === 'SIGNED_OUT') {
            router.push('/'); // Arahkan ke halaman beranda setelah logout
        }
        });

        // Ambil sesi awal saat komponen dimuat (di sisi klien)
        // Ini penting untuk memastikan state user benar saat pertama kali komponen dirender di klien
        supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
        });

        // Fungsi cleanup untuk menghentikan listener saat komponen di-unmount
        return () => {
        if (subscription) { // Pastikan subscription ada sebelum memanggil unsubscribe
            subscription.unsubscribe();
        }
        };
    }, [router]); // Tambahkan router sebagai dependency karena digunakan di dalam useEffect

    const handleSignIn = async () => {
        router.push('/auth/sign-in');
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
        console.error('Error signing out:', error.message);
        } else {
        // setUser(null) akan dilakukan oleh onAuthStateChange listener
        // router.push('/') akan dilakukan oleh onAuthStateChange listener
        // Setelah logout berhasil, listener akan memicu perubahan state dan redirect
        }
    };

    return (
        <div>
        {user ? (
            <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
            >
            Logout ({user.email || user.id.substring(0, 8) + '...'}) {/* Tampilkan sebagian ID jika email tidak ada */}
            </button>
        ) : (
            <button
            onClick={handleSignIn}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
            >
            Login
            </button>
        )}
        </div>
    );
    }

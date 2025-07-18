    // app/api/webhook/route.js
    import { NextResponse } from 'next/server';
    import { supabase } from '../../../lib/supabase'; // Sesuaikan path jika perlu

    export async function POST(request) {
    // Ambil secret key dari variabel lingkungan
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    // Pastikan secret key ada
    if (!WEBHOOK_SECRET) {
        console.error("WEBHOOK_SECRET tidak diatur di variabel lingkungan.");
        return NextResponse.json({ message: 'Server error: Webhook secret not configured.' }, { status: 500 });
    }

    // Ambil data JSON dari body request
    const data = await request.json();

    // Ambil secret key dari payload TradingView
    const incomingSecret = data.secret;

    // Validasi secret key
    if (incomingSecret !== WEBHOOK_SECRET) {
        console.warn('Percobaan akses webhook tidak sah:', data);
        return NextResponse.json({ message: 'Unauthorized access.' }, { status: 401 });
    }

    // Hapus secret key dari data sebelum disimpan ke database
    delete data.secret;

    // Log data yang diterima (untuk debugging)
    console.log('Data diterima dari TradingView:', data);

    // --- Proses penyimpanan data ke Supabase ---
    try {
        // Asumsi Anda memiliki tabel bernama 'trading_journal' di Supabase
        // dengan kolom yang sesuai dengan data dari TradingView.
        // Misalnya: action, symbol, price, strategy_name, time (timestamp), qty
        // Kolom 'time' dari TradingView adalah Unix timestamp dalam milidetik,
        // ubah menjadi format tanggal yang bisa disimpan di PostgreSQL jika perlu.
        const timestamp = new Date(parseInt(data.time)); // Konversi ke objek Date

            const { error } = await supabase
            .from('trading_journal')
            .insert({
                action: data.action,
                symbol: data.symbol,
                price: parseFloat(data.price), // Pastikan tipe data sesuai (float/numeric)
                strategy_name: data.strategy_name,
                trade_time: timestamp.toISOString(), // Simpan sebagai ISO string untuk timestamp
                quantity: parseFloat(data.qty), // Pastikan tipe data sesuai
                // Anda bisa menambahkan kolom lain seperti user_id jika sudah ada autentikasi
                // user_id: auth.currentUser?.id,
            });

            if (error) {
            console.error('Error saat menyimpan data ke Supabase:', error);
            return NextResponse.json({ message: 'Failed to save data.', error: error.message }, { status: 500 });
            }

        console.log('Data berhasil disimpan ke Supabase.');
        return NextResponse.json({ message: 'Data received and saved successfully!' }, { status: 200 });

        } catch (error) {
            console.error('Error saat memproses webhook:', error);
            return NextResponse.json({ message: 'Internal server error.', error: error.message }, { status: 500 });
        }
    }

    // Catatan Penting:
    // 1. Anda perlu membuat tabel 'trading_journal' di Supabase dengan kolom yang sesuai.
    //    Contoh SQL untuk membuat tabel:
    /*
    CREATE TABLE trading_journal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    symbol TEXT NOT NULL,
    price NUMERIC NOT NULL,
    strategy_name TEXT,
    trade_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quantity NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    */
    // 2. Pastikan Anda mengatur `WEBHOOK_SECRET` di file `.env.local` Anda:
    //    WEBHOOK_SECRET="your_secure_random_string_here"
    // 3. Saat mengkonfigurasi webhook di TradingView, URL-nya akan menjadi:
    //    `https://<your-vercel-deployment-url>/api/webhook`
    //    Dan di bagian "Message", Anda harus menyertakan secret key Anda:
    //    `{"action":"{{strategy.order.action}}","symbol":"{{ticker}}","price":"{{strategy.order.price}}","strategy_name":"{{strategy.name}}","time":"{{timenow}}","qty":"{{strategy.order.contracts}}", "secret":"your_secure_random_string_here"}`

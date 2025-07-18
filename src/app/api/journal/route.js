    // app/api/journal/route.js
    import { NextResponse } from 'next/server';
    import { createServerSupabaseClient } from '../../../lib/supabase-server'; //

    export async function GET(request) {
    try {
        // Dapatkan instance Supabase client untuk sisi server
        const supabaseServer = createServerSupabaseClient(); //

        let user = null;
        // Dapatkan informasi pengguna yang sedang login
        // user bisa null jika tidak ada yang login
        const { data: { user: fetchedUser }, error: userError } = await supabaseServer.auth.getUser(); //

        if (userError) {
        // Log the error but do not stop the request.
        // This allows the API to proceed without a user context.
        console.warn('Could not retrieve user session for /api/journal:', userError.message);
        // user will remain null, so the query will not filter by user_id
        } else {
        user = fetchedUser; // Assign the fetched user if no error occurred
        }

        // Inisialisasi query dasar untuk tabel trading_journal
        let baseQuery = supabaseServer
        .from('trading_journal')
        .select('*') // Pilih semua kolom
        .order('trade_time', { ascending: false }); // Urutkan berdasarkan waktu trading terbaru
        let query = baseQuery.limit(1);
        if (user) { //
        // If a user is successfully identified, filter results by their user_id
        query = query.eq('user_id', user.id);
        }

        const { data, error } = await query; //

        if (error) {
        console.error('Error fetching trading journal entries from API:', error); //
        return NextResponse.json({ message: 'Failed to fetch journal data.', error: error.message }, { status: 500 }); //
        }

        // Kembalikan data sebagai respons JSON
        return NextResponse.json(data, { status: 200 }); //

    } catch (error) {
        console.error('Error in GET /api/journal:', error); //
        return NextResponse.json({ message: 'Internal server error.', error: error.message }, { status: 500 }); //
    }
    }
    // app/api/journal/route.js
    import { NextResponse } from 'next/server';
    import { createServerSupabaseClient } from '../../../lib/supabase-server';

    export async function GET(request) {
    try {
        const supabaseServer = createServerSupabaseClient();

        let user = null;
        const { data: { user: fetchedUser }, error: userError } = await supabaseServer.auth.getUser();

        if (userError) {
        console.warn('Could not retrieve user session for /api/journal:', userError.message);
        } else {
        user = fetchedUser;
        }

        // Hitung waktu 5 menit yang lalu dari sekarang
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        // Inisialisasi query dengan filter waktu
        let baseQuery = supabaseServer
        .from('trading_journal')
        .select('*')
        .gte('trade_time', fiveMinutesAgo) // Hanya data dengan trade_time >= 5 menit yang lalu disable jika tidak perlu
        .order('trade_time', { ascending: false });

        let query = baseQuery;
        if (user) {
        query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
        console.error('Error fetching trading journal entries from API:', error);
        return NextResponse.json({ message: 'Failed to fetch journal data.', error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Error in GET /api/journal:', error);
        return NextResponse.json({ message: 'Internal server error.', error: error.message }, { status: 500 });
    }
    }
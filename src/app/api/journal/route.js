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

        // Get table name from environment variable, default to 'trading_journal' if not set
        const tableName = process.env.SUPABASE_JOURNAL_TABLE_NAME || 'trading_journal';

        // Check if time filter should be enabled from environment variable
        // Convert to boolean: 'true' string becomes true, anything else (including undefined) becomes false
        const enableTimeFilter = process.env.ENABLE_JOURNAL_TIME_FILTER === 'true';
        const timeFilterMinutes = parseInt(process.env.JOURNAL_TIME_FILTER_MINUTES) || 5;

        // Initialize query
        let baseQuery = supabaseServer
        .from(tableName) // Use dynamic table name
        .select('*')
        .order('trade_time', { ascending: false });

        // Apply time filter conditionally
        if (enableTimeFilter) {
        const fiveMinutesAgo = new Date(Date.now() - timeFilterMinutes * 60 * 1000).toISOString();
        baseQuery = baseQuery.gte('trade_time', fiveMinutesAgo);
        }

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

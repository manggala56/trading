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
        const oneresponse = process.env.ONE_RESPONSE === 'true';
        const enableTimeFilter = process.env.ENABLE_JOURNAL_TIME_FILTER === 'true';
        const timeFilterMinutes = parseInt(process.env.JOURNAL_TIME_FILTER_MINUTES) || 5;

        // Initialize query
        let baseQuery = supabaseServer
        .from(tableName) // Use dynamic table name
        .select('*')
        .order('trade_time', { ascending: false });

        // Apply time filter conditionally
        if (enableTimeFilter) {
        const timeFilterValue = new Date(Date.now() - timeFilterMinutes * 60 * 1000).toISOString();
        baseQuery = baseQuery.gte('trade_time', timeFilterValue);
        }

        // **[NEW]** If oneresponse is enabled, filter out records already marked as 'used'
        if (oneresponse) {
        baseQuery = baseQuery.neq('status', 'used');
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

        // **[NEW]** If oneresponse is enabled and data was fetched, update the records to 'used'
        if (oneresponse && data && data.length > 0) {
        const recordIds = data.map(entry => entry.id);

        // Perform the update asynchronously without awaiting it.
        // This prevents delaying the API response to the client.
        supabaseServer
            .from(tableName)
            .update({ status: 'used' })
            .in('id', recordIds)
            .then(({ error: updateError }) => {
            if (updateError) {
                console.error('Error updating records to "used":', updateError.message);
            } else {
                console.log(`Successfully marked ${recordIds.length} record(s) as 'used'.`);
            }
            });
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Error in GET /api/journal:', error);
        return NextResponse.json({ message: 'Internal server error.', error: error.message }, { status: 500 });
    }
    }
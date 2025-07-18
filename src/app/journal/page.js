        // import { supabase } from '../../lib/supabase'; 
        import { createServerSupabaseClient } from '../../lib/supabase-server'; 
        import AuthButton from '../../components/AuthButton';

        async function getTradingJournalEntries() {
            const supabase = createServerSupabaseClient();
            const { data, error } = await supabase
            .from('trading_journal')
            .select('*')
            .order('trade_time', { ascending: false });
        
            if (error) {
            console.error('Error fetching trading journal entries:', error);
            return [];
            }
            return data;
        }

        export default async function JournalPage() {
        const entries = await getTradingJournalEntries();

        return (
            <div className="min-h-screen bg-gray-100 p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Jurnal Trading Anda</h1>
                <AuthButton /> {/* Tombol login/logout */}
            </header>

            <div className="bg-white shadow-lg rounded-lg p-6">
                {entries.length === 0 ? (
                <p className="text-center text-gray-600">Belum ada entri jurnal trading.</p>
                ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                            Aksi
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Simbol
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Harga
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Strategi
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Waktu Trading
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                            Jumlah
                        </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {entries.map((entry) => (
                        <tr key={entry.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                entry.action === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {entry.action}
                            </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.symbol}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.price}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.strategy_name || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(entry.trade_time).toLocaleString('id-ID')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.quantity}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </div>
            </div>
        );
        }

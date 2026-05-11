import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../App';
import { Wallet, Plus, Copy, Check, ExternalLink } from 'lucide-react';

export default function Dashboard({ user, refreshUser }) {
  const [quotes, setQuotes] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [withdrawError, setWithdrawError] = useState('');

  const fetchQuotes = async () => {
    try {
      const res = await api.get('/quotes');
      setQuotes(res.data);
    } catch (error) {
      console.error('Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    if (!withdrawAmount || isNaN(withdrawAmount) || parseFloat(withdrawAmount) <= 0) {
      return setWithdrawError('Enter a valid amount');
    }

    try {
      await api.post('/withdraw', { amount: withdrawAmount });
      setWithdrawAmount('');
      refreshUser(); // Refresh balance
      alert('Withdrawal successful!');
    } catch (error) {
      setWithdrawError(error.response?.data?.error || 'Failed to withdraw');
    }
  };

  const copyToClipboard = (id) => {
    const url = `${window.location.origin}/pay/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2">
            <Wallet size={16} /> Available Balance
          </h3>
          <div className="text-3xl font-bold">NRS {user.balance.toFixed(2)}</div>
        </div>

        <form onSubmit={handleWithdraw} className="flex gap-2 w-full md:w-auto">
          <div className="flex-1 md:w-48">
             <input
              type="number"
              placeholder="Amount to withdraw"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              max={user.balance}
            />
            {withdrawError && <div className="text-xs text-red-500 mt-1">{withdrawError}</div>}
          </div>

          <button
            type="submit"
            disabled={user.balance <= 0}
            className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition whitespace-nowrap"
          >
            Withdraw
          </button>
        </form>
      </div>

      {/* Quotes List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Your Quotes</h3>
          <Link
            to="/create"
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus size={16} /> New Quote
          </Link>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading quotes...</div>
        ) : quotes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No quotes created yet. Create one to start accepting payments!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{quote.title}</div>
                      {quote.description && <div className="text-sm text-gray-500 truncate max-w-xs">{quote.description}</div>}
                    </td>
                    <td className="p-4 font-medium">NRS {quote.amount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        quote.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <button
                        onClick={() => copyToClipboard(quote.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Copy payment link"
                      >
                        {copiedId === quote.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                      </button>
                      <Link
                        to={`/pay/${quote.id}`}
                        target="_blank"
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                        title="Open payment page"
                      >
                        <ExternalLink size={18} />
                      </Link>
                    </td>
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

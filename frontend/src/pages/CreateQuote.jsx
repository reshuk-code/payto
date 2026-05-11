import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../App';
import { ArrowLeft } from 'lucide-react';

export default function CreateQuote() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/quotes', { title, description, amount });
      navigate('/');
    } catch (err) {
      setError('Failed to create quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6">Create New Quote</h2>

        {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product/Service Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Design Package"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about what is included..."
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (NRS)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">NRS</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="1"
                className="w-full p-2 pl-12 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Note: A 15% platform fee will be deducted when you withdraw these funds.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Generate Quote Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

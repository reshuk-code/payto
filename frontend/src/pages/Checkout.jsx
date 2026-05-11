import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Checkout() {
  const { quoteId } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/quotes/${quoteId}`);
        setQuote(res.data);
      } catch (err) {
        setError('Quote not found or invalid link');
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [quoteId]);

  const handlePayment = async () => {
    setPaying(true);
    try {
      // Simulate real-world payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      await axios.post(`http://localhost:3001/api/quotes/${quoteId}/pay`);
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading quote details...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg mb-4">
          {error}
        </div>
      </div>
    );
  }

  if (success || quote.status === 'PAID') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          NRS {quote.amount.toFixed(2)} has been securely transferred to {quote.user.name}.
        </p>
        <div className="bg-gray-50 p-4 rounded text-sm text-left">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Reference:</span>
            <span className="font-mono text-gray-900">{quote.id.split('-')[0].toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date:</span>
            <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-500 mt-2">You are paying {quote.user.name}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100">
          <h2 className="text-xl font-semibold mb-2">{quote.title}</h2>
          {quote.description && <p className="text-gray-600 text-sm mb-6">{quote.description}</p>}

          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
            <span className="text-gray-600 font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">NRS {quote.amount.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-gray-50/50">
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded">
            <ShieldCheck size={18} />
            <span>This is a secure Sandbox Payment Environment</span>
          </div>

          <button
            onClick={handlePayment}
            disabled={paying}
            className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-75 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {paying ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                Processing...
              </>
            ) : (
              `Pay NRS ${quote.amount.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

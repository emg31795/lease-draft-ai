'use client';

import { useState } from 'react';

// Self-serve "lost my document" flow. Exists because the only path to a paid document
// used to be the live tab that came back from Stripe — close it, and the purchase was
// gone with no way to get it back. See api/recover.js for how the lookup works.
export default function RecoverPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'found' | 'not-found' | 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      if (data.found) {
        setStatus('found');
        window.location.href = `/success?session_id=${encodeURIComponent(data.sessionId)}`;
        return;
      }

      setStatus('not-found');
      setMessage(data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="border-b bg-white py-4 px-6 mb-8 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <a href="/" className="text-xl font-bold text-blue-600">LeaseDraft AI</a>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pb-16">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Recover Your Document</h1>
          <p className="text-slate-600 text-sm mb-6">
            Lost the tab before downloading your PDF? Enter the email you used at checkout
            and we'll pull up your most recent paid order.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email used at checkout</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow transition duration-150"
            >
              {status === 'loading' ? 'Looking up your order...' : 'Find My Document'}
            </button>
          </form>

          {status === 'not-found' && (
            <p className="text-sm text-slate-600 mt-4">{message}</p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-600 font-medium mt-4">{message}</p>
          )}

          <p className="text-xs text-slate-500 mt-6">
            Still stuck? Email{' '}
            <a href="mailto:maarketeer@gmail.com" className="text-blue-600 underline">
              maarketeer@gmail.com
            </a>{' '}
            with your Stripe receipt and we'll send your document directly.
          </p>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [fullText, setFullText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('No checkout session found. Please return to the generator and try again.');
      return;
    }

    let cancelled = false;

    fetch(`/api/deliver?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Unable to retrieve your document.');
        }
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setFullText(data.fullText);
        setStatus('ready');
      })
      .catch((error) => {
        if (cancelled) return;
        setErrorMessage(error.message);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <header className="border-b bg-white py-4 px-6 mb-8 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">LeaseDraft AI</span>
          {status === 'ready' && (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              Payment Confirmed
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-100">
          {status === 'loading' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Retrieving your document...</h1>
              <p className="text-slate-600 text-sm">
                We're confirming your payment with Stripe and drafting your notice. This takes a few seconds.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">We couldn't load your document</h1>
              <p className="text-slate-600 text-sm mb-4">{errorMessage}</p>
              <p className="text-slate-600 text-sm">
                If you were charged and are seeing this message, contact support with your Stripe receipt
                and we'll get your document to you directly.
              </p>
              <a
                href="/"
                className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
              >
                Return to Generator
              </a>
            </>
          )}

          {status === 'ready' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Your Document is Ready</h1>
              <p className="text-slate-600 text-sm mb-6">
                Thank you for your purchase. You can copy your complete legal draft below or save it directly as a PDF.
              </p>

              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-sm font-mono whitespace-pre-wrap leading-relaxed min-h-[300px] mb-6 select-all">
                {fullText}
              </div>

              <button
                onClick={() => window.print()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition duration-150"
              >
                Print / Save as Official PDF
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}

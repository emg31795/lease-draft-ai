'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [fullText, setFullText] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('Legal Notice');
  const [errorMessage, setErrorMessage] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

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
        if (data.noticeType || data.state) {
          setNoticeTitle([data.noticeType, data.state].filter(Boolean).join(' — '));
        }
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

  const handleDownloadPdf = async () => {
    setDownloading(true);
    setDownloadError('');

    try {
      const res = await fetch('/api/render-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullText, title: noticeTitle }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to generate your PDF right now.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'LeaseDraft-Notice.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(error.message);
    } finally {
      setDownloading(false);
    }
  };

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
                If you were charged and are seeing this message, use the recovery tool below to pull up your
                order by the email you paid with, or email{' '}
                <a href="mailto:maarketeer@gmail.com" className="text-blue-600 underline">
                  maarketeer@gmail.com
                </a>{' '}
                with your Stripe receipt and we'll get your document to you directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <a
                  href="/recover"
                  className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition text-center"
                >
                  Recover My Document
                </a>
                <a
                  href="/"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition text-center"
                >
                  Return to Generator
                </a>
              </div>
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
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow transition duration-150"
              >
                {downloading ? 'Preparing your PDF...' : 'Download Official PDF'}
              </button>
              {downloadError && (
                <p className="text-sm text-red-600 font-medium mt-3">{downloadError}</p>
              )}
              <button
                onClick={() => window.print()}
                className="w-full mt-2 text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Having trouble downloading? Print this page instead
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

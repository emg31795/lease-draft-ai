import React, { useState } from 'react';

export default function LeaseDraftApp() {
  const [formData, setFormData] = useState({
    state: 'California',
    noticeType: '30-Day Notice to Vacate',
    landlordName: '',
    tenantName: '',
    propertyAddress: '',
  });

  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedDoc('');

    try {
      const response = await fetch('/api/generate-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setGeneratedDoc(data.documentText);
    } catch (err) {
      console.error(err);
      alert('Error generating document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="border-b bg-white py-4 px-6 flex justify-between items-center shadow-sm">
        <span className="text-2xl font-bold text-blue-600">LeaseDraft<span className="text-slate-800">AI</span></span>
        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">State-Compliant Legal Notices</span>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Generate Official Landlord Notices in Seconds
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Select your state, input basic property details, and let AI generate legally structured lease notices instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800">1. Document Details</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Property State</label>
                <select 
                  className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-slate-800"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                >
                  <option>California</option>
                  <option>Texas</option>
                  <option>Florida</option>
                  <option>New York</option>
                  <option>Ohio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Notice Type</label>
                <select 
                  className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-slate-800"
                  value={formData.noticeType}
                  onChange={(e) => setFormData({...formData, noticeType: e.target.value})}
                >
                  <option>30-Day Notice to Vacate</option>
                  <option>Notice of Rent Increase</option>
                  <option>Lease Violation Warning</option>
                  <option>Security Deposit Deduction Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Landlord/Manager Name</label>
                <input 
                  type="text" required placeholder="e.g. John Smith LLC"
                  className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-slate-800"
                  value={formData.landlordName}
                  onChange={(e) => setFormData({...formData, landlordName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Tenant Name(s)</label>
                <input 
                  type="text" required placeholder="e.g. Jane Doe"
                  className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-slate-800"
                  value={formData.tenantName}
                  onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Rental Address</label>
                <input 
                  type="text" required placeholder="123 Main St, Apt 4B, City, State"
                  className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-slate-800"
                  value={formData.propertyAddress}
                  onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})}
                />
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200 shadow"
              >
                {loading ? 'Drafting Notice...' : 'Generate Legal Draft'}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-4 text-slate-800">2. Generated Document</h2>
              {generatedDoc ? (
                <div className="bg-slate-50 p-4 rounded-md text-xs font-mono border whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {generatedDoc}
                </div>
              ) : (
                <div className="h-64 border-2 border-dashed border-slate-200 rounded-md flex items-center justify-center text-slate-400 text-center p-6">
                  Fill out the details on the left to generate your customized state notice.
                </div>
              )}
            </div>

            {generatedDoc && (
              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md shadow">
                  Download Printable PDF ($9)
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

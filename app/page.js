'use client';

import { useState } from 'react';
import { isNoticeTypeGrounded, nyTierNoticeTypeForOccupancyMonths } from '../lib/stateRules.js';

// Which "Notice Type" dropdown options are offered for a given state, and how they're
// labeled. This isn't just cosmetic: Florida's 30/60-day options are actually about
// TENANCY TYPE, not duration (Fla. Stat. § 83.57); Ohio has no statutory 60-day tier at
// all (ORC § 5321.17); and New York needs a 3-tier 30/60/90-day system instead of a
// binary choice (RPL § 226-c). Keep in sync with lib/stateRules.js's RULES keys.
function noticeTypeOptionsForState(state) {
  if (state === 'Ohio') {
    return [
      { value: 'Pay or Quit Notice', label: 'Pay Rent or Quit Notice (Non-Payment)' },
      { value: 'Cure or Quit Notice', label: 'Cure or Quit Notice (Health & Safety Violations Only)' },
      { value: '30-Day Notice to Vacate', label: '30-Day Notice to Vacate (Month-to-Month Termination)' },
    ];
  }
  if (state === 'Florida') {
    return [
      { value: 'Pay or Quit Notice', label: 'Pay Rent or Quit Notice (Non-Payment)' },
      { value: 'Cure or Quit Notice', label: 'Cure or Quit Notice (Lease Violation)' },
      { value: '30-Day Notice to Vacate', label: '30-Day Notice to Vacate (Month-to-Month Tenant)' },
      { value: '60-Day Notice to Vacate', label: '60-Day Notice to Vacate (Year-to-Year Lease Tenant)' },
    ];
  }
  if (state === 'New York') {
    return [
      { value: 'Pay or Quit Notice', label: 'Pay Rent or Quit Notice (14-Day Rent Demand)' },
      { value: 'Cure or Quit Notice', label: 'Cure or Quit Notice (Lease-Required Only — No NY Statute)' },
      { value: '30-Day Notice to Vacate', label: '30-Day Notice (Tenant Occupancy Under 1 Year)' },
      { value: '60-Day Notice to Vacate', label: '60-Day Notice (Tenant Occupancy 1–2 Years)' },
      { value: '90-Day Notice to Vacate', label: '90-Day Notice (Tenant Occupancy 2+ Years)' },
    ];
  }
  return [
    { value: 'Pay or Quit Notice', label: 'Pay Rent or Quit Notice (Non-Payment)' },
    { value: 'Cure or Quit Notice', label: 'Cure or Quit Notice (Lease Violation)' },
    { value: '30-Day Notice to Vacate', label: '30-Day Notice to Vacate (Month-to-Month Termination)' },
    { value: '60-Day Notice to Vacate', label: '60-Day Notice to Vacate (Long-Term Tenancy)' },
  ];
}

const NY_TIER_TYPES = ['30-Day Notice to Vacate', '60-Day Notice to Vacate', '90-Day Notice to Vacate'];
const PERIOD_ANCHOR_COMBOS = new Set([
  'Florida|30-Day Notice to Vacate',
  'Florida|60-Day Notice to Vacate',
  'Ohio|30-Day Notice to Vacate',
]);

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  const [formData, setFormData] = useState({
    state: 'California',
    noticeType: 'Pay or Quit Notice',
    landlordName: '',
    landlordPhone: '',
    tenantName: '',
    propertyAddress: '',
    amountOwed: '',
    dueDate: '',
    violationDescription: '',
    serveMethod: 'Personal Service',
    serverName: '',
    serveDate: '',
    periodStartDate: '',
    tenancyOccupancyMonths: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // Switching state can make the current noticeType invalid (e.g. Ohio has no
      // 60-Day option, New York has a 90-Day option others don't) — fall back to the
      // first valid option for the new state rather than leaving a stale selection.
      if (name === 'state') {
        const validTypes = noticeTypeOptionsForState(value).map((opt) => opt.value);
        if (!validTypes.includes(prev.noticeType)) {
          next.noticeType = validTypes[0];
        }
      }

      // New York's notice period is driven by occupancy length (RPL § 226-c), not a
      // free-standing choice — auto-select the correct 30/60/90-day tier as the
      // landlord types, while still leaving the dropdown editable if they disagree.
      if (name === 'tenancyOccupancyMonths' && next.state === 'New York') {
        next.noticeType = nyTierNoticeTypeForOccupancyMonths(value);
      }

      return next;
    });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGenerateError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to draft your notice right now.');
      }

      setPreviewText(data.previewText);
      setShowPreview(true);
    } catch (error) {
      setGenerateError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setCheckoutError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to start checkout right now.');
      }

      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error.message);
      setCheckingOut(false);
    }
  };

  const scrollToGenerator = () => {
    document.getElementById('notice-generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-slate-900">
                LeaseDraft<span className="text-blue-600">AI</span>
              </span>
              <span className="hidden sm:inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200">
                Court-Ready Legal Notices
              </span>
            </div>
            <button 
              onClick={scrollToGenerator}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition shadow-sm"
            >
              Create Notice Now
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-12 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6 border border-blue-200">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              Updated for 2026 State Statutory Requirements
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
              Court-Ready Landlord Notices Formatted in <span className="text-blue-600 underline decoration-blue-200 underline-offset-4">Under 2 Minutes</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal">
              Generate legally compliant Pay or Quit, Cure or Quit, and Lease Termination notices with automated Proof of Service affidavits built to withstand eviction court challenges.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={scrollToGenerator}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-blue-500/25 transition duration-200"
              >
                Generate Notice ($9) &rarr;
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-200/80 text-slate-600 text-xs sm:text-sm font-medium">
              <div className="flex items-center justify-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Statutory Rules Verified in Code for 5 States
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Includes Proof of Service
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Exact Day-Counting Rules
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Instant PDF Download
              </div>
            </div>
          </div>
        </section>

        {/* Sample Notice — shown before any PII is entered, so a cold visitor can judge
            output quality without committing personal information. This is a static,
            fictional example (not a live preview call) to keep the section fast and free
            of API cost; the real wizard below generates a live, personalized preview. */}
        <section className="py-12 md:py-16 px-4 sm:px-6 bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">See Exactly What You&apos;ll Get</h2>
              <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
                A real sample — same structure, same statutory grounding, same Proof of Service
                affidavit every notice includes. This is a fictional example; the wizard below
                builds yours with your actual details.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold tracking-wide">SAMPLE — 3-DAY PAY OR QUIT NOTICE (CALIFORNIA)</span>
                <span className="text-xs bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded">FICTIONAL EXAMPLE</span>
              </div>
              <pre className="p-5 sm:p-6 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed max-h-[420px] overflow-y-auto">
{`3-DAY NOTICE TO PAY RENT OR QUIT

DATE OF NOTICE: August 21, 2026

TO: Jane Tenant
PROPERTY ADDRESS: 123 Maple Street, Unit 4, Sacramento, CA 95814

FROM: Riverbend Properties LLC
PHONE: (916) 555-0142

RE: NOTICE TO PAY RENT OR QUIT — CALIFORNIA CODE OF CIVIL PROCEDURE § 1161(2)

PLEASE TAKE NOTICE that you are currently in default of your rental
obligations. You owe $2,100.00 in past-due rent for the period beginning
August 1, 2026. Pursuant to California Code of Civil Procedure § 1161(2), you are hereby
required to pay this amount in full, or deliver possession of the premises,
within THREE (3) DAYS of service of this notice, excluding Saturdays,
Sundays, and other judicial holidays.

Based on service by personal delivery on August 21, 2026, this 3-day period
excludes the intervening weekend and expires on August 26, 2026.

BASIS FOR NOTICE PERIOD

California Code of Civil Procedure § 1161(2) requires this notice period to
be computed in "judicial days" — court business days only, excluding
Saturdays, Sundays, and judicial holidays. The deadline above was computed
using this rule, not a flat calendar-day count.

REQUIRED ACTION

You must pay the full amount owed or vacate the premises no later than the
date stated above. Failure to do so may result in legal proceedings to
recover possession.

SIGNATURE BLOCK

Riverbend Properties LLC

By: _______________________________
Date: August 21, 2026

PROOF OF SERVICE / AFFIDAVIT OF SERVICE

STATE OF CALIFORNIA )
                    ) ss.:
COUNTY OF SACRAMENTO )

I, the undersigned, being duly sworn, depose and state under penalty of
perjury that on August 21, 2026, I served the foregoing notice upon the
tenant named above by personal delivery to the premises described above.

Signature: _______________________________
Date: August 21, 2026`}
              </pre>
            </div>

            <p className="text-center text-xs text-slate-500 mt-4 max-w-2xl mx-auto">
              This example is illustrative. Your actual notice is generated from your specific
              details and the verified statutory rules for your state and notice type — see
              &quot;How We Actually Verify This&quot; below.
            </p>
          </div>
        </section>

        {/* Main Form Generator Container */}
        <section id="notice-generator" className="py-12 md:py-16 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            
            {/* Form Header / Progress Steps */}
            <div className="bg-slate-900 text-white p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Notice Generator Wizard</h2>
                  <p className="text-slate-400 text-sm mt-1">Fill out the statutory details below to draft your legal notice.</p>
                </div>
                <div className="text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-md font-mono text-blue-400 self-start sm:self-center">
                  Step {currentStep} of 3
                </div>
              </div>

              {/* Step Indicators */}
              <div className="grid grid-cols-3 gap-2">
                <div className={`h-2 rounded-full transition-all duration-300 ${currentStep >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                <div className={`h-2 rounded-full transition-all duration-300 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                <div className={`h-2 rounded-full transition-all duration-300 ${currentStep >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
              </div>
              <div className="grid grid-cols-3 text-[11px] sm:text-xs text-slate-400 mt-2 text-center font-medium">
                <span className={currentStep === 1 ? 'text-white font-bold' : ''}>1. Notice & Jurisdiction</span>
                <span className={currentStep === 2 ? 'text-white font-bold' : ''}>2. Property & Tenant</span>
                <span className={currentStep === 3 ? 'text-white font-bold' : ''}>3. Proof of Service</span>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 md:p-8">
              {!showPreview ? (
                <form onSubmit={handleNext} className="space-y-6">
                  
                  {/* STEP 1 */}
                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Select State & Notice Type</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Rental Property State *</label>
                        <select 
                          name="state" 
                          value={formData.state} 
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="California">California (3-Day / 30-Day Notice Standards)</option>
                          <option value="Texas">Texas (3-Day Notice to Vacate)</option>
                          <option value="Florida">Florida (3-Day / 7-Day Statutory Notice)</option>
                          <option value="New York">New York (14-Day Rent Demand)</option>
                          <option value="Ohio">Ohio (3-Day Notice to Leave Premises)</option>
                        </select>
                        {isNoticeTypeGrounded(formData.state, formData.noticeType) ? (
                          <p className="text-xs text-slate-500 mt-1">
                            Citation, notice period, and deadline for this notice are verified in our statutory
                            rules engine, not just AI-generated.
                          </p>
                        ) : (
                          <p className="text-xs text-amber-600 mt-1">
                            This notice is AI-drafted using general legal research and has not yet been
                            independently statute-verified. Please double-check the citation and deadline before
                            relying on it.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notice Type *</label>
                        <select
                          name="noticeType"
                          value={formData.noticeType}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          {noticeTypeOptionsForState(formData.state).map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {formData.noticeType === 'Pay or Quit Notice' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Total Past-Due Rent ($) *</label>
                            <input
                              type="number"
                              name="amountOwed"
                              required
                              placeholder="e.g. 1850"
                              value={formData.amountOwed}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Rent Due Date *</label>
                            <input
                              type="date"
                              name="dueDate"
                              required
                              value={formData.dueDate}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {formData.noticeType === 'Cure or Quit Notice' && (
                        <div className="pt-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Describe the Lease Violation *</label>
                          <textarea
                            name="violationDescription"
                            required
                            rows={3}
                            placeholder="e.g. Unauthorized pet (dog) kept in unit in violation of Section 12 of the lease"
                            value={formData.violationDescription}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Be specific — this is what your notice will tell the tenant to fix. Vague descriptions
                            produce vague notices, which is exactly what gets challenged in court.
                          </p>
                          {formData.state === 'Ohio' && (
                            <p className="text-xs text-amber-600 mt-1">
                              Ohio law only recognizes a statutory cure notice for health-and-safety violations
                              (ORC § 5321.11) — things like an unsanitary unit or improper garbage disposal. For
                              other lease violations (pets, guests, noise, etc.), Ohio has no cure-period statute;
                              describe the violation clearly, but don&apos;t rely on this as a state-mandated cure right.
                            </p>
                          )}
                          {formData.state === 'New York' && (
                            <p className="text-xs text-amber-600 mt-1">
                              New York has no statewide statute creating a pre-suit &quot;cure or quit&quot; notice for a
                              market-rate tenancy — any cure right here comes from your lease itself, not state law.
                              Check your lease for a cure clause before relying on this notice.
                            </p>
                          )}
                        </div>
                      )}

                      {NY_TIER_TYPES.includes(formData.noticeType) && formData.state === 'New York' && (
                        <div className="pt-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Tenant Occupancy Length (months) *
                          </label>
                          <input
                            type="number"
                            name="tenancyOccupancyMonths"
                            required
                            min="0"
                            placeholder="e.g. 14"
                            value={formData.tenancyOccupancyMonths}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            New York law (RPL § 226-c) sets the required notice period by how long the tenant has
                            occupied the unit, or their lease term, whichever is longer — under 1 year gets 30 days,
                            1–2 years gets 60 days, 2+ years gets 90 days. We&apos;ve auto-selected{' '}
                            <strong>{formData.noticeType}</strong> above based on what you enter here; adjust the
                            dropdown yourself if you believe a different tier applies.
                          </p>
                        </div>
                      )}

                      {PERIOD_ANCHOR_COMBOS.has(`${formData.state}|${formData.noticeType}`) && (
                        <div className="pt-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Next Rent Due Date *
                          </label>
                          <input
                            type="date"
                            name="periodStartDate"
                            required
                            value={formData.periodStartDate}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            {formData.state === 'Florida'
                              ? "Florida law (Fla. Stat. § 83.57) requires this notice to end on the last day of the tenant's current rental period, not just N days from today — enter the tenant's next rent due date so we can calculate the correct termination date."
                              : "Ohio law (ORC § 5321.17(B)) requires this notice to expire on the tenant's next periodic rental date, not just 30 days from today — enter the tenant's next rent due date so we can calculate the correct termination date."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 2 */}
                  {currentStep === 2 && (
                    <div className="space-y-5">
                      <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Property & Party Information</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Landlord / Property Management Name *</label>
                        <input 
                          type="text" 
                          name="landlordName" 
                          required 
                          placeholder="e.g. John Smith or Apex Property Management LLC"
                          value={formData.landlordName} 
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Landlord Phone / Contact *</label>
                        <input 
                          type="text" 
                          name="landlordPhone" 
                          required 
                          placeholder="e.g. (555) 019-2831"
                          value={formData.landlordPhone} 
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Tenant Name(s) *</label>
                        <input 
                          type="text" 
                          name="tenantName" 
                          required 
                          placeholder="e.g. Jane Doe, Mark Doe (Include all legal occupants)"
                          value={formData.tenantName} 
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Complete Rental Property Address *</label>
                        <input 
                          type="text" 
                          name="propertyAddress" 
                          required 
                          placeholder="e.g. 742 Evergreen Terrace, Apt 3B, Springfield, CA 90210"
                          value={formData.propertyAddress} 
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3 */}
                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Proof of Service Details</h3>
                      <p className="text-sm text-slate-600">The Proof of Service affidavit will be appended automatically to your document.</p>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Method of Service *</label>
                        <select 
                          name="serveMethod" 
                          value={formData.serveMethod} 
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="Personal Service">Personal Service (Handed directly to tenant)</option>
                          <option value="Substituted Service">Substituted Service (Left with responsible person + mailed)</option>
                          <option value="Posting & Mailing">Nail and Mail / Posting on Door & Certified Mail</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Name of Person Serving Notice *</label>
                          <input 
                            type="text" 
                            name="serverName" 
                            required 
                            placeholder="e.g. John Smith (Landlord or Agent)"
                            value={formData.serverName} 
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Date Served *</label>
                          <input 
                            type="date" 
                            name="serveDate" 
                            required 
                            value={formData.serveDate} 
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wizard Controls */}
                  <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                    {currentStep > 1 ? (
                      <button 
                        type="button" 
                        onClick={handleBack}
                        className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2 border border-slate-300 rounded-lg text-sm"
                      >
                        &larr; Back
                      </button>
                    ) : <div></div>}

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow transition duration-200 text-sm flex items-center gap-2"
                    >
                      {loading ? (
                        <span>Drafting Court-Ready Document...</span>
                      ) : currentStep === 3 ? (
                        <span>Generate Court-Ready Draft ($9) &rarr;</span>
                      ) : (
                        <span>Continue to Next Step &rarr;</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Generated Document Result / Checkout Prompt */
                <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-sm flex items-center justify-between">
                    <div>
                      <span className="font-bold">Notice Successfully Formatted!</span> Clean legal structure, state statutory references, and Proof of Service affidavit attached.
                    </div>
                    <button 
                      onClick={() => setShowPreview(false)} 
                      className="text-xs text-emerald-700 underline font-semibold ml-2"
                    >
                      Edit Details
                    </button>
                  </div>

                  {/* AI-Generated Preview (first few lines only — full document unlocks after payment) */}
                  <div className="bg-slate-50 border border-slate-300 rounded-lg p-6 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                    {previewText}
                  </div>

                  {/* Direct Checkout Trigger */}
                  <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 text-center">
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Unlock Official PDF Download</h4>
                    <p className="text-sm text-slate-600 mb-4">Includes high-resolution PDF, printable format, and unlimited re-downloads.</p>

                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={checkingOut}
                      className="inline-block w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition duration-200"
                    >
                      {checkingOut ? 'Redirecting to secure checkout...' : 'Pay $9 & Download Official PDF Notice'}
                    </button>
                    <p className="text-xs text-slate-500 mt-2">Secure 256-bit Stripe checkout. No subscription required.</p>
                    {checkoutError && (
                      <p className="text-xs text-red-600 mt-3 font-medium">{checkoutError}</p>
                    )}
                  </div>
                </div>
              )}
              {generateError && !showPreview && (
                <p className="text-sm text-red-600 font-medium mt-4">{generateError}</p>
              )}
            </div>
          </div>
        </section>

        {/* Pain Point Callout Section */}
        <section className="bg-slate-900 text-white py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Why Free Generic Templates Get Thrown Out in Eviction Court
            </h2>
            <p className="mt-4 text-slate-400 text-base sm:text-lg">
              Judges dismiss up to 40% of self-filed eviction cases due to subtle notice flaws. A free word processor template can set your timeline back by months.
            </p>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700">
                <div className="text-red-400 text-xl font-bold mb-2">1. Missing Statutory Language</div>
                <p className="text-sm text-slate-300">
                  California, Texas, Florida, Ohio, and New York each require their own exact
                  statutory warnings and disclosures. Generic templates are written to be
                  usable everywhere, which means they&apos;re precisely tailored to nowhere.
                </p>
              </div>
              <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700">
                <div className="text-red-400 text-xl font-bold mb-2">2. Faulty (or Missing) Day-Counting Logic</div>
                <p className="text-sm text-slate-300">
                  Courts strictly exclude weekends and, in several states, court holidays — and
                  the exact rule varies by state and notice type. Incorrect calculations cause
                  immediate case dismissals.
                </p>
              </div>
              <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700">
                <div className="text-red-400 text-xl font-bold mb-2">3. Incomplete Proof of Service</div>
                <p className="text-sm text-slate-300">
                  Without a legally structured Affidavit of Service signed under penalty of perjury, judges won't accept notice delivery as proven.
                </p>
              </div>
              <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700">
                <div className="text-red-400 text-xl font-bold mb-2">4. &quot;As Required By Law&quot; Placeholders</div>
                <p className="text-sm text-slate-300">
                  It&apos;s common for free and AI-generated notices to fill in the deadline with
                  a vague placeholder like &quot;[X days as required by local law]&quot; and leave
                  you to look up and compute the actual date yourself. LeaseDraft AI computes
                  the real deadline date from verified, sourced rules for every notice —
                  see exactly how below.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Verification Methodology Section — the honest, provable trust signal: how the
            statutory grounding actually works, since a star rating isn't available yet. */}
        <section className="py-16 px-4 sm:px-6 bg-blue-50 border-y border-blue-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900">How We Actually Verify This</h2>
              <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
                We&apos;re a new tool without a long review history yet — so instead of asking
                you to just trust a badge, here&apos;s exactly how the statutory grounding
                behind every notice actually works.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-blue-600 text-2xl font-bold mb-2">1</div>
                <h3 className="font-bold text-slate-900 mb-2">Sourced, Not Guessed</h3>
                <p className="text-sm text-slate-600">
                  Every citation, notice period, and day-counting rule is researched against the
                  actual statute text and recent case law before it&apos;s added to the product —
                  not generated on the fly by asking an AI model to recall a statute from memory.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-blue-600 text-2xl font-bold mb-2">2</div>
                <h3 className="font-bold text-slate-900 mb-2">Computed in Code, Not Prose</h3>
                <p className="text-sm text-slate-600">
                  The actual deadline date on your notice is calculated by tested code —
                  weekends, court holidays, and period-based rules included — the same way every
                  time. The AI drafts the notice language; it doesn&apos;t do the day-counting
                  math.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-blue-600 text-2xl font-bold mb-2">3</div>
                <h3 className="font-bold text-slate-900 mb-2">Verified With Real Purchases</h3>
                <p className="text-sm text-slate-600">
                  Before each state or notice type goes live, we run it through the actual paid
                  flow and confirm the generated document matches the expected citation and
                  deadline exactly — not just a code review.
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500 mt-8 max-w-2xl mx-auto">
              This is not a substitute for review by a licensed attorney in your state, and we
              say so plainly in our <a href="/terms" className="underline hover:text-slate-700">Terms</a>.
              What it is: a real, checkable process, not just a claim.
            </p>
          </div>
        </section>

        {/* Value Stack Section */}
        <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Engineered for Landlords & Property Managers</h2>
            <p className="text-slate-600 mt-2">Get court-ready documentation without paying hundreds in legal retainers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-lg flex items-center justify-center mb-4">01</div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">5 States, Verified in Code</h3>
              <p className="text-sm text-slate-600">
                California, Texas, Florida, Ohio, and New York — each notice type&apos;s
                citation and deadline computed from researched, sourced rules, not just
                generated on the fly.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-lg flex items-center justify-center mb-4">02</div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Proof of Service Included</h3>
              <p className="text-sm text-slate-600">Generates the mandatory sworn affidavit required by process servers and court clerks.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-lg flex items-center justify-center mb-4">03</div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Instant $9 Download</h3>
              <p className="text-sm text-slate-600">No monthly subscriptions, no recurring fees, no trial that quietly converts to a paid plan. Pay once, download your PDF immediately.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Common Questions</h2>
          </div>
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-6">
              <h3 className="font-bold text-slate-900 mb-2">Why pay $9 instead of using a free template?</h3>
              <p className="text-sm text-slate-600">
                Free templates are built to be usable in any state, which means they can&apos;t
                include your state&apos;s specific required language, and they typically leave
                the notice deadline for you to calculate yourself. LeaseDraft AI computes that
                deadline for you from verified, state-specific rules (see &quot;How We Actually
                Verify This&quot; above) and bundles a properly formatted Proof of Service
                affidavit — the two things landlords most often get wrong filing a notice
                themselves.
              </p>
            </div>
            <div className="border-b border-slate-200 pb-6">
              <h3 className="font-bold text-slate-900 mb-2">Is this legal advice?</h3>
              <p className="text-sm text-slate-600">
                No. LeaseDraft AI is a self-help document formatting tool, not a law firm, and
                doesn&apos;t provide legal representation. We strongly recommend independently
                verifying any citation or deadline before relying on it, especially for
                anything filed in court. Full details in our <a href="/terms" className="underline hover:text-slate-700">Terms of Service</a>.
              </p>
            </div>
            <div className="border-b border-slate-200 pb-6">
              <h3 className="font-bold text-slate-900 mb-2">Which states and notice types are actually verified?</h3>
              <p className="text-sm text-slate-600">
                California, Texas, Florida, Ohio, and nearly all New York notice types have
                citations and deadlines computed from sourced, verified rules. The one exception
                is New York&apos;s Cure or Quit notice, which has no statewide statute behind it
                — the wizard discloses this clearly before you generate it. We&apos;re adding
                more states over time.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">What if I&apos;m not satisfied with my notice?</h3>
              <p className="text-sm text-slate-600">
                Email us within 7 days of purchase and we&apos;ll issue a full refund, no
                questions asked.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
          <div className="max-w-4xl mx-auto px-4">
            <p>© 2026 LeaseDraft AI. All rights reserved.</p>

            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-medium">
              <a href="mailto:leasedraftai@proton.me" className="text-blue-600 hover:underline">Support: leasedraftai@proton.me</a>
              <a href="/recover" className="text-blue-600 hover:underline">Lost your document?</a>
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
              <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
            </p>

            <p className="mt-2 max-w-2xl mx-auto">
              Not happy with your notice? Email us within 7 days of purchase for a full refund, no questions asked.
            </p>

            <p className="mt-2 max-w-2xl mx-auto">
              Statutory citations, notice periods, and deadlines are verified in code for California, Texas,
              Florida, Ohio, and most New York notice types. One exception: New York has no statewide statute
              creating a pre-suit &quot;Cure or Quit&quot; notice, so that specific notice type remains AI-drafted
              with a clear disclosure in the wizard. Additional verified states and notice types coming soon.
            </p>

            <p className="mt-2 max-w-2xl mx-auto">
              Disclaimer: LeaseDraft AI provides automated legal document formatting and self-help tools. LeaseDraft AI is not a law firm and does not provide formal legal representation or legal advice.
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}

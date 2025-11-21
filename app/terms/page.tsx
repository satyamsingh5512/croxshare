import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold text-[#111827]">Terms & Conditions</h1>
        <div className="mt-6 space-y-6 text-[#4B5563]">
          <section>
            <h3 className="text-xl font-semibold text-[#111827]">Overview</h3>
            <p className="mt-2">These terms govern your use of the Nearby Share feature. By using it, you agree to these terms.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#111827]">Eligibility</h3>
            <p className="mt-2">You must be authorized to transfer files and comply with local laws.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#111827]">File transfer safety</h3>
            <p className="mt-2">We provide peer-to-peer transfer over your local network. You are responsible for scanning files for malware.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#111827]">Limitations</h3>
            <p className="mt-2">We do not guarantee delivery times or availability. Use at your own risk.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#111827]">No warranty</h3>
            <p className="mt-2">The feature is provided as-is without warranty.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#111827]">Prohibited misuse</h3>
            <p className="mt-2">Do not use for illegal distribution, harassment, or other prohibited activities.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#111827]">User responsibilities</h3>
            <p className="mt-2">Keep your device secure and verify peers before transferring sensitive data.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#111827]">Data processing</h3>
            <p className="mt-2">We process minimal metadata for session establishment as described in the privacy policy.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

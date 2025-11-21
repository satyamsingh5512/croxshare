import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold text-[#111827]">Privacy Policy</h1>
        <div className="mt-6 space-y-6 text-[#4B5563]">
          <section>
            <h3 className="text-xl font-semibold text-[#111827]">What we store</h3>
            <p className="mt-2">We store minimal metadata: device names and ephemeral session information required for signaling.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#111827]">What we do NOT store</h3>
            <ul className="mt-2 list-disc pl-5">
              <li>No files</li>
              <li>No chat data</li>
              <li>No WebRTC payloads</li>
              <li>No IPFS content</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#111827]">Cookie / localStorage usage</h3>
            <p className="mt-2">We use localStorage to store your device name and small non-sensitive history. No files are stored.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#111827]">Security practices</h3>
            <p className="mt-2">Files are transferred P2P over WebRTC DataChannels; the signaling server relays only SDP/ICE and ephemeral secrets used for verification.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#111827]">User rights</h3>
            <p className="mt-2">You can delete stored device name or history from your browser at any time.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

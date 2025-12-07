"use client";

export default function FaucetModal({ open, onClose, onVNS, onARC }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0f1625] p-6 rounded-xl w-[360px] border border-gray-700">
        <h2 className="text-xl text-white mb-4">Arc Faucet</h2>

        <div className="flex gap-4 mb-6">
          <button onClick={onVNS} className="faucet-btn">
            Get 10 VNS
          </button>
          <button onClick={onARC} className="faucet-btn">
            Get 10 ARC
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}

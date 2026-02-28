"use client";
import { useState } from "react";
import { Shield, Lock, Unlock, Trash2, Globe } from "lucide-react";
import { encryptMessage, decryptMessage, hashPassword } from "@/lib/crypto";

export default function VaultPage() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [decryptedMsg, setDecryptedMsg] = useState("");

  const onDeposit = async () => {
    if (!password || !message) return alert("Fill all fields");
    setLoading(true);
    try {
      const id = await hashPassword(password);
      const encrypted = await encryptMessage(message, password);
      await fetch("/api/vault", {
        method: "POST",
        body: JSON.stringify({ id, content: encrypted }),
      });
      alert("Message secured in the vault!");
      setMessage("");
    } catch (e) { alert("Error saving message"); }
    setLoading(false);
  };

  const onWithdraw = async () => {
    if (!password) return alert("Enter key");
    setLoading(true);
    try {
      const id = await hashPassword(password);
      const res = await fetch(`/api/vault?id=${id}`);
      const data = await res.json();
      if (data.content) {
        const text = await decryptMessage(data.content, password);
        setDecryptedMsg(text);
      } else { alert("Vault empty for this key."); }
    } catch (e) { alert("Wrong key or expired."); }
    setLoading(false);
  };

  if (!accepted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-zinc-400 p-6">
        <Shield size={48} className="text-white mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2 tracking-widest">THE VAULT</h1>
        <p className="text-center max-w-sm mb-8 text-sm leading-relaxed">
          Zero-knowledge encryption. Messages are deleted instantly after decryption. We do not track you.
        </p>
        <button onClick={() => setAccepted(true)} className="px-10 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition">
          I AGREE
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 font-sans">
      <div className="max-w-md mx-auto space-y-8">
        <header className="flex items-center gap-2 border-b border-zinc-800 pb-4">
          <Globe size={20} className="text-blue-500" />
          <span className="text-xs font-mono text-zinc-500">MALAYSIA HUB // GLOBAL VAULT</span>
        </header>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-zinc-500">Private Key</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded focus:border-blue-600 outline-none" placeholder="••••••••" />
        </div>

        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 space-y-4">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-transparent outline-none h-24 text-sm" placeholder="Write your secret message here..." />
          <button disabled={loading} onClick={onDeposit} className="w-full py-3 bg-blue-600 rounded font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition">
            <Lock size={16} /> {loading ? "Encrypting..." : "Lock & Drop"}
          </button>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <button disabled={loading} onClick={onWithdraw} className="w-full py-3 bg-zinc-100 text-black rounded font-bold flex items-center justify-center gap-2 hover:bg-white transition">
            <Unlock size={16} /> {loading ? "Searching..." : "Withdraw & Burn"}
          </button>
          
          {decryptedMsg && (
            <div className="mt-6 p-4 border border-green-900 bg-green-950/30 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-green-500 font-mono tracking-tighter uppercase">Message Retrieved</span>
                <Trash2 size={12} className="text-green-500" />
              </div>
              <p className="text-green-400 break-words">{decryptedMsg}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

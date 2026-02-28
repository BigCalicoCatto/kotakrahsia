"use client";
import { useState } from "react";
import { encryptMessage, decryptMessage, hashPassword } from "@/lib/crypto";

export default function VaultPage() {
  const [accepted, setAccepted] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");

  const handleDeposit = async () => {
    const id = await hashPassword(password);
    const encrypted = await encryptMessage(message, password);
    await fetch("/api/vault", {
      method: "POST",
      body: JSON.stringify({ id, content: encrypted }),
    });
    alert("Message Dropped in Vault!");
    setMessage("");
  };

  const handleWithdraw = async () => {
    const id = await hashPassword(password);
    const res = await fetch(`/api/vault?id=${id}`);
    const data = await res.json();
    if (data.content) {
      const decrypted = await decryptMessage(data.content, password);
      setResult(decrypted);
    } else {
      alert("No message found or already destroyed.");
    }
  };

  if (!accepted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-10">
        <h1 className="text-3xl font-bold mb-4">THE VAULT</h1>
        <p className="text-center mb-6 max-w-md">
          Zero-Knowledge Encryption. Messages self-destruct after reading.
          We do not log IPs. You are responsible for your keys.
        </p>
        <button 
          onClick={() => setAccepted(true)}
          className="bg-white text-black px-6 py-2 rounded font-bold"
        >
          I AGREE - ENTER
        </button>
      </div>
    );
  }

  return (
    <main className="p-10 bg-zinc-900 min-h-screen text-white flex flex-col items-center">
      <div className="w-full max-w-md space-y-4">
        <input
          type="password"
          placeholder="Private Key"
          className="w-full p-2 bg-zinc-800 rounded border border-zinc-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <div className="border-t border-zinc-800 pt-4">
          <textarea
            placeholder="Type secret message..."
            className="w-full p-2 bg-zinc-800 rounded h-32"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={handleDeposit} className="w-full bg-blue-600 mt-2 py-2 rounded">
            Deposit (Lock & Drop)
          </button>
        </div>

        <div className="border-t border-zinc-800 pt-4">
          <button onClick={handleWithdraw} className="w-full bg-red-600 py-2 rounded">
            Withdraw (Unlock & Burn)
          </button>
          {result && (
            <div className="mt-4 p-4 bg-zinc-800 border border-green-500 text-green-400">
              <strong>Message:</strong> {result}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

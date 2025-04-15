import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      onLogin();
    } else {
      setError("Invalid credentials. Try admin / admin.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-xl flex flex-col gap-4 min-w-[320px]">
        <h2 className="text-2xl font-bold text-center mb-2">Login</h2>
        {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
        <input
          className="border rounded px-3 py-2"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold" type="submit">Login</button>
      </form>
    </div>
  );
}

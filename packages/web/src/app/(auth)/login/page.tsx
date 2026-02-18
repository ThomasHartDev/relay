"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Sign in to Relay</h1>
        <p className="mt-2 text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-600 hover:text-brand-500 font-medium">
            Create one
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus:border-brand-500 focus:ring-brand-500 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus:border-brand-500 focus:ring-brand-500 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-600 hover:bg-brand-700 focus:ring-brand-500 flex h-11 w-full items-center justify-center rounded-md text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

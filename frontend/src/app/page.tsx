"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-center text-center font-mono text-lg">
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <p>This is protected content, only visible to logged-in users.</p>
        </div>
      </main>
    </ProtectedRoute>
  );
}

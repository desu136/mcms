import React from 'react';
import Link from 'next/link';

export default function PublicLandingPage() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-3xl py-24 sm:py-32 text-center">
        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
          <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-slate-600 ring-1 ring-slate-900/10 hover:ring-slate-900/20 bg-white shadow-sm">
            Phase 1 Infrastructure Ready &bull; Offline-Capable Monorepo
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Next-Generation Clinic Management System
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Seamless clinical operations across Web, Electron Desktop, and Flutter Mobile with robust
          offline-first synchronization, secure role-based access, and centralized authoritative
          PostgreSQL backend.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition"
          >
            Enter Staff Portal &rarr;
          </Link>
          <a
            href="http://localhost:3001/api/v1/health"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold leading-6 text-slate-900 hover:text-blue-600 transition"
          >
            Check API Health &rarr;
          </a>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
            <h3 className="font-semibold text-slate-900">Web App (Next.js)</h3>
            <p className="mt-2 text-sm text-slate-600">
              App Router with public landing page and authenticated staff layouts with IndexedDB
              offline queue.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
            <h3 className="font-semibold text-slate-900">Desktop (Electron)</h3>
            <p className="mt-2 text-sm text-slate-600">
              Local SQLite database with secure main/preload IPC boundaries for clinical
              workstations.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
            <h3 className="font-semibold text-slate-900">Mobile (Flutter)</h3>
            <p className="mt-2 text-sm text-slate-600">
              SQLite repository pattern communicating via OpenAPI contracts, maintaining strict
              parity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

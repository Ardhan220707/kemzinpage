"use client";

import { useSearchParams } from "next/navigation";
import { login } from "./actions";
import { LockKeyhole, Users } from "lucide-react";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const messages: Record<string, string> = {
    empty: "Email dan password wajib diisi.",
    invalid: "Email atau password tidak sesuai.",
    inactive: "Akun belum aktif atau belum memiliki akses.",
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Users size={28} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Kemzinpage</h1>

          <p className="mt-2 text-sm text-slate-500">
            Sistem Manajemen Presensi Organisasi
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Selamat Datang
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Masuk menggunakan akun pengurus Anda.
          </p>
        </div>

        {error && messages[error] && (
          <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {messages[error]}
          </div>
        )}

        <form action={login} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="nama@email.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Masukkan password"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <LockKeyhole size={18} />
            Masuk ke Aplikasi
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Akun hanya dapat dibuat oleh Administrator.
        </p>
      </div>
    </main>
  );
}

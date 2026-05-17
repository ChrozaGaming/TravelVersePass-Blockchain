import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page max-w-md">
      <div className="card text-center">
        <div className="text-6xl mb-3">🔍</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">404</h1>
        <p className="text-slate-600 mb-6">
          Halaman yang kamu cari tidak ditemukan.
        </p>
        <div className="flex gap-2 justify-center">
          <Link href="/" className="btn-primary">
            Ke Home
          </Link>
          <Link href="/destinations" className="btn-secondary">
            Lihat Destinasi
          </Link>
        </div>
      </div>
    </div>
  );
}

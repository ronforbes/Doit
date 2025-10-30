import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">LifeAlign</h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect your daily tasks to your long-term strategy
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-white text-brand-blue rounded-lg font-semibold border-2 border-brand-blue hover:bg-blue-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}

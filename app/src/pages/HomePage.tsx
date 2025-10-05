export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900">
          Welcome to <span className="text-primary">Saitex</span>
        </h1>
        <p className="text-xl text-gray-600">
          A modern React application with TypeScript, Recharts, and more
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/dashboard"
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

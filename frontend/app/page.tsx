import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Document Processor
        </h1>
        <p className="text-gray-600 mb-8">
          Upload and process PDF documents with text extraction
        </p>
        <Link
          href="/upload"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </main>
  )
}


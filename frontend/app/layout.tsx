import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Document Processor',
  description: 'Upload and process documents with OCR and text extraction',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


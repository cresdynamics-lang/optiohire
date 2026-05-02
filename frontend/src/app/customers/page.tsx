import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Customers & Case Studies | OptioHire',
  description: 'Customer stories and case studies from teams using OptioHire.',
}

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Customers & Case Studies</h1>
        <p className="mt-3 text-lg text-slate-600">
          How teams shortlist faster and hire with more confidence using OptioHire.
        </p>
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Sample Story</h2>
          <p className="mt-2 text-slate-600">
            How a Nairobi team shortlisted 200 applicants in 2 days with a consistent, bias-aware scorecard.
          </p>
        </div>
      </div>
    </div>
  )
}

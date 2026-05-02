import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resources | OptioHire',
  description: 'Guides on structured hiring, fairness, and compliance in Kenya.',
}

const posts = [
  "Kenya's Data Protection Act and Your Hiring Process",
  'Why Structured Interviews Outperform CVs',
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Resources</h1>
        <p className="mt-3 text-lg text-slate-600">
          Practical content for better hiring decisions and stronger compliance.
        </p>
        <div className="mt-8 grid gap-4">
          {posts.map((post) => (
            <article key={post} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">{post}</h2>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

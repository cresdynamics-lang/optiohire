'use client'

export default function AboutPage() {
  const audience = [
    'Startups hiring quickly',
    'Growing SMEs scaling teams',
    'HR teams handling high applicant volumes',
    'Companies recruiting for specialized technical roles',
  ]

  const gallery = [
    {
      title: 'Smart Screening',
      text: 'AI reviews applications and resumes to shortlist candidates based on skills-first capability and role readiness.',
      image:
        "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80')",
    },
    {
      title: 'Fair Evaluation',
      text: 'Every candidate receives an objective, consistent assessment that helps reduce unconscious bias.',
      image:
        "url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80')",
    },
    {
      title: 'Confident Decisions',
      text: 'Hiring teams get clear AI recommendations with insights for data-driven final decisions.',
      image:
        "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80')",
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-24 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <section
          className="relative min-h-[380px] rounded-2xl border border-neutral-800 overflow-hidden flex items-end"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.28)), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1800&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="p-8 md:p-10 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-figtree font-semibold mb-4">Our Story</h1>
            <p className="text-neutral-200 leading-relaxed text-base md:text-lg">
              OptioHire is an AI-powered recruitment platform built by Cres Dynamics, a Nairobi-based
              company. We help companies move beyond manual CV screening and hire based on actual
              skills-first capability, role readiness, and cultural fit.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-2xl font-semibold mb-4">What We Deliver</h2>
            <ul className="space-y-2 text-neutral-300">
              <li>3x faster hiring (75% less time)</li>
              <li>40% better quality hires with higher retention</li>
              <li>60% recruitment cost savings</li>
              <li>Transparent AI recommendations for confident decisions</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-2xl font-semibold mb-4">Who It Is For</h2>
            <ul className="space-y-2 text-neutral-300">
              {audience.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Gallery</h2>
          <p className="text-neutral-400 mb-5">
            Background imagery with layered text that explains each stage of the OptioHire process.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {gallery.map((item) => (
              <article
                key={item.title}
                className="relative min-h-[280px] rounded-xl border border-neutral-800 overflow-hidden flex items-end"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2)), ${item.image}`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-neutral-200">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="text-2xl font-semibold mb-3">Trust, Security, and Compliance</h2>
          <p className="text-neutral-300 leading-relaxed">
            OptioHire includes GDPR-compliant data handling, end-to-end encryption, bias-reduction
            algorithms, and transparent AI so hiring teams can understand how recommendations are made.
          </p>
        </section>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, Building2, Briefcase, FileBarChart2,
  CalendarDays, Megaphone, LifeBuoy, Settings, LogOut, Menu, X, Upload
} from 'lucide-react'
import { INST } from './theme'
import { InstitutionSidebarAnnouncements } from './institution-sidebar-announcements'

interface InstitutionCtx {
  institution: { id: string; name: string; slug: string; my_role?: string; logo_url?: string | null } | null
  user: { id: string; email: string; name: string } | null
  token: string | null
  setInstitution: (institution: InstitutionCtx['institution']) => void
  setUser: (user: InstitutionCtx['user']) => void
}

const InstitutionContext = createContext<InstitutionCtx>({
  institution: null,
  user: null,
  token: null,
  setInstitution: () => undefined,
  setUser: () => undefined,
})
export const useInstitution = () => useContext(InstitutionContext)

const mainNav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '' },
  { label: 'Students', icon: Users, href: '/students' },
  { label: 'Employer Activity', icon: Building2, href: '/employer-activity' },
  { label: 'Placements', icon: Briefcase, href: '/placements' },
  { label: 'Reports', icon: FileBarChart2, href: '/reports' },
]

const opsNav = [
  { label: 'Onboarding Sessions', icon: CalendarDays, href: '/onboarding-sessions' },
  { label: 'Bulk Upload', icon: Upload, href: '/onboarding' },
  { label: 'Announcements', icon: Megaphone, href: '/announcements' },
  { label: 'Support', icon: LifeBuoy, href: '/support' },
]

const accountNav = [
  { label: 'Settings', icon: Settings, href: '/settings' },
]

export default function InstitutionLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ institutionId: string }>
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [institution, setInstitution] = useState<InstitutionCtx['institution']>(null)
  const [user, setUser] = useState<InstitutionCtx['user']>(null)
  const [token, setToken] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [institutionId, setInstitutionId] = useState('')

  useEffect(() => {
    params.then((p) => setInstitutionId(p.institutionId))
  }, [params])

  useEffect(() => {
    const t = localStorage.getItem('institution_token')
    const inst = localStorage.getItem('institution_data')
    const u = localStorage.getItem('institution_user')
    if (!t || !inst) {
      router.replace('/institutions/auth/signin')
      return
    }
    setToken(t)
    try { setInstitution(JSON.parse(inst)) } catch { /* ignore */ }
    try { setUser(JSON.parse(u || '{}')) } catch { /* ignore */ }
  }, [router])

  const signOut = () => {
    localStorage.removeItem('institution_token')
    localStorage.removeItem('institution_data')
    localStorage.removeItem('institution_user')
    router.replace('/institutions/auth/signin')
  }

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const buildHref = (suffix: string) => `/institutions/${institutionId}${suffix}`

  const isActive = (suffix: string) => {
    const target = buildHref(suffix)
    if (suffix === '') return pathname === target || pathname === `${target}/`
    return pathname.startsWith(target)
  }

  const NavGroup = ({
    title,
    items,
  }: {
    title: string
    items: { label: string; icon: any; href: string }[]
  }) => (
    <>
      <div style={{
        fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em',
        color: INST.sidebarMuted, margin: '14px 0 4px 10px', fontWeight: 700,
      }}>{title}</div>
      {items.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href || 'dash'}
            href={buildHref(item.href)}
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px', borderRadius: 10,
              fontSize: 13.5, color: active ? '#fff' : INST.sidebarText,
              fontWeight: active ? 600 : 400,
              background: active ? 'rgba(59,130,246,0.28)' : 'transparent',
              textDecoration: 'none', transition: 'all .12s ease',
            }}
          >
            <item.icon size={16} style={{ flexShrink: 0, opacity: 0.9 }} />
            <span style={{ flex: 1 }}>{item.label}</span>
          </Link>
        )
      })}
    </>
  )

  const Sidebar = () => (
    <aside style={{
      background: INST.sidebar, color: INST.sidebarText, padding: '22px 14px',
      display: 'flex', flexDirection: 'column', gap: 18, width: 260,
      minHeight: '100vh', position: 'sticky', top: 0, height: '100vh',
      overflowY: 'auto', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(147,197,253,0.35)',
        }}>
          {institution?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={institution.logo_url} alt={`${institution.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%', background: INST.primaryMid,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#fff', fontSize: 15,
            }}>
              {(institution?.name || 'O').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {institution?.name || 'Institution'}
          </div>
          <div style={{ fontSize: 10.5, color: INST.sidebarMuted, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 1 }}>
            Institution · Career Services
          </div>
        </div>
      </div>

      {institution && (
        <div style={{
          background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(147,197,253,0.25)',
          borderRadius: 12, padding: '10px 12px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: INST.sidebarMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Signed in as
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', lineHeight: 1.3, marginTop: 2 }}>
            {user?.name || 'Institution admin'}
          </div>
          <div style={{ fontSize: 10.5, color: INST.sidebarMuted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email || ''}
          </div>
        </div>
      )}

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavGroup title="Main" items={mainNav} />
        <NavGroup title="Operations" items={opsNav} />
        <NavGroup title="Account" items={accountNav} />
      </nav>

      {institutionId && (
        <InstitutionSidebarAnnouncements institutionId={institutionId} token={token} />
      )}

      <div style={{
        marginTop: 'auto', borderTop: '1px solid rgba(147,197,253,0.2)',
        paddingTop: 14, display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%', background: INST.primaryPale, color: INST.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0,
        }}>
          {user?.name ? getInitials(user.name) : 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: 10.5, color: INST.sidebarMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email || ''}
          </div>
        </div>
        <button onClick={signOut} title="Sign out" style={{ background: 'none', border: 'none', color: INST.sidebarMuted, cursor: 'pointer', padding: 4 }}>
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  )

  return (
    <InstitutionContext.Provider value={{ institution, user, token, setInstitution, setUser }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: INST.paper, fontFamily: 'Inter, system-ui, sans-serif', color: INST.ink }}>
        <div className="hidden md:block"><Sidebar /></div>

        <div className="md:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: INST.primary, color: '#fff', border: 'none', borderRadius: 10, padding: 10, cursor: 'pointer' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40" style={{ background: 'rgba(15,23,42,0.5)' }} onClick={() => setSidebarOpen(false)}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: 260 }}><Sidebar /></div>
          </div>
        )}

        <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh', paddingTop: 'env(safe-area-inset-top)' }} className="max-md:pt-16">{children}</main>
      </div>
    </InstitutionContext.Provider>
  )
}

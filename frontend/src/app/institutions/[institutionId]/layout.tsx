'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard, Upload, Users, KanbanSquare, Bell, BookOpen, Settings, LogOut,
    ChevronDown, Menu, X
} from 'lucide-react'

// ─── Context ────────────────────────────────────────────────────────────────

interface InstitutionCtx {
    institution: { id: string; name: string; slug: string; my_role?: string } | null
    user: { id: string; email: string; name: string } | null
    token: string | null
}

const InstitutionContext = createContext<InstitutionCtx>({ institution: null, user: null, token: null })
export const useInstitution = () => useContext(InstitutionContext)

const navItems = [
    { label: 'Overview', icon: LayoutDashboard, tab: 'overview', href: '' },
    { label: 'Bulk Onboarding', icon: Upload, tab: 'onboarding', href: '/onboarding' },
    { label: 'Candidate Roster', icon: Users, tab: 'roster', href: '/roster', count: null },
    { label: 'Placement Tracker', icon: KanbanSquare, tab: 'tracker', href: '/tracker' },
]

const communicationNav = [
    { label: 'Notifications', icon: Bell, tab: 'notifications', href: '/notifications', count: null },
]

const programmeNav = [
    { label: 'Cohorts', icon: BookOpen, tab: 'cohorts', href: '/cohorts' },
    { label: 'Settings', icon: Settings, tab: 'settings', href: '/settings' },
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
    const [institutionId, setInstitutionId] = useState<string>('')

    useEffect(() => {
        params.then(p => setInstitutionId(p.institutionId))
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
        try { setInstitution(JSON.parse(inst)) } catch { }
        try { setUser(JSON.parse(u || '{}')) } catch { }
    }, [router])

    const signOut = () => {
        localStorage.removeItem('institution_token')
        localStorage.removeItem('institution_data')
        localStorage.removeItem('institution_user')
        router.replace('/institutions/auth/signin')
    }

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    const buildHref = (suffix: string) => `/institutions/${institutionId}${suffix}`

    const isActive = (suffix: string) => {
        const target = buildHref(suffix)
        if (suffix === '') return pathname === target
        return pathname.startsWith(target)
    }

    const Sidebar = () => (
        <aside
            style={{
                background: '#1F4D3D',
                color: '#EAF2ED',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 28,
                width: 248,
                minHeight: '100vh',
                position: 'sticky',
                top: 0,
                height: '100vh',
                overflowY: 'auto',
                flexShrink: 0,
            }}
        >
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
                <div style={{
                    width: 34, height: 34, borderRadius: '50%', background: '#B98A2E',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Fraunces, serif', fontWeight: 700, color: '#1F4D3D', fontSize: 16, flexShrink: 0
                }}>O</div>
                <div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: '#fff' }}>OptioHire</div>
                    <div style={{ fontSize: 10.5, color: '#B9D3C6', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 1 }}>Institution Console</div>
                </div>
            </div>

            {/* Institution chip */}
            {institution && (
                <div style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10
                }}>
                    <div style={{ width: 30, height: 30, borderRadius: 6, background: 'linear-gradient(135deg, #B98A2E, #8f6a1f)', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', lineHeight: 1.25 }}>{institution.name}</div>
                        <div style={{ fontSize: 10.5, color: '#AFCABB' }}>Career Services · KE</div>
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: '#7FA292', margin: '10px 0 2px 10px' }}>Pipeline</div>
                {navItems.map(item => (
                    <Link key={item.tab} href={buildHref(item.href)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px', borderRadius: 8,
                            fontSize: 13.5, color: isActive(item.href) ? '#fff' : '#CFE3D8', fontWeight: isActive(item.href) ? 600 : 400,
                            background: isActive(item.href) ? 'rgba(255,255,255,0.14)' : 'transparent',
                            textDecoration: 'none', transition: 'all .12s ease'
                        }}>
                        <item.icon size={16} style={{ flexShrink: 0, opacity: .85 }} />
                        <span style={{ flex: 1 }}>{item.label}</span>
                    </Link>
                ))}

                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: '#7FA292', margin: '10px 0 2px 10px' }}>Communication</div>
                {communicationNav.map(item => (
                    <Link key={item.tab} href={buildHref(item.href)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px', borderRadius: 8,
                            fontSize: 13.5, color: isActive(item.href) ? '#fff' : '#CFE3D8', fontWeight: isActive(item.href) ? 600 : 400,
                            background: isActive(item.href) ? 'rgba(255,255,255,0.14)' : 'transparent',
                            textDecoration: 'none', transition: 'all .12s ease'
                        }}>
                        <item.icon size={16} style={{ flexShrink: 0, opacity: .85 }} />
                        <span style={{ flex: 1 }}>{item.label}</span>
                    </Link>
                ))}

                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: '#7FA292', margin: '10px 0 2px 10px' }}>Programme</div>
                {programmeNav.map(item => (
                    <Link key={item.tab} href={buildHref(item.href)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px', borderRadius: 8,
                            fontSize: 13.5, color: isActive(item.href) ? '#fff' : '#CFE3D8', fontWeight: isActive(item.href) ? 600 : 400,
                            background: isActive(item.href) ? 'rgba(255,255,255,0.14)' : 'transparent',
                            textDecoration: 'none', transition: 'all .12s ease'
                        }}>
                        <item.icon size={16} style={{ flexShrink: 0, opacity: .85 }} />
                        <span style={{ flex: 1 }}>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#F5EAD2', color: '#1F4D3D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                    {user?.name ? getInitials(user.name) : 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
                    <div style={{ fontSize: 10.5, color: '#9EC1AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
                </div>
                <button onClick={signOut} title="Sign out" style={{ background: 'none', border: 'none', color: '#9EC1AF', cursor: 'pointer', padding: 4 }}>
                    <LogOut size={15} />
                </button>
            </div>
        </aside>
    )

    return (
        <InstitutionContext.Provider value={{ institution, user, token }}>
            <div style={{ display: 'flex', minHeight: '100vh', background: '#F3F5EF', fontFamily: 'Inter, sans-serif' }}>
                {/* Desktop sidebar */}
                <div className="hidden md:block">
                    <Sidebar />
                </div>

                {/* Mobile hamburger */}
                <div className="md:hidden fixed top-4 left-4 z-50">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ background: '#1F4D3D', color: '#fff', border: 'none', borderRadius: 8, padding: 10, cursor: 'pointer' }}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div className="md:hidden fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setSidebarOpen(false)}>
                        <div onClick={e => e.stopPropagation()} style={{ width: 248 }}>
                            <Sidebar />
                        </div>
                    </div>
                )}

                {/* Main content */}
                <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
                    {children}
                </main>
            </div>
        </InstitutionContext.Provider>
    )
}

/** Bluish OptioHire Institution Console design tokens */
export const INST = {
  primary: '#1E3A5F',
  primaryMid: '#2563EB',
  primaryLight: '#3B82F6',
  primaryPale: '#DBEAFE',
  sidebar: '#0F2744',
  sidebarText: '#DBEAFE',
  sidebarMuted: '#93C5FD',
  ink: '#0F172A',
  inkSoft: '#475569',
  paper: '#F1F5F9',
  raised: '#FFFFFF',
  line: '#E2E8F0',
  accent: '#0EA5E9',
  success: '#059669',
  successPale: '#D1FAE5',
  warn: '#D97706',
  warnPale: '#FEF3C7',
  danger: '#DC2626',
  dangerPale: '#FEE2E2',
} as const

export function authHeaders(token: string | null): HeadersInit {
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

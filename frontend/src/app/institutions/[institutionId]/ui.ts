import type { CSSProperties } from 'react'
import { INST } from './theme'

export const card: CSSProperties = {
  background: INST.raised,
  border: `1px solid ${INST.line}`,
  borderRadius: 16,
  padding: 18,
  boxShadow: '0 10px 30px -24px rgba(15,39,68,0.45)',
}

export const pageWrap: CSSProperties = {
  padding: '28px 28px 48px',
  maxWidth: 1280,
}

export const pageTitle: CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  letterSpacing: '-0.03em',
  color: INST.ink,
  margin: 0,
}

export const pageSub: CSSProperties = {
  color: INST.inkSoft,
  marginTop: 8,
  fontSize: 14,
}

export const eyebrow: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: INST.primaryMid,
  marginBottom: 6,
}

export const inputStyle: CSSProperties = {
  width: '100%',
  border: `1px solid ${INST.line}`,
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 14,
  color: INST.ink,
  background: '#fff',
  outline: 'none',
}

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: INST.inkSoft,
  marginBottom: 6,
}

export const btnPrimary: CSSProperties = {
  background: INST.primaryMid,
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '10px 14px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 13.5,
}

export const btnGhost: CSSProperties = {
  background: INST.raised,
  color: INST.primary,
  border: `1px solid ${INST.line}`,
  borderRadius: 10,
  padding: '8px 12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 13,
}

export const statusBadge = (status: string): CSSProperties => {
  const s = (status || '').toLowerCase()
  let bg = INST.primaryPale
  let color = INST.primary
  if (s === 'placed' || s === 'interning' || s === 'success') {
    bg = INST.successPale
    color = INST.success
  } else if (s === 'inactive' || s === 'invited' || s === 'open') {
    bg = INST.warnPale
    color = INST.warn
  } else if (s === 'active' || s === 'activated' || s === 'shortlisted' || s === 'interviewing') {
    bg = INST.primaryPale
    color = INST.primaryMid
  }
  return {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    background: bg,
    color,
    textTransform: 'capitalize',
  }
}

export const tableWrap: CSSProperties = {
  width: '100%',
  overflowX: 'auto',
}

export const th: CSSProperties = {
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  color: INST.inkSoft,
  padding: '10px 12px',
  borderBottom: `1px solid ${INST.line}`,
  whiteSpace: 'nowrap',
}

export const td: CSSProperties = {
  padding: '12px',
  fontSize: 13.5,
  color: INST.ink,
  borderBottom: `1px solid ${INST.line}`,
  verticalAlign: 'middle',
}

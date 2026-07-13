import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom'

type NextLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof RouterLinkProps> &
  Omit<RouterLinkProps, 'to'> & {
    href?: string
    to?: string
    prefetch?: boolean
    legacyBehavior?: boolean
    passHref?: boolean
    children?: ReactNode
  }

/**
 * Drop-in shim for next/link → react-router-dom Link.
 * Supports both `href` (Next) and `to` (Router) props.
 */
const Link = forwardRef<HTMLAnchorElement, NextLinkProps>(function Link(
  { href, to, prefetch: _prefetch, legacyBehavior: _lb, passHref: _ph, ...rest },
  ref
) {
  const destination = to ?? href ?? '/'
  return <RouterLink ref={ref} to={destination} {...rest} />
})

export default Link

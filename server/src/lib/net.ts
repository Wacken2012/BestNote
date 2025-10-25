import ipaddr from 'ipaddr.js'

export function ipInCidr(ip: string, cidr: string): boolean {
  try {
    const addr = ipaddr.parse(ip)
    const range = ipaddr.parseCIDR(cidr)
    return addr.match(range)
  } catch (e) {
    return false
  }
}

export function ipInAnyCidr(ip: string, cidrs: string[]): boolean {
  for (const c of cidrs) {
    if (ipInCidr(ip, c)) return true
  }
  return false
}

import sha256 from 'crypto-js/sha256'
import siteConfig from '../../config/site.config'

// Hash password token with SHA256
function encryptToken(token: string): string {
  return sha256(token).toString()
}

// Fetch stored token from localStorage and encrypt with SHA256
export function getStoredToken(path: string): string | null {
  const storedToken =
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(matchProtectedRoute(path)) as string) : ''
  return storedToken ? encryptToken(storedToken) : null
}

/**
 * Compares the hash of .password and od-protected-token header
 * @param odTokenHeader od-protected-token header (sha256 hashed token)
 * @param dotPassword non-hashed .password file
 * @returns whether the two hashes are the same
 */
export function compareHashedToken({
  odTokenHeader,
  dotPassword,
}: {
  odTokenHeader: string
  dotPassword: string
}): boolean {
  return encryptToken(dotPassword.trim()) === odTokenHeader
}
// 预先计算编码过的受保护路径避免请求时做高昂的字符串 split 与 map 分配
const encodedProtectedRoutes = siteConfig.protectedRoutes.reduce((acc: { original: string; encoded: string }[], r: string) => {
  if (r) {
    acc.push({
      original: r,
      encoded: r.split('/').map(p => encodeURIComponent(p)).join('/'),
    })
  }
  return acc
}, [])

/**
 * Match the specified route against a list of predefined routes
 * @param route directory path
 * @returns whether the directory is protected
 */
export function matchProtectedRoute(route: string): string {
  for (const r of encodedProtectedRoutes) {
    if (route.startsWith(r.encoded)) {
      return r.original
    }
  }
  return ''
}

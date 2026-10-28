// Only same-origin absolute paths may be used as post-auth navigation targets.
// React Router must never receive untrusted protocol-relative or encoded redirects.
export function safeInternalPath(candidate, fallback = '/') {
  if (typeof candidate !== 'string' || !candidate || candidate !== candidate.trim()) return fallback
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return fallback
  if ([...candidate].some((ch) => {
    const code = ch.charCodeAt(0)
    return code < 32 || code === 92 || code === 127
  }) || /%(?:2f|5c|0a|0d)/i.test(candidate)) return fallback
  return candidate
}

// Only allow internal pathnames when restoring a protected route after login.
// Avoid forwarding untrusted protocol-relative and backslash-prefixed paths to React Router.
export const getSafeLoginReturnPath = (value) => {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048) return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  if (value.includes('\\') || [...value].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) return '/';
  if (/%(?:2f|5c|0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) return '/';
  if (/[?#]/.test(value)) return '/';
  return value;
};

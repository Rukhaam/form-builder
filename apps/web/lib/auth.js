export function getUserFromAccessToken(token) {
  if (!token || typeof window === 'undefined') return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalizedPayload = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const decoded = JSON.parse(window.atob(normalizedPayload));

    if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
      return null;
    }

    if (!decoded.id || !decoded.email) {
      return null;
    }

    return { id: decoded.id, email: decoded.email };
  } catch {
    return null;
  }
}

export function getSessionUser() {
  if (typeof window === 'undefined') return null;
  return getUserFromAccessToken(localStorage.getItem('accessToken'));
}

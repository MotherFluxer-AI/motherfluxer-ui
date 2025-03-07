export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

export const isValidHostAddress = (host: string): boolean => {
  // Allow localhost with port
  if (host.startsWith('localhost:')) {
    const port = parseInt(host.split(':')[1])
    return !isNaN(port) && port > 0 && port < 65536
  }

  // Allow URLs
  try {
    new URL(host)
    return true
  } catch {
    return false
  }
}

export const validateRequestPayload = (payload: any): boolean => {
  if (!payload) return false
  if (typeof payload.message !== 'string' || !payload.message) return false
  if (!payload.timestamp || typeof payload.timestamp !== 'number') return false
  return true
} 
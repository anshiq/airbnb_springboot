const BASE = 'http://localhost:8085/api/v1';

async function request(path, options = {}) {
  const token = localStorage.getItem('adminAccessToken');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(BASE + path, { ...options, headers });

  if (res.status === 401) {
    const refreshToken = localStorage.getItem('adminRefreshToken');
    if (refreshToken) {
      const rr = await fetch(BASE + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (rr.ok) {
        const rd = await rr.json();
        localStorage.setItem('adminAccessToken', rd.data.accessToken);
        localStorage.setItem('adminRefreshToken', rd.data.refreshToken);
        headers['Authorization'] = `Bearer ${rd.data.accessToken}`;
        res = await fetch(BASE + path, { ...options, headers });
      } else {
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        window.location.href = '/login';
        return;
      }
    }
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error || data.message || 'Request failed');
  return data.data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) =>
    request(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

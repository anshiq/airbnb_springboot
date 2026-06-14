const BASE = 'http://localhost:8085/api/v1';

async function request(path, options = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(BASE + path, { ...options, headers });

  // auto-refresh on 401
  if (res.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const rr = await fetch(BASE + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (rr.ok) {
        const rd = await rr.json();
        localStorage.setItem('accessToken', rd.data.accessToken);
        localStorage.setItem('refreshToken', rd.data.refreshToken);
        headers['Authorization'] = `Bearer ${rd.data.accessToken}`;
        res = await fetch(BASE + path, { ...options, headers });
      } else {
        localStorage.clear();
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
  post: (path, body) => request(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
).replace(/\/$/, '');

export async function api(path, options = {}) {
  const token = sessionStorage.getItem('ventas_token');
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.'
    );
  }

  let data = null;
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else if (response.status !== 204) {
    data = await response.text();
  }

  if (response.status === 401) {
    sessionStorage.removeItem('ventas_token');
    sessionStorage.removeItem('ventas_user');
    window.dispatchEvent(new Event('auth:expired'));
  }

  if (!response.ok) {
    throw new Error(
      data?.error || data?.mensaje || 'No se pudo completar la solicitud.'
    );
  }

  return data;
}

export const get = (path) => api(path);
export const post = (path, body) =>
  api(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
export const put = (path, body) =>
  api(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
export const patch = (path, body = {}) =>
  api(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
export const del = (path) => api(path, { method: 'DELETE' });

export function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
}

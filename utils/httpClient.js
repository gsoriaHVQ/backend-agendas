const externalAuth = require('./externalAuth');
const { apiLogger } = require('./logger');

async function fetchWithAuth(input, init = {}) {
  const token = await externalAuth.getAccessToken();
  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${token}`);

  let response = await fetch(input, { ...init, headers });
  if (response.status !== 401) return response;

  // Intentar refresh una vez
  apiLogger.warn('401 recibido, intentando refresh de token');
  await externalAuth.refresh();
  const newToken = await externalAuth.getAccessToken();
  headers.set('Authorization', `Bearer ${newToken}`);
  response = await fetch(input, { ...init, headers });
  return response;
}

module.exports = { fetchWithAuth };



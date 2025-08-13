const { apiLogger } = require('./logger');

// Autenticación contra API externa con cache en memoria y refresh automático
class ExternalAuth {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = 0; // epoch ms
    this.clockSkewMs = 60_000; // 60s de margen
  }

  get authUrl() {
    return process.env.EXTERNAL_AUTH_URL;
  }

  get refreshUrl() {
    return process.env.EXTERNAL_AUTH_REFRESH_URL || '';
  }

  get username() {
    return process.env.EXTERNAL_AUTH_USERNAME;
  }

  get password() {
    return process.env.EXTERNAL_AUTH_PASSWORD;
  }

  isTokenValid() {
    return Boolean(this.accessToken) && Date.now() + this.clockSkewMs < this.expiresAt;
  }

  async login() {
    const body = new URLSearchParams({
      Username: this.username,
      Password: this.password
    });

    apiLogger.info('Autenticando contra API externa');
    const res = await fetch(this.authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });

    if (!res.ok) {
      let reason = '';
      try { reason = await res.text(); } catch (_) {}
      apiLogger.error('Falló autenticación externa', { status: res.status, reason });
      throw new Error(`Error al autenticar: ${res.status} ${reason}`);
    }

    const data = await res.json();
    this.setTokensFromResponse(data);
    return data;
  }

  async refresh() {
    if (!this.refreshUrl || !this.refreshToken) {
      apiLogger.warn('No hay refresh_url o refresh_token; intentando login');
      return this.login();
    }

    const body = new URLSearchParams({
      refresh_token: this.refreshToken
    });

    apiLogger.info('Refrescando token contra API externa');
    const res = await fetch(this.refreshUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });

    if (!res.ok) {
      let reason = '';
      try { reason = await res.text(); } catch (_) {}
      apiLogger.warn('Fallo refresh, reintentando login', { status: res.status, reason });
      return this.login();
    }

    const data = await res.json();
    this.setTokensFromResponse(data);
    return data;
  }

  getStatus() {
    return {
      hasAccessToken: Boolean(this.accessToken),
      hasRefreshToken: Boolean(this.refreshToken),
      expiresAt: this.expiresAt,
      expiresInMs: Math.max(0, this.expiresAt - Date.now()),
      isValid: this.isTokenValid()
    };
  }

  setTokensFromResponse(data) {
    this.accessToken = data.access_token || data.accessToken || null;
    this.refreshToken = data.refresh_token || data.refreshToken || null;
    const expiresInSec = Number(data.expires_in || data.expiresIn || 0);
    this.expiresAt = Date.now() + Math.max(0, expiresInSec) * 1000;
  }

  async getAccessToken() {
    if (this.isTokenValid()) return this.accessToken;
    try {
      if (this.refreshToken) {
        await this.refresh();
      } else {
        await this.login();
      }
    } catch (err) {
      apiLogger.error('Error obteniendo token', { error: err.message });
      throw err;
    }
    return this.accessToken;
  }
}

module.exports = new ExternalAuth();



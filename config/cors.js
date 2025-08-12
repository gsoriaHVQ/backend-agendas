const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:3002',
  'http://localhost:8081',
  'http://localhost:8082', 
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:4200',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:4200'
];

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

const ALLOWED_HEADERS = ['Content-Type', 'Authorization', 'X-Requested-With'];

class CorsConfig {
  static getOptions() {
    return {
      origin: this.isDevelopment() ? ALLOWED_ORIGINS : this.getProductionOrigins(),
      methods: ALLOWED_METHODS,
      allowedHeaders: ALLOWED_HEADERS,
      credentials: true,
      optionsSuccessStatus: 200
    };
  }

  static isDevelopment() {
    return process.env.NODE_ENV !== 'production';
  }

  static getProductionOrigins() {
    return process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
  }
}

module.exports = CorsConfig;

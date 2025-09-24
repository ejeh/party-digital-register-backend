export default () => ({
  server: {
    port: process.env.PORT || 3000,
  },
  database: {
    connectionString: process.env.MONGO_URL,
  },
  security: {
    encryptionSecretKey: process.env.AUTH_SECRET || 'fallback-secret-key',
  },
});

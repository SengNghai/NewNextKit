import defineConfig from './envConfig'
export default defineConfig({
    dbCredentials: {
      connectionString: process.env.DATABASE_URL!,
    },
  })
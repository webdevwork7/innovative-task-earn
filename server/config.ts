// Configuration for development vs production mode
export const config = {
  // Set to 'development' for local testing with sample data
  // Set to 'production' for live deployment with real database
  MODE: process.env.APP_MODE || 'development',
  
  // Database configuration
  database: {
    // In development: use fallbacks when database is unavailable
    // In production: require database connection
    requireConnection: process.env.APP_MODE === 'production',
    fallbackEnabled: process.env.APP_MODE !== 'production'
  },
  
  // Session configuration  
  session: {
    // In development: use memory store as fallback
    // In production: require PostgreSQL session store
    usePostgreSQLStore: process.env.APP_MODE === 'production',
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production'
  },
  
  // Payment configuration
  payment: {
    // Cashfree is always in production mode as configured
    // But we can add development bypasses if needed
    environment: 'PRODUCTION' // Keep production API for real payments
  }
};

export const isDevelopment = () => config.MODE === 'development';
export const isProduction = () => config.MODE === 'production';

// Production mode activation command
export const PRODUCTION_ACTIVATION_COMMAND = `
To switch to production mode:
1. Set environment variable: APP_MODE=production
2. Ensure DATABASE_URL is active in Neon dashboard
3. Set SESSION_SECRET environment variable
4. Restart the application

Or run: npm run deploy:production
`;
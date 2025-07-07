export const ENV = {
  GOOGLE_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  MONGODB_URI: process.env.MONGODB_URI,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  MEM0_API_KEY: process.env.MEM0_API_KEY,
  MEM0_BASE_URL: process.env.MEM0_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
} as const;

export const isDevelopment = ENV.NODE_ENV === 'development';
export const isProduction = ENV.NODE_ENV === 'production';

export function validateEnv() {
  const required = [
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'MONGODB_URI', 
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

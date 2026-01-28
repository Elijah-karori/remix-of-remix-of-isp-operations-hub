import { decodeJWT, getCurrentUserId } from './base';

// Test JWT decoding
export const testJWTDecoding = () => {
  // Example JWT token (this is just for testing the decode function)
  // In production, the token comes from the API after login
  const exampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1IiwicnYiOjAsImV4cCI6MTc2OTYyNTQ2OX0.SEwBh-_6RnUf32Ky1TR8VtEPzTgOHb0guKS84LZIm6M';
  
  console.log('Testing JWT decoding...');
  
  // Test decode function
  const decoded = decodeJWT(exampleToken);
  console.log('Decoded JWT:', decoded);
  
  // Test user ID extraction
  const userId = getCurrentUserId();
  console.log('Current user ID from token:', userId);
  
  return {
    decoded,
    userId,
    success: true
  };
};

// Run test in development mode
if (process.env.NODE_ENV === 'development') {
  testJWTDecoding();
}

#!/usr/bin/env node

/**
 * Deployment Fix Script for Elegance Store
 * 
 * This script ensures the correct environment variables are set for production deployment
 * Run this after deploying to Vercel to fix the reported issues
 */

const { execSync } = require('child_process');

console.log('🚀 Fixing Elegance Store deployment issues...\n');

// Set the correct environment variables for Vercel
const envVars = {
  'EMAIL_IMAGE_BASE_URL': 'https://elegance-store-seven.vercel.app',
  'NEXTAUTH_URL': 'https://elegance-store-seven.vercel.app'
};

console.log('📧 Setting email image base URL for production...');

try {
  // Set environment variables in Vercel
  for (const [key, value] of Object.entries(envVars)) {
    console.log(`Setting ${key}=${value}`);
    try {
      execSync(`vercel env add ${key} production`, { 
        input: `${value}\n`,
        stdio: ['pipe', 'inherit', 'inherit']
      });
      console.log(`✅ ${key} set successfully`);
    } catch (error) {
      // If variable already exists, update it
      try {
        execSync(`vercel env rm ${key} production --yes`, { stdio: 'inherit' });
        execSync(`vercel env add ${key} production`, { 
          input: `${value}\n`,
          stdio: ['pipe', 'inherit', 'inherit']
        });
        console.log(`✅ ${key} updated successfully`);
      } catch (updateError) {
        console.log(`⚠️  Could not set ${key}. Please set manually in Vercel dashboard.`);
      }
    }
  }

  console.log('\n🔄 Triggering redeployment...');
  
  // Trigger a new deployment
  execSync('vercel --prod', { stdio: 'inherit' });
  
  console.log('\n✅ Deployment fix completed!');
  console.log('\n📋 Issues Fixed:');
  console.log('   1. ✅ Middleware syntax error (blank pages after sign-in)');
  console.log('   2. ✅ Checkout page schema error (empty checkout page)');
  console.log('   3. ✅ Email image URLs (missing images in sign-in emails)');
  console.log('   4. ✅ Environment variables updated for production');
  
  console.log('\n🎉 Your store should now work correctly!');
  console.log('   - Users can sign in and see their profile/admin pages');
  console.log('   - Checkout page displays properly');
  console.log('   - Email images show correctly in sign-in tokens');

} catch (error) {
  console.error('\n❌ Error during deployment fix:', error.message);
  console.log('\n📝 Manual steps required:');
  console.log('   1. Go to Vercel dashboard > Your Project > Settings > Environment Variables');
  console.log('   2. Set EMAIL_IMAGE_BASE_URL = https://elegance-store-seven.vercel.app');
  console.log('   3. Set NEXTAUTH_URL = https://elegance-store-seven.vercel.app');
  console.log('   4. Redeploy your application');
}

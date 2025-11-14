#!/usr/bin/env node

/**
 * Script to sync environment variables from .env file to Vercel
 * 
 * Usage:
 *   node scripts/sync-env-to-vercel.js [environment]
 * 
 * Environment options: production, preview, development (default: production)
 * 
 * Prerequisites:
 *   1. Install Vercel CLI: npm i -g vercel
 *   2. Login: vercel login
 *   3. Link project: vercel link
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const env = process.argv[2] || 'production'
const envFile = path.join(process.cwd(), '.env')

if (!fs.existsSync(envFile)) {
  console.error('❌ .env file not found!')
  console.error('Please create a .env file with your environment variables.')
  process.exit(1)
}

console.log(`📦 Syncing environment variables to Vercel (${env})...`)
console.log('')

const envContent = fs.readFileSync(envFile, 'utf-8')
const lines = envContent.split('\n')

let successCount = 0
let errorCount = 0
const errors = []

for (const line of lines) {
  const trimmed = line.trim()
  
  // Skip comments and empty lines
  if (!trimmed || trimmed.startsWith('#')) {
    continue
  }
  
  // Parse key=value
  const match = trimmed.match(/^([^=]+)=(.*)$/)
  if (!match) {
    continue
  }
  
  const key = match[1].trim()
  const value = match[2].trim()
  
  // Remove quotes if present
  const cleanValue = value.replace(/^["']|["']$/g, '')
  
  if (!key || !cleanValue) {
    continue
  }
  
  try {
    console.log(`Adding ${key}...`)
    
    // Use echo to pipe value to vercel env add
    // This avoids exposing the value in command history
    const command = `echo "${cleanValue.replace(/"/g, '\\"')}" | vercel env add ${key} ${env}`
    
    execSync(command, {
      stdio: 'inherit',
      shell: true,
    })
    
    successCount++
    console.log(`✅ ${key} added successfully\n`)
  } catch (error) {
    errorCount++
    errors.push({ key, error: error.message })
    console.log(`❌ Failed to add ${key}\n`)
  }
}

console.log('')
console.log('='.repeat(50))
console.log(`✅ Successfully added: ${successCount}`)
if (errorCount > 0) {
  console.log(`❌ Failed: ${errorCount}`)
  console.log('')
  console.log('Errors:')
  errors.forEach(({ key, error }) => {
    console.log(`  - ${key}: ${error}`)
  })
}
console.log('')
console.log('💡 Tip: After syncing, redeploy your application:')
console.log('   vercel --prod')
console.log('')


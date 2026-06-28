const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        // Remove quotes if present
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error("Error loading .env file:", e);
}

console.log("-----------------------------------------");
console.log("SMTP Host:", process.env.SMTP_HOST);
console.log("SMTP Port:", process.env.SMTP_PORT);
console.log("SMTP User:", process.env.SMTP_USER);
console.log("-----------------------------------------");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: parseInt(process.env.SMTP_PORT || '587') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function runTests() {
  const testRecipient = process.env.SMTP_USER; // Send to ourselves for testing
  
  // Test 1: Send from primary support email
  try {
    console.log(`\nTest 1: Sending test email from primary address (support@elegancestore.online)...`);
    await transporter.sendMail({
      from: `"Elegance Store Support" <support@elegancestore.online>`,
      to: testRecipient,
      subject: "Test 1: Support Email Connection Test",
      text: "This is a test email sent using the primary support email address credentials.",
    });
    console.log("✅ Test 1 Succeeded!");
  } catch (error) {
    console.error("❌ Test 1 Failed:", error.message);
  }

  // Test 2: Send from orders alias
  try {
    console.log(`\nTest 2: Sending test email from alias (orders@elegancestore.online)...`);
    await transporter.sendMail({
      from: '"Elegance Store Orders" <orders@elegancestore.online>',
      to: testRecipient,
      subject: "Test 2: Orders Email Alias Test",
      text: "This is a test email sent using the orders alias address.",
    });
    console.log("✅ Test 2 Succeeded!");
  } catch (error) {
    console.error("❌ Test 2 Failed:", error.message);
  }

  // Test 3: Send from contact-us alias
  try {
    console.log(`\nTest 3: Sending test email from alias (contact-us@elegancestore.online)...`);
    await transporter.sendMail({
      from: '"Elegance Store Contact" <contact-us@elegancestore.online>',
      to: testRecipient,
      subject: "Test 3: Contact Email Alias Test",
      text: "This is a test email sent using the contact-us alias address.",
    });
    console.log("✅ Test 3 Succeeded!");
  } catch (error) {
    console.error("❌ Test 3 Failed:", error.message);
  }

  process.exit();
}

runTests();

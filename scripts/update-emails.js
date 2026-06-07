const fs = require('fs');
let content = fs.readFileSync('lib/email.ts', 'utf8');

content = content.replace(/<td style="background: linear-gradient\([^>]+>\s*<h1/g, (match) => {
  return match.replace('<h1', '<img src="${EMAIL_IMAGE_BASE_URL}/logo.png" alt="${STORE_NAME} Logo" style="height: 50px; display: block; margin: 0 auto 10px auto;" />\n                      <h1');
});

fs.writeFileSync('lib/email.ts', content);
console.log("Replaced email headers.");

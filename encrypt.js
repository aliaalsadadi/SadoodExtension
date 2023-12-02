const crypto = require('crypto');

const SECRET_KEY = "mySecretKey";
const SALT = "mySalt";
const INIT_VECTOR = "myInitVector1234";
function encrypt(input) {
    const cipher = crypto.createCipheriv('aes-256-cbc', generateSecretKey(), Buffer.from(INIT_VECTOR, 'utf8'));
    let encrypted = cipher.update(input, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }
function decrypt(encryptedInput) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', generateSecretKey(), Buffer.from(INIT_VECTOR, 'utf8'));
  let decrypted = decipher.update(encryptedInput, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function generateSecretKey() {
  const key = crypto.pbkdf2Sync(SECRET_KEY, SALT, 65536, 32, 'sha256');
  return key;
}
exports.encrypt = encrypt;
exports.decrypt = decrypt;
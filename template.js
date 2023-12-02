const { MongoClient } = require('mongodb');
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
async function getUserPasswds(client, username){
    const result = await client.db("passwords").collection("passwords").findOne({ username: username });

    if (result) {
        console.log(`Found a listing in the collection with the name '${username}':`);
        return result["Main-password"];
    } else {
        console.log(`No listings found with the name '${username}'`);
    }
}
async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/drivers/node/ for more details
     */
    const uri = "mongodb://localhost:27017/";
    
    /**
     * The Mongo Client you will use to interact with your database
     * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
     * In case: '[MONGODB DRIVER] Warning: Current Server Discovery and Monitoring engine is deprecated...'
     * pass option { useUnifiedTopology: true } to the MongoClient constructor.
     * const client =  new MongoClient(uri, {useUnifiedTopology: true})
     */
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        const passwds = await getUserPasswds(client, "aliaalsadadi@outlook.com");
        console.log(passwds);
        // const decryptedPasswords = passwds.map(obj => {
        //     return {
        //       url: obj.url,
        //       email: obj.email,
        //       passwd: decrypt(obj.passwd)
        //     };
        //   });
        // console.log(decryptedPasswords);

    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}

main().catch(console.error);
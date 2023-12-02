var express = require("express");
const { MongoClient } = require('mongodb');
const cors = require('cors');
var encoder = require('./encrypt.js');
const encrypt = encoder.encrypt;
const decrypt = encoder.decrypt;
const app = express();

app.use(express.json());
app.use(cors()); // Enable CORS

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

async function getuser(client, username) {
  const result = await client.db("passwords").collection("passwords").findOne({ username: username });
  return result;
}

app.post("/verify/:person", async (req, res) => {
  const person = req.params.person;
  // Process the person parameter
  console.log("Person:", person);

  const uri = "mongodb://localhost:27017/";
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const user = await getuser(client, person);
    if (user !== null) {
      res.send({ "verified": user["verified"] });
    } else {
      res.send(false);
    }
  } finally {
    await client.close();
  }
});

app.post("/add", async (req, res) => {
    const email = req.body.email;
    const passwd = req.body.passwd;
    const url = req.body.url;  
    const username = req.body.usr;
    const uri = "mongodb://localhost:27017/";
    const client = new MongoClient(uri);
    const doc = { url: url, email: email, passwd: encrypt(passwd) };
  
    try {
      await client.connect();
  
      const user = await getuser(client, username);
      if (user !== null) {
        await client.db("passwords").collection("passwords").updateOne(
          { _id: user._id },
          { $addToSet: { passwords: doc } }
        );
        res.send({"added": true});
      } else {
        res.send({"added": false});
      }
    } finally {
      await client.close();
    }
  });
  app.post("/getCreds", async (req, res) => {
    const username = req.body.usr;
    const url = req.body.url;
    console.log(url);
    const uri = "mongodb://localhost:27017/";
    const client = new MongoClient(uri);
  
    try {
      await client.connect();
  
      const user = await client
        .db("passwords")
        .collection("passwords")
        .findOne({ username: username });
  
  
      if (user !== null && user.passwords.length > 0) {
        const passwords = user.passwords;
        const cred = passwords.find(password => password.url === url);
        console.log(cred);
        if (cred !== null && cred !== undefined){
            res.json({email:cred.email, passwd: decrypt(cred.passwd)});
        }else{
            res.json(null);
        }
      } else {
        res.json(null);
      }
    } finally {
      await client.close();
    }
  });
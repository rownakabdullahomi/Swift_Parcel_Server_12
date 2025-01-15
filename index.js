require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 5000
const app = express()

app.use(cors());
app.use(express.json())
app.use(morgan('dev'))









const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d3h8n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const userCollection = client.db("swiftParcelDB").collection("users");


    // user related apis
    app.post("/users", async (req, res) => {
        const user = req.body;
        // check if the user already exists...
        const query = { email: user.email }
        const existingUser = await userCollection.findOne(query);
  
        if (existingUser) {
          return res.send({ message: "user already exists", insertedId: null });
        }
        const result = await userCollection.insertOne({...user, timestamp: Date.now()});
        res.send(result);
      })

      // get a specific user data
      app.get("/user/role/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email }
        const result = await userCollection.findOne(query);
        res.send(result);
      })

















    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Hello from SwiftParcel Server..')
  })
  
  app.listen(port, () => {
    console.log(`SwiftParcel is running on port ${port}`)
  })
  



// GitHub Repository Link
// https://github.com/Programming-Hero-Web-Course4/b10a12-server-side-rownakabdullahomi
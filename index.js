require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.deftcj8.mongodb.net/?appName=Cluster0`;

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
    await client.connect();

    const userCollection = client.db('tourismDB').collection('user');
    const touristPlacesCollection = client.db('tourismDB').collection('touristPlaces');

    //Tourist Places related APIs
    // app.get('/tourist-places', async (req, res) => {
    //   const cursor = touristPlacesCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    app.post('/tourist-places', async (req, res) => {
      const place = req.body;
      const result = await touristPlacesCollection.insertOne(place);
      res.send(result);
    });

    //User related APIs
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.patch('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = {
        $set: {
          lastLoggedAt: user.lastLoggedAt
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Tourism Server is running');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
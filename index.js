
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'https://tourism-server-rose.vercel.app',
    //'https://tourism-43055.web.app', // Add your Firebase link
    //'https://tourism-43055.firebaseapp.com'
  ],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions));
//app.options('*', cors(corsOptions));

app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.deftcj8.mongodb.net/?appName=Cluster0`;

//Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
    //await client.connect();

    const userCollection = client.db('tourismDB').collection('user');
    const touristPlacesCollection = client.db('tourismDB').collection('touristPlaces');

    //Tourist Places related APIs
    //Read all tourist places
    app.get('/tourist-spots', async (req, res) => {
      const cursor = touristPlacesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get spots added by a specific user
    app.get('/my-list/:email', async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await touristPlacesCollection.find(query).toArray();
      res.send(result);
    });

    //update a spot
    app.get('/tourist-spots/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await touristPlacesCollection.findOne(query);
      res.send(result);
    });

    app.put('/tourist-spots/:id', async (req, res) => {
      const id = req.params.id;
      const updatedSpot = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          image: updatedSpot.image,
          spotName: updatedSpot.spotName,
          country: updatedSpot.country,
          location: updatedSpot.location,
          description: updatedSpot.description,
          averageCost: updatedSpot.averageCost,
          season: updatedSpot.season,
          travelTime: updatedSpot.travelTime,
          totalVisitors: updatedSpot.totalVisitors,
          userEmail: updatedSpot.userEmail,
          userName: updatedSpot.userName,
        },
      };
      const result = await touristPlacesCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // Delete a spot
    app.delete('/tourist-spots/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await touristPlacesCollection.deleteOne(query);
      res.send(result);
    });

    //Add a new tourist place
    app.post('/tourist-spots', async (req, res) => {
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

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
}


module.exports = app;
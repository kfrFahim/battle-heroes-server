const express = require('express');
const cors = require('cors');
require("dotenv").config();
const app =express();
const port = process.env.PORT || 5000;

// Middlewere
app.use(cors());
app.use(express.json());

// Mongodb


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6eoz53h.mongodb.net/?retryWrites=true&w=majority`;

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
    // Send a ping to confirm a successful connection

    
    const toysCollection = client.db('battleheroes').collection('alltoys');
    
    const indexKeys = {name : 1};
    const indexOption = {name : "toyname"}

    const result = await toysCollection.createIndex(indexKeys,indexOption);



    app.get("/searchtoy/:text" , async(req ,res)=>{
      const searchToy = req.params.text;

      const result = await toysCollection.find({
        $or : [
          {name: {$regex: searchToy, $options: "i"}}
        ],
      }).toArray();

      res.send(result)
    });



    app.get("/alltoys" , async(req,res)=>{
     const cursos = toysCollection.find();
     const result = await cursos.toArray();
     res.send(result);
    })

    // Post a toy

    app.post("/addtoy" , async(req, res)=>{
      const body = req.body;
      const result = await toysCollection.insertOne(body);
      res.send(result);
      console.log(body);
    })

    app.get("/mytoys", async(req ,res) => {
      const result = await toysCollection.find({}).toArray();
      res.send(result);
    })

    app.get("/mytoys/:email" , async(req,res) => {
      console.log(req.params.email);
      const result = await toysCollection.find({postedBy : req.params.email}).toArray();
      res.send(result);
  })

  app.delete("/mytoys/:id" , async(req ,res) => {
    const id = req.params.id;
    const query = {_id : new ObjectId(id)}
    const result = await toysCollection.deleteOne(query);
    res.send(query)
  })




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
//     await client.close();
  }
}
run().catch(console.dir);



app.get("/" ,(req,res)=>{
     res.send("BattleHeroes Server Running")
})

app.listen(port , () => {
     console.log(`BattleHeroes server is running on port ${port}`);
})
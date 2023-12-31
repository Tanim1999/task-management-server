const express = require('express');
const app = express();
const cors = require('cors');

require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pxdxtq4.mongodb.net/?retryWrites=true&w=majority`;

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

        const taskCollection = client.db("task-management").collection("tasks");
        
        app.post('/tasks', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
            console.log(result)
        });
        app.get('/tasks', async (req, res) => {
            try {

                
                const email = req.query.email
                const status = req.query.status


                const query = {}


                if (email) {
                    query.email = email
                }
                if (status) {
                    query.status = status
                }


                const cursor = taskCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching assets:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        app.get('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.findOne(query);
            res.send(result);
        })
        app.patch('/tasks/:id', async (req, res) => {
            const task = req.body;
            const id = req.params.id;
            const options = { upsert: true };
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                   
                    title:  task.title,
                    
                    priority:  task.priority,
                    description:  task.description,
                    status:task.status

                }
            }

            const result = await taskCollection.updateOne(filter, updatedDoc, options)
            res.send(result);
        })
        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        })






        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('task management in running')

})
app.listen(port, () => {
    console.log(`task management is running on port ${port}`);
})

require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  async function run() {
    try {
      // Connect to the MongoDB cluster
      await client.connect();
      console.log('Connected to MongoDB');
  
      const db = client.db('entries'); // Replace with your database name
      const entriesCollection = db.collection('entries'); // Use the collection name
  
      // Endpoint to add a new entry
      app.post('/api/entries', async (req, res) => {
        const entry = req.body;
        console.log('Received entry:', entry); // Log the entry data
      
        try {
          // Ensure the time is converted to a Date object if necessary
          entry.time = new Date(entry.time);
      
          // Validate the entry
          if (!entry.name || !entry.phone || !entry.time || !entry.location || !entry.city) {
            return res.status(400).send({ error: 'All fields are required' });
          }
      
          const result = await entriesCollection.insertOne(entry);
          console.log('Insert result:', result); // Log the entire result object
      
          // Check if the insertion was successful
          if (result && result.insertedId) {
            const insertedEntry = { ...entry, _id: result.insertedId }; // Add the MongoDB ID to the entry
            return res.status(201).send(insertedEntry); // Return the created entry
          } else {
            console.error('Insertion failed, result does not contain insertedId:', result);
            return res.status(500).send({ error: 'Failed to retrieve inserted entry' });
          }
        } catch (error) {
          console.error('Error adding entry:', error); // Log the detailed error
          res.status(500).send({ error: 'Failed to add entry', details: error.message });
        }
      });
      
      app.delete('/api/entries/old', async (req, res) => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1); // Set the date to one month ago
      
        try {
          const result = await entriesCollection.deleteMany({ time: { $lt: oneMonthAgo } }); // Delete entries older than one month
          console.log('Old entries deleted:', result.deletedCount);
          res.status(200).send({ message: `${result.deletedCount} entries deleted.` });
        } catch (error) {
          console.error('Error deleting old entries:', error);
          res.status(500).send({ error: 'Failed to delete old entries' });
        }
      });
      
  
      // Endpoint to get entries with filtering
      app.get('/api/entries', async (req, res) => {
        const { datetime, range, direction, city } = req.query;
      
        const query = {};
      
        if (datetime) {
          const startTime = new Date(datetime);
          const hoursRange = range ? parseInt(range, 10) : 0; // Convert range to an integer
      
          // Calculate the start and end time for filtering
          const startFilterTime = new Date(startTime.getTime() - hoursRange * 60 * 60 * 1000); // Subtract range
          const endFilterTime = new Date(startTime.getTime() + hoursRange * 60 * 60 * 1000); // Add range
      
          query.time = { $gte: startFilterTime, $lte: endFilterTime };
        }
      
        if (direction) {
          query.direction = direction; // Filter by direction if provided
        }
      
        if (city) {
          query.city = city; // Filter by city if provided
        }
      
        try {
          const entries = await entriesCollection.find(query).toArray();
          console.log('Entries found:', entries); // Debugging line
          res.send(entries);
        } catch (error) {
          console.error('Failed to retrieve entries:', error);
          res.status(500).send({ error: 'Failed to retrieve entries' });
        }
      });
  
    } catch (error) {
      console.error('Error connecting to MongoDB', error);
    }
  }
  
  // Start the server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  // Call the run function to start the connection
  run().catch(console.error);
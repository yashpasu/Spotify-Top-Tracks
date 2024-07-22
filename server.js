//Access webpage from following link: http://localhost:3306/index.html

const express = require('express');
const bodyParser = require('body-parser');
//const mysql = require('mysql2');
const mysql = require('mysql2/promise');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();
const env = process.env;

const app = express();
const port = 3306;

//Create an HTTP server
const server = http.createServer(app);

//Initialize WebSocket server
const wss = new WebSocket.Server({ server });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//Set up the MySQL database connection
const db = mysql.createConnection({
    host: env.DB_HOST || 'localhost',
    user: env.DB_USER || 'yashp',
    password: env.DB_PASSWORD || '123456',
    database: env.DB_NAME || 'spotify',
    port: 3006,
    waitForConnections: true,
    connectionLimit: env.DB_CONN_LIMIT || 2,
    queueLimit: 0,
    debug: env.DB_DEBUG || false,
    connectTimeout: 5000
});


//API endpoint to get the latest 20 searches
//http://localhost:3306/api/latest-searches
app.get('/api/latest-searches', async (req, res) => {
  try {
    const connection = await db;
    const rows = await connection.query("SELECT artist, country, trackCount FROM searches ORDER BY id DESC LIMIT 20");
    res.json(rows);
  }
  catch (err){
    console.error('Error fetching last 20 searches:', err);
    res.status(500).json({ error: err.message });
  }
});

//API endpoint to search for artist all tracks
app.post('/api/top-tracks', async (req, res) => {
  try {
    artist = req.query.artistName;
    country = req.query.countryName;
    noOfTracks = req.query.tracksLength;

    (await db).connect;
    console.log('Connected to the MySQL database');
    const connection = await db;
    connection.query("INSERT INTO searches (artist, country, trackCount) VALUES (?, ?, ?)", [artist, country, noOfTracks]);

  } 
  catch (error) {
    console.error('Error fetching all artists tracks:', error);
    res.status(500).json({ error: error.message });
  }
});



//Initiate websocket connection
wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  ws.on('message', (message) => {
    console.log('Received message:', message);
    const parsedMessage = JSON.parse(message);
    const userMessage = {
      user: parsedMessage.user,
      message: parsedMessage.message
    };

    //Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(userMessage));
      }
    });
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

//Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



// server.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors middleware

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const POST_SESSION_URL = "https://script.google.com/macros/s/AKfycbx92sgpxAQ4TFtPmF-1hxFx9jVjqYr98pHFx_yZJyVBl1O-o5SlUURXq-aiBXOxKmHjUg/exec";
const GET_DEVS_URL = "https://script.google.com/macros/s/AKfycbzt3L2SVBV7iKb0rTT8fSVfKYFPAO9y0Pe-tvCCvvN3e2BGOQs_K7r5401QaebtrPq5kA/exec";

app.use(express.json());

app.use(cors());

app.get('/api/get-developers', async (req, res) => {
    try {
        const response = await axios.get(GET_DEVS_URL);
        console.log(response)
        res.json(response.data);
    } catch (error) {
        console.error('GET Error:', error);
        res.status(500).json({ error: 'Failed to get data from Google Apps Script' })
    }
})

app.post('/api/send-data', async (req, res) => {
  try {
    const postData = req.body;
    const response = await axios.post(POST_SESSION_URL, postData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log("response", response);
    res.json(response.data);
  } catch (error) {
    console.error('POST Error:', error);
    res.status(500).json({ error: 'Failed to send data to Google Apps Script' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

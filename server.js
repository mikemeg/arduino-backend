const express = require('express');
const cors = require('cors'); // ✅ Εισαγωγή του CORS πακέτου

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // ✅ Ενεργοποίηση CORS για όλα τα origins
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Αποθηκευμένα δεδομένα από τις συσκευές
const devices = {};

// Endpoint POST /update από Arduino
app.post('/update', (req, res) => {
  const { device, lat, lng, sats, state } = req.body;

  if (!device || !lat || !lng) {
    return res.status(400).json({ error: 'Missing data' });
  }

  devices[device] = {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    sats: parseInt(sats),
    state: state || 'OFF',
    timestamp: new Date().toISOString()
  };

  console.log(`📡 Received update from ${device}:`, devices[device]);

  res.json({ status: 'ok' });
});

// Endpoint GET /get?device=karouli1 από το frontend
app.get('/get', (req, res) => {
  const { device } = req.query;

  if (!device || !devices[device]) {
    return res.status(404).json({ error: 'Device not found' });
  }

  res.json(devices[device]);
});

// Ξεκινάμε τον server
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});

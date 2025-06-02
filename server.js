const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Συσκευές και οι τελευταίες καταστάσεις τους
const devices = {};

// ✅ Endpoint POST /update από το Arduino
app.post('/update', (req, res) => {
  const { device, lat, lng, sats, state } = req.body;

  if (!device || !lat || !lng) {
    return res.status(400).json({ error: 'Missing data' });
  }

  devices[device] = {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    sats: parseInt(sats),
    state: state || devices[device]?.state || 'OFF',
    timestamp: new Date().toISOString()
  };

  console.log(`📡 [GPS UPDATE] ${device}:`, devices[device]);

  res.json({ status: 'ok' });
});

// ✅ Endpoint GET /get?device=karouli1 από frontend
app.get('/get', (req, res) => {
  const { device } = req.query;

  if (!device || !devices[device]) {
    return res.status(404).json({ error: 'Device not found' });
  }

  res.json(devices[device]);
});

// ✅ ΝΕΟ endpoint για αλλαγή κατάστασης από frontend
app.post('/update-state', (req, res) => {
  const { device, state } = req.body;

  if (!device || !['ON', 'OFF'].includes(state)) {
    return res.status(400).json({ error: 'Missing or invalid device/state' });
  }

  if (!devices[device]) {
    devices[device] = { lat: null, lng: null, sats: 0 };
  }

  devices[device].state = state;
  devices[device].timestamp = new Date().toISOString();

  console.log(`🔄 [STATE UPDATE] ${device}: ${state}`);

  res.json({ status: 'state updated' });
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});

const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const devicesDir = path.join(__dirname, "devices");
if (!fs.existsSync(devicesDir)) fs.mkdirSync(devicesDir);

// POST από Arduino
app.post("/update", (req, res) => {
  const { device, lat, lng, sats, state } = req.body;
  if (!device) return res.status(400).json({ error: "Missing device" });

  const data = {
    device,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    sats: parseInt(sats),
    state: state || "OFF",
    timestamp: Date.now()
  };

  fs.writeFile(
    path.join(devicesDir, `${device}.json`),
    JSON.stringify(data),
    () => res.json({ success: true })
  );
});

// GET από browser
app.get("/get/:device", (req, res) => {
  const file = path.join(devicesDir, `${req.params.device}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "Device not found" });

  fs.readFile(file, (err, content) => {
    if (err) return res.status(500).json({ error: "Read error" });
    res.setHeader("Content-Type", "application/json");
    res.send(content);
  });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

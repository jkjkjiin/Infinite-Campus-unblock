import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 2000;
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1";
}
const localIP = getLocalIP();
app.use(express.static(__dirname));
app.use((req, res) => {
  res.status(404).send("File Not Found");
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Running On: http://${localIP}:${PORT}`);
});
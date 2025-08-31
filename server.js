const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Hotel Room Data
 * Floor 1-9: 101–110, 201–210, ...
 * Floor 10: 1001–1007
 */
let rooms = {};

// Initialize rooms
function initRooms() {
  rooms = {};
  for (let f = 1; f <= 9; f++) {
    rooms[f] = [];
    for (let r = 1; r <= 10; r++) {
      rooms[f].push({ number: f * 100 + r, booked: false });
    }
  }
  rooms[10] = [];
  for (let r = 1; r <= 7; r++) {
    rooms[10].push({ number: 1000 + r, booked: false });
  }
}
initRooms();

// Random occupancy
function randomOccupancy() {
  for (let f in rooms) {
    rooms[f].forEach(room => {
      room.booked = Math.random() < 0.3; // 30% chance booked
    });
  }
}

// Utility to get available rooms
function getAvailableRooms() {
  let available = [];
  for (let f in rooms) {
    available.push(...rooms[f].filter(r => !r.booked));
  }
  return available;
}

// Booking algorithm (simple greedy for demo)
function bookRooms(count) {
  let selected = [];

  // Step 1: Try same floor
  for (let f in rooms) {
    let available = rooms[f].filter(r => !r.booked);
    if (available.length >= count) {
      selected = available.slice(0, count);
      break;
    }
  }

  // Step 2: If not enough, take from multiple floors
  if (selected.length === 0) {
    let available = getAvailableRooms();
    selected = available.slice(0, count);
  }

  // Mark booked
  selected.forEach(r => {
    for (let f in rooms) {
      let idx = rooms[f].findIndex(x => x.number === r.number);
      if (idx !== -1) rooms[f][idx].booked = true;
    }
  });

  return selected;
}

// Reset booking
app.get("/reset", (req, res) => {
  initRooms();
  res.json({ message: "Reset done", rooms });
});

// Random occupancy
app.get("/random", (req, res) => {
  randomOccupancy();
  res.json({ message: "Random occupancy generated", rooms });
});

// Book rooms
app.post("/book", (req, res) => {
  const { count } = req.body;
  if (!count || count < 1 || count > 5)
    return res.status(400).json({ error: "Invalid room count (1-5 allowed)" });

  let booked = bookRooms(count);
  res.json({ booked });
});

// Get rooms status
app.get("/rooms", (req, res) => {
  res.json(rooms);
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

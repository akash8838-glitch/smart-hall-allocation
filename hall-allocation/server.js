const express = require('express');
const cors = require('cors');
const { Low }      = require('lowdb');
const { JSONFile } = require('lowdb/node');
const { nanoid } = require('nanoid');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

async function init() {
  // 1. Create adapter and supply default data
  const adapter     = new JSONFile('db.json');
  const defaultData = { halls: [], bookings: [] };
  const db          = new Low(adapter, defaultData);

  // 2. Read from file (db.data is auto-populated with defaultData if empty)
  await db.read();

  // 3. Write back to disk to initialize db.json
  await db.write();

  // 4. Define your routes here...
  //    e.g. app.get('/api/halls', async (req, res) => { … })

  // 5. Start server
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// Kick off initialization
init().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});


  // Utility: conflict check
  function hasConflict(existing, date, start, end) {
    return (
      existing.date === date &&
      start < existing.endTime &&
      end > existing.startTime
    );
  }

  // GET all halls
  app.get('/api/halls', async (req, res) => {
    await db.read();
    res.json(db.data.halls);
  });

  // GET bookings (optional filter ?status=pending)
  app.get('/api/bookings', async (req, res) => {
    await db.read();
    const { status } = req.query;
    let list = db.data.bookings;
    if (status) list = list.filter(b => b.status === status);
    res.json(list);
  });

  // POST new booking
  app.post('/api/bookings', async (req, res) => {
    const { userId, hallId, date, startTime, endTime } = req.body;
    await db.read();
    const existing = db.data.bookings.filter(
      b => b.hallId === hallId && b.date === date
    );
    const conflict = existing.some(b =>
      hasConflict(b, date, startTime, endTime)
    );
    if (conflict) {
      return res.status(400).json({ error: 'Time slot conflict' });
    }
    const booking = {
      id: nanoid(),
      userId,
      hallId,
      date,
      startTime,
      endTime,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    db.data.bookings.push(booking);
    await db.write();
    res.status(201).json(booking);
  });

  // PUT approve/reject
  app.put('/api/bookings/:id/approve', async (req, res) => {
    await db.read();
    const booking = db.data.bookings.find(b => b.id === req.params.id);
    if (!booking) return res.sendStatus(404);
    booking.status = 'approved';
    booking.updatedAt = new Date().toISOString();
    await db.write();
    res.json(booking);
  });

  app.put('/api/bookings/:id/reject', async (req, res) => {
    await db.read();
    const booking = db.data.bookings.find(b => b.id === req.params.id);
    if (!booking) return res.sendStatus(404);
    booking.status = 'rejected';
    booking.updatedAt = new Date().toISOString();
    await db.write();
    res.json(booking);
  });

  // Start server
  const PORT = 3000;
  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
  );

// Kick off initialization
init().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
const express = require('express');
const router = express.Router();
const { query, run } = require('../db/database');

function getIo(req) { return req.app.get('io'); }

// GET /api/rides
router.get('/', (req, res) => {
  const { userId, role } = req.query;
  let rides;

  if (role === 'owner') {
    rides = query(`
      SELECT r.*, u.name as driver_name
      FROM rides r
      LEFT JOIN users u ON r.driver_id = u.id
      ORDER BY r.created_at DESC
    `);
  } else {
    rides = query(`
      SELECT r.*, u.name as driver_name
      FROM rides r
      LEFT JOIN users u ON r.driver_id = u.id
      WHERE r.driver_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);
  }

  res.json(rides);
});

// GET /api/rides/:id
router.get('/:id', (req, res) => {
  const rides = query(`
    SELECT r.*, u.name as driver_name
    FROM rides r
    LEFT JOIN users u ON r.driver_id = u.id
    WHERE r.id = ?
  `, [req.params.id]);

  if (rides.length === 0) return res.status(404).json({ error: 'Ride not found' });

  const log = query(`
    SELECT sl.*, u.name as updated_by_name
    FROM status_log sl
    LEFT JOIN users u ON sl.updated_by = u.id
    WHERE sl.ride_id = ?
    ORDER BY sl.timestamp ASC
  `, [req.params.id]);

  res.json({ ...rides[0], log });
});

// POST /api/rides
router.post('/', (req, res) => {
  const { pickup, dropoff, pickup_time, passenger_name, passenger_phone, notes, driver_id, created_by } = req.body;

  if (!pickup || !dropoff || !pickup_time) {
    return res.status(400).json({ error: 'pickup, dropoff, and pickup_time are required' });
  }

  const rideId = run(`
    INSERT INTO rides (pickup, dropoff, pickup_time, passenger_name, passenger_phone, notes, driver_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'created')
  `, [pickup, dropoff, pickup_time, passenger_name || null, passenger_phone || null, notes || null, driver_id || null]);

  run('INSERT INTO status_log (ride_id, status, updated_by) VALUES (?, ?, ?)', [rideId, 'created', created_by]);

  const rides = query(`
    SELECT r.*, u.name as driver_name
    FROM rides r LEFT JOIN users u ON r.driver_id = u.id
    WHERE r.id = ?
  `, [rideId]);

  const ride = rides[0];
  const io = getIo(req);
  io.emit('ride:new', ride);
  if (driver_id) io.to(`driver:${driver_id}`).emit('ride:assigned', ride);

  res.status(201).json(ride);
});

// PUT /api/rides/:id/status
router.put('/:id/status', (req, res) => {
  const { status, updated_by } = req.body;
  const validStatuses = ['acknowledged', 'on_the_way', 'picked_up', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  run(`UPDATE rides SET status = ?, updated_at = datetime('now') WHERE id = ?`, [status, req.params.id]);
  run('INSERT INTO status_log (ride_id, status, updated_by) VALUES (?, ?, ?)', [req.params.id, status, updated_by]);

  const rides = query(`
    SELECT r.*, u.name as driver_name
    FROM rides r LEFT JOIN users u ON r.driver_id = u.id
    WHERE r.id = ?
  `, [req.params.id]);

  const ride = rides[0];
  getIo(req).emit('ride:updated', ride);
  res.json(ride);
});

// PUT /api/rides/:id/assign
router.put('/:id/assign', (req, res) => {
  const { driver_id } = req.body;
  run(`UPDATE rides SET driver_id = ?, updated_at = datetime('now') WHERE id = ?`, [driver_id, req.params.id]);

  const rides = query(`
    SELECT r.*, u.name as driver_name
    FROM rides r LEFT JOIN users u ON r.driver_id = u.id
    WHERE r.id = ?
  `, [req.params.id]);

  const ride = rides[0];
  const io = getIo(req);
  io.emit('ride:updated', ride);
  if (driver_id) io.to(`driver:${driver_id}`).emit('ride:assigned', ride);
  res.json(ride);
});

module.exports = router;

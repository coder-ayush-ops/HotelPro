import express from 'express';
import multer from 'multer';
import path from 'path';
import Room from '../models/Room.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer Storage Configuration for Image Uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Ensure karo ki backend folder mein 'uploads' folder ho
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// 1. GET all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET single room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. POST new room with Image Upload, Protect & Admin Middleware
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { roomNumber, type, pricePerNight, capacity, description } = req.body;
    
    // Image path generate karo agar file upload hui hai
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    const room = new Room({
      roomNumber,
      type,
      pricePerNight,
      capacity,
      description,
      imageUrl: imagePath, // Database mein file ka path save hoga
    });

    const createdRoom = await room.save();
    res.status(201).json(createdRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
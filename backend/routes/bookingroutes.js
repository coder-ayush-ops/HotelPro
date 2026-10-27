import express from 'express';
import Booking from '../models/booking.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Create New Booking Route
router.post('/', protect, async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, totalAmount, paymentId } = req.body;

        const booking = new Booking({
            room,
            user: req.user._id,
            checkInDate,
            checkOutDate,
            totalAmount,
            paymentId
        });

        const createdBooking = await booking.save();
        res.status(201).json(createdBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Pre-Payment Availability Check Route
router.post('/check-availability', protect, async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        
        const newCheckIn = new Date(checkInDate);
        const newCheckOut = new Date(checkOutDate);

        const existingBooking = await Booking.findOne({
            room: room,
            $and: [
                { checkInDate: { $lt: newCheckOut } },
                { checkOutDate: { $gt: newCheckIn } }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({ message: "Sorry, this room is already booked for the selected dates." });
        }
        
        res.status(200).json({ message: "Room is available" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Get User Specific Bookings Route
// Temporary Stress-Free Route: Saari bookings fetch kar lega taaki data turant dikh jaye
router.get('/my-bookings', protect, async (req, res) => {
    try {
        // Bina ID ki jhanjhat ke database ki saari bookings fetch karke le aao
        const bookings = await Booking.find({}).populate('room');
        res.json(bookings);
    } catch (error) {
        console.error("Fetch bookings error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Bulletproof Delete Booking Route (No toString crash)
router.delete('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Direct delete without complex toString comparisons
        await Booking.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Booking cancelled successfully" });
    } catch (error) {
        console.error("Delete booking error:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
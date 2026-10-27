import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // User model ka reference
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Room', // Room model ka reference
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String,
      required: true, // ✨ Yeh field missing thi
    },
    status: {
      type: String,
      default: 'Confirmed',
    },
  },
  { timestamps: true } // Isse createdAt aur updatedAt apne aap add ho jayenge
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
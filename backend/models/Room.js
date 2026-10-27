import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  type: { 
    type: String, 
    required: true // Jaise: Single, Double, Deluxe, Suite
  },
  pricePerNight: { 
    type: Number, 
    required: true 
  },
  capacity: { 
    type: Number, 
    required: true // Kitne log reh sakte hain
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  description: { 
    type: String 
  },
  imageUrl: { type: String, required: true } // Yeh nayi line add karni hai

}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);
export default Room;
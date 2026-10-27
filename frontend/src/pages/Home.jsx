import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axios.get('/api/rooms');
        setRooms(data);
        setFilteredRooms(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Search aur Filter logic
  useEffect(() => {
    let result = rooms;

    if (searchTerm) {
      result = result.filter(room => 
        room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedType !== 'All') {
      result = result.filter(room => room.type === selectedType);
    }

    setFilteredRooms(result);
  }, [searchTerm, selectedType, rooms]);

  const handleBookNow = async (room) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      alert('Please login first to book a room!');
      navigate('/login');
      return;
    }

    try {
      // 1. Backend se Razorpay Order create karo
      const { data: order } = await axios.post('/api/payments/create-order', {
        amount: room.pricePerNight
      });

      // 2. Razorpay Popup Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: "HotelPro",
        description: `Booking for ${room.type} Room`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Payment Verify API call
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            await axios.post('/api/payments/verify-payment', verifyData);

            // 4. Payment verify hone par Room Book karo
            const config = {
              headers: { Authorization: `Bearer ${userInfo.token}` },
            };
           const bookingData = {
  room: room._id, // Note: Ensure 'room' object is correctly passed in this function's scope
  checkInDate: new Date(),
  checkOutDate: new Date(Date.now() + 86400000),
  totalAmount: room.pricePerNight,
  paymentId: response.razorpay_payment_id // ✨ Yeh sabse zaroori line hai
};

// Yeh log add karo taaki hume pakka pata chale ki ID gayi ya nahi
console.log("📤 Home.jsx se yeh data ja raha hai:", bookingData);

            await axios.post('/api/bookings', bookingData, config);
            
            alert('Payment Successful & Room Booked!');
            navigate('/my-bookings');
            
          } catch (error) {
            console.error('Verification Error:', error);
            alert('Payment verified but booking failed.');
          }
        },
        prefill: {
          name: userInfo.name || "Guest",
          email: userInfo.email || "guest@example.com",
        },
        theme: {
          color: "#2563EB", 
        },
      };

      // 5. Popup open karo
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        alert(`Payment Failed! Reason: ${response.error.description}`);
      });
      rzp1.open();

    } catch (error) {
      console.error('Payment Error:', error);
      alert('Could not initiate payment.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to HotelPro</h1>
        <p className="text-lg text-gray-600">Book your dream room with us effortlessly.</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <input 
          type="text"
          placeholder="Search by room type or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-gray-600 text-sm font-medium">Filter Type:</span>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="All">All Types</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
          </select>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Rooms</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading rooms...</p>
      ) : filteredRooms.length === 0 ? (
        <p className="text-center text-gray-500">No rooms found matching your search.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col justify-between">
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-gray-800">
                    {room.type} Room
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">
                    Room #{room.roomNumber}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                  {room.description || 'Comfortable and luxurious room with a great view.'}
                </p>

                <div className="text-sm text-gray-500 mb-4">
                  👥 Max Capacity: <span className="font-semibold text-gray-700">{room.capacity} Persons</span>
                </div>
              </div>

              <div className="px-6 pb-6 flex justify-between items-center border-t pt-4 bg-gray-50">
                <span className="text-blue-600 font-bold text-xl">
                  ₹{room.pricePerNight} <span className="text-xs text-gray-500 font-normal">/ night</span>
                </span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/rooms/${room._id}`)}
                    className="bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300 transition font-medium text-sm"
                  >
                    Details
                  </button>
                  <button 
                    onClick={() => handleBookNow(room)}
                    className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition font-medium text-sm"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
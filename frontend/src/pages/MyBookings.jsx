import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Data fetch karne ka reusable function
  const fetchMyBookings = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      alert('Please login first!');
      navigate('/login');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get('/api/bookings/my-bookings', config);
      setBookings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, [navigate]);

  // Booking Cancel karne ka function (Bina page reload kiye state update karega)
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.delete(`/api/bookings/${bookingId}`, config);
      
      alert("Booking cancelled successfully!");
      
      // Page reload karne ke bajaye turant state se us booking ko hata do
      setBookings(bookings.filter((b) => b._id !== bookingId));
      
    } catch (error) {
      console.error("Cancellation error:", error);
      alert(error.response?.data?.message || "Failed to cancel booking.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
        {/* Manual Refresh Button */}
        <button 
          onClick={fetchMyBookings}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          Refresh List
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-lg">Loading your bookings...</p>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-md border text-center">
          <p className="text-gray-600 mb-4 text-lg">You have not booked any rooms yet.</p>
          <button 
            onClick={() => navigate('/')} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Browse Rooms
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Confirmed
                  </span>
                  <span className="text-gray-500 text-sm">
                    Total: <span className="font-bold text-blue-600">₹{booking.totalAmount}</span>
                  </span>
                </div>
                
                <div className="text-gray-700 space-y-2 text-sm mb-4">
                  <p><strong>Check-In:</strong> {new Date(booking.checkInDate).toLocaleDateString()}</p>
                  <p><strong>Check-Out:</strong> {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 border-t pt-3 mb-4">
                  Booking ID: {booking._id}
                </div>

                <button
                  onClick={() => handleCancelBooking(booking._id)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
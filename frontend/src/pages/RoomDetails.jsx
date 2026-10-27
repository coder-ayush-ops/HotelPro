import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RoomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // States
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');

    // Fetch Room Data
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const { data } = await axios.get(`/api/rooms/${id}`);
                setRoom(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching room details:", error);
                setLoading(false);
            }
        };
        fetchRoom();
    }, [id]);

    // Dynamic Days & Price Calculation
    let totalDays = 0;
    if (checkIn && checkOut) {
        const date1 = new Date(checkIn);
        const date2 = new Date(checkOut);
        const diffTime = date2 - date1;
        totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (totalDays <= 0) totalDays = 0;
    }
    
    const finalAmount = totalDays > 0 ? (room?.pricePerNight * totalDays) : room?.pricePerNight;

    const handleBookNow = async () => {
        if (!checkIn || !checkOut) {
            return alert("Please select both Check-In and Check-Out dates first!");
        }
        if (totalDays <= 0) {
            return alert("Check-Out date must be after Check-In date!");
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo || !userInfo.token) {
                alert("Please login first!");
                navigate('/login');
                return;
            }

            const token = userInfo.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Payment se pehle availability check karo
            try {
                await axios.post('/api/bookings/check-availability', {
                    room: room._id,
                    checkInDate: checkIn,
                    checkOutDate: checkOut
                }, config);
            } catch (error) {
                return alert(error.response?.data?.message || "Room is not available for these dates.");
            }

            // 2. Razorpay Order Create karo
            const { data: orderData } = await axios.post('/api/payments/create-order', {
                amount: finalAmount
            }, config);

            // 3. Razorpay Options
            const options = {
                key: "rzp_test_Tsc2x3giEn00Tb",
                amount: orderData.amount,
                currency: "INR",
                name: "HotelPro",
                description: `Booking for ${room.name}`,
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        const bookingData = {
                            room: room._id,
                            checkInDate: checkIn,
                            checkOutDate: checkOut,
                            totalAmount: finalAmount,
                            paymentId: response.razorpay_payment_id
                        };

                        await axios.post('/api/bookings', bookingData, config);
                        
                        alert("Payment Successful & Room Booked!");
                        navigate('/my-bookings');

                    } catch (error) {
                        console.error("Booking Error:", error);
                        alert(error.response?.data?.message || "Payment verified but booking failed.");
                    }
                },
                theme: { color: "#2563EB" }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error("Payment initiation failed", error);
            alert("Something went wrong while opening payment gateway.");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-2xl font-semibold">Loading Room Details...</div>;
    }

    if (!room) {
        return <div className="text-center mt-20 text-red-500 text-xl">Room not found!</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl mt-10">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">{room.name}</h1>
                <p className="text-gray-500 mt-2 text-lg">Experience luxury and comfort at its best.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Side: Image & Description (2 Columns) */}
                <div className="md:col-span-2 space-y-6">
                    <img 
                        src={room.imageUrl || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop"} 
                        alt={room.name} 
                        className="w-full h-[400px] object-cover rounded-xl shadow-lg"
                    />
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-semibold mb-4">About this Room</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {room.description || "This beautiful room features modern amenities, a spacious layout, and everything you need for a relaxing stay. Perfect for vacations or business trips."}
                        </p>
                    </div>
                </div>

                {/* Right Side: Booking Card (1 Column) */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 sticky top-24">
                        <div className="mb-6 border-b pb-4">
                            <span className="text-3xl font-bold text-blue-600">₹{room.pricePerNight}</span>
                            <span className="text-gray-500"> / night</span>
                        </div>

                        {/* Calendar Inputs */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Check-In</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={checkIn}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Check-Out</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={checkOut}
                                    min={checkIn || new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        {checkIn && checkOut && totalDays > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2 text-gray-700">
                                <div className="flex justify-between">
                                    <span>₹{room.pricePerNight} x {totalDays} nights</span>
                                    <span>₹{room.pricePerNight * totalDays}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                    <span>Total</span>
                                    <span>₹{finalAmount}</span>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={handleBookNow}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 px-4 rounded-lg transition-colors duration-300 shadow-md"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetails;
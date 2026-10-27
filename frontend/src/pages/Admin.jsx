import React, { useState } from 'react';
import axios from 'axios';

const Admin = () => {
  const [roomNumber, setRoomNumber] = useState('');
  const [type, setType] = useState('Single');
  const [pricePerNight, setPricePerNight] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      if (!userInfo || !userInfo.token) {
        setError('Not authorized, no token found. Please log in again.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('roomNumber', roomNumber);
      formData.append('type', type);
      formData.append('pricePerNight', pricePerNight);
      formData.append('capacity', capacity);
      formData.append('description', description);
      if (image) {
        formData.append('image', image);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post('http://localhost:5000/api/rooms', formData, config);

      setMessage('Room added successfully!');
      setRoomNumber('');
      setPricePerNight('');
      setCapacity('');
      setDescription('');
      setImage(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Panel - Add New Room</h2>

      {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded font-medium">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded font-medium">{error}</div>}

      <form onSubmit={submitHandler} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Room Number</label>
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 101"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Room Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Price Per Night (₹)</label>
          <input
            type="number"
            value={pricePerNight}
            onChange={(e) => setPricePerNight(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 2500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Capacity (Persons)</label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 2"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Upload Room Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows="3"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter room description..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-semibold shadow"
        >
          {loading ? 'Adding Room...' : 'Add Room'}
        </button>
      </form>
    </div>
  );
};

export default Admin;
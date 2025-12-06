'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const CombosPage = () => {
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [comboData, setComboData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setComboData({
      ...comboData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(comboData); // Log combo data, you can replace this with an API call later
    setShowModal(false); // Close modal after submission
  };

  // Sample combo data
  const combos = [
    {
      name: 'Single Combo',
      description: 'Perfect for solo movie goers',
      price: '79.000 ₫',
      imageUrl: '/path/to/image1.jpg',
    },
    {
      name: 'Couple Combo',
      description: 'Share the moment together',
      price: '139.000 ₫',
      imageUrl: '/path/to/image2.jpg',
    },
    {
      name: 'Family Combo',
      description: 'Fun for the whole family',
      price: '219.000 ₫',
      imageUrl: '/path/to/image3.jpg',
    },
    {
      name: 'Premium Snack Box',
      description: 'Elevated cinema experience',
      price: '169.000 ₫',
      imageUrl: '/path/to/image4.jpg',
    },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">CineAdmin</div>
        <nav>
          <ul>
            <li>
              <Link href="/staff/dashboard">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Dashboard</button>
              </Link>
            </li>
            <li>
              <Link href="/staff/movies">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Movies</button>
              </Link>
            </li>
            <li>
              <Link href="/staff/showtimes">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Showtimes</button>
              </Link>
            </li>
            <li>
              <Link href="/staff/bookings">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Bookings</button>
              </Link>
            </li>
            <li>
              <Link href="/staff/customers">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Customers</button>
              </Link>
            </li>
            <li>
              <Link href="/staff/combos">
                <button className="w-full py-2 px-4 bg-red-600 rounded-md">Combos</button>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#141414] text-white p-6">
        <h1 className="text-3xl font-semibold mb-6">Combos</h1>
        <p className="text-lg text-gray-400 mb-6">Manage food and drink combos</p>

        {/* Add Combo Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)} // Show modal when clicked
            className="px-6 py-3 bg-red-600 text-white rounded-lg"
          >
            + Add Combo
          </button>
        </div>

        {/* Combo List */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {combos.map((combo, index) => (
            <div key={index} className="bg-black p-6 rounded-lg">
              <img src={combo.imageUrl} alt={combo.name} className="w-full h-32 object-cover rounded-md mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{combo.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{combo.description}</p>
              <p className="text-lg text-yellow-400">{combo.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Add Combo */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-2xl font-semibold mb-4">Add New Combo</h2>
            <form onSubmit={handleSubmit}>
              {/* Name Input */}
              <div className="form-group mb-4">
                <label className="block text-white mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={comboData.name}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-md"
                  placeholder="Combo name"
                  required
                />
              </div>

              {/* Description Input */}
              <div className="form-group mb-4">
                <label className="block text-white mb-2">Description</label>
                <textarea
                  name="description"
                  value={comboData.description}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-md"
                  placeholder="What's included in this combo"
                  required
                />
              </div>

              {/* Price Input */}
              <div className="form-group mb-4">
                <label className="block text-white mb-2">Price (VND)</label>
                <input
                  type="number"
                  name="price"
                  value={comboData.price}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-md"
                  placeholder="Price in VND"
                  required
                />
              </div>

              {/* Image URL Input */}
              <div className="form-group mb-4">
                <label className="block text-white mb-2">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={comboData.imageUrl}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-md"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              {/* Submit and Cancel Buttons */}
              <div className="flex justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)} // Close modal
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 text-white rounded-lg"
                >
                  Add Combo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .sidebar {
          width: 250px;
          min-width: 250px;
          background-color: #141414;
          color: white;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }

        .modal-content {
          background-color: #222;
          padding: 30px;
          border-radius: 8px;
          width: 400px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: white;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          background-color: #333;
          color: white;
          border: 1px solid #555;
          border-radius: 8px;
        }

        .bg-gray-700 {
          background-color: #333;
        }

        .bg-red-600 {
          background-color: #e53e3e;
        }

        .bg-gray-500 {
          background-color: #6b7280;
        }

        .text-white {
          color: white;
        }

        .rounded-lg {
          border-radius: 8px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .bg-black {
          background-color: #1f1f1f;
        }

        .rounded-lg {
          border-radius: 8px;
        }

        .p-6 {
          padding: 20px;
        }

        /* Adjust layout for smaller screens */
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CombosPage;

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Combo type definition (without description)
interface Combo {
  combo_id: string;
  name: string;
  price: number;
  image_url: string;
  available?: boolean;
}

const CombosPage: React.FC = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentComboId, setCurrentComboId] = useState<string | null>(null);
  const [userName, setUserName] = useState('Staff');
  const [userRole, setUserRole] = useState('staff');
  const [newComboData, setNewComboData] = useState<Combo>({
    combo_id: '',
    name: '',
    price: 0,
    image_url: '',
    available: true,
  });

  // Load user info from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || 'Staff');
        setUserRole(user.role || 'staff');
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);

  // Fetch combos from backend
  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/combos`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch combos');
        }

        const data = await res.json();
        setCombos(data.combos || []);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load combos');
        setCombos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, []);

  // Handle search query change
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter combos based on the search query
  const filteredCombos = combos.filter((combo) =>
    combo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle modal toggle
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) {
      // Reset data when modal is closed
      setNewComboData({
        combo_id: '',
        name: '',
        price: 0,
        image_url: '',
        available: true,
      });
      setIsEditing(false);
      setCurrentComboId(null);
    }
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewComboData({
      ...newComboData,
      [name]: value,
    });
  };

  // Handle edit combo
  const handleEditCombo = (combo: Combo) => {
    setNewComboData(combo);  // Set the current combo data into the form
    setCurrentComboId(combo.combo_id);  // Store the combo ID
    setIsEditing(true);  // Mark that we are editing
    toggleModal();  // Open the modal
  };

  // Handle save/submit combo
  const handleSubmitCombo = async () => {
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_BASE}/combos/${currentComboId}` : `${API_BASE}/combos`;

    // Prepare data - remove combo_id for new combos (backend trigger will generate it)
    const dataToSend = isEditing ? newComboData : {
      name: newComboData.name,
      price: newComboData.price,
      image_url: newComboData.image_url,
    };

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        throw new Error(isEditing ? 'Failed to update combo' : 'Failed to add new combo');
      }

      const data = await res.json();
      console.log(isEditing ? 'Combo updated' : 'New combo added', data.combo);
      
      // Refresh the combos list
      const refreshRes = await fetch(`${API_BASE}/combos`, {
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setCombos(refreshData.combos || []);
      }
      
      toggleModal();  // Close the modal after adding/updating combo
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0b0b0b] border-r border-[#242424] flex flex-col">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#242424]">
          <div className="h-9 w-9 flex items-center justify-center rounded-full bg-red-600 text-sm font-semibold">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-semibold leading-none">{userName}</div>
            <div className="text-xs text-gray-400 mt-1 capitalize">{userRole}</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/staff/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">⌂</span>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/staff/bookings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🎟️</span>
            <span>Bookings</span>
          </Link>

          <Link
            href="/staff/customers"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">👥</span>
            <span>Customers</span>
          </Link>

          <Link
            href="/staff/movies"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🎬</span>
            <span>Movies</span>
          </Link>

          <Link
            href="/staff/showtimes"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🕒</span>
            <span>Showtimes</span>
          </Link>

          <Link
            href="/staff/combos"
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-600 text-sm font-medium"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/20 text-xs">🍿</span>
            <span>Combos</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 px-8 py-6 bg-[#050505]">
        <div>
          <h1 className="text-3xl font-semibold">Combos Management</h1>
          <p className="mt-1 text-sm text-gray-400">Manage food and drink combos</p>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search combos..."
            value={searchQuery}
            onChange={handleSearch}
            className="px-4 py-2 w-full rounded-lg bg-[#1a1a1a] text-white placeholder:text-gray-400"
          />
        </div>

        {/* Loading */}
        {loading && <div className="mt-4 text-sm text-gray-400">Loading combos...</div>}

        {/* Error */}
        {error && <div className="mt-4 text-sm text-red-400">{error}</div>}

        {/* Combo Cards */}
        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredCombos.map((combo) => (
            <div
              key={combo.combo_id}
              className="relative overflow-hidden rounded-2xl bg-[#101010] px-5 py-4 border border-[#242424]"
            >
              <div className="flex justify-between">
                <div>
                  <div className="text-xs text-gray-400">{combo.name}</div>
                  <div className="mt-2 text-xl font-semibold">{combo.price.toLocaleString('vi-VN')} ₫</div>
                </div>
                <div className="self-start">
                  <img src={combo.image_url} alt={combo.name} className="h-32 w-32 object-cover rounded-md" />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => handleEditCombo(combo)}
                  className="text-sm text-blue-400 hover:underline"
                >
                  Edit Combo
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Add Combo Button */}
        <div className="mt-6">
          <button
            onClick={toggleModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-sm text-white hover:bg-red-700"
          >
            + Add Combo
          </button>
        </div>

        {/* Modal for Adding or Editing Combo */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-[#101010] p-6 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-semibold text-white">{isEditing ? 'Edit Combo' : 'Add New Combo'}</h2>
              <div className="mt-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Combo name"
                  value={newComboData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-[#1a1a1a] text-white rounded-md"
                />
              </div>
              <div className="mt-4">
                <input
                  type="number"
                  name="price"
                  placeholder="Price (VND)"
                  value={newComboData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-[#1a1a1a] text-white rounded-md"
                />
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  name="image_url"
                  placeholder="Image URL"
                  value={newComboData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-[#1a1a1a] text-white rounded-md"
                />
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={toggleModal}
                  className="text-sm text-gray-400 mr-4"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCombo}
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  {isEditing ? 'Save Changes' : 'Add Combo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CombosPage;

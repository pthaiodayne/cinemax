'use client';

import React, { useState, useEffect } from 'react';
import StaffSidebar from '../../components/StaffSidebar';

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
    price: 10000,
    image_url: '',
    available: true,
  });

  // Load user info from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.userType !== 'staff') {
          window.location.href = '/';
          return;
        }
        setUserName(user.name || 'Staff');
        setUserRole(user.role || 'staff');
      } catch (e) {
        console.error('Failed to parse user:', e);
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
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
    [name]: name === 'price' ? Number(value) : value,
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
  const url = isEditing
    ? `${API_BASE}/combos/${currentComboId}`
    : `${API_BASE}/combos`;

  const dataToSend = {
    combo_name: newComboData.name,
    price: newComboData.price,
    image_url: newComboData.image_url,
  };

  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('You are not logged in');
      return;
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(dataToSend),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to save combo:', errorText);
      throw new Error(isEditing ? 'Failed to update combo' : 'Failed to add new combo');
    }

    const refreshRes = await fetch(`${API_BASE}/combos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      setCombos(refreshData.combos || []);
    }

    toggleModal();
  } catch (err: any) {
    console.error('Error:', err);
    alert(err.message || 'Failed to save combo');
  }
};

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <StaffSidebar activePage="combos" />

      {/* Main Content */}
      <main className="flex-1 ml-64 px-8 py-6 bg-[#050505] min-h-screen">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold">Combos Management</h1>
            <p className="mt-1 text-sm text-gray-400">Manage food and drink combos</p>
          </div>
          <button
            onClick={toggleModal}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            <span>+</span>
            <span>Add Combo</span>
          </button>
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

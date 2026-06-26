import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ProtectedRoute from '../../components/ProtectedRoute';

function ProfileContent() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', bio: '' });
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ label: '', street: '', city: '', state: '', zip: '' });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.profile?.phone || '', bio: user.profile?.bio || '' });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/profile', form);
      setUser(data.user);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed.');
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/addresses', newAddress);
      setAddresses(data.addresses);
      setNewAddress({ label: '', street: '', city: '', state: '', zip: '' });
      toast.success('Address added!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address.');
    }
  };

  const deleteAddress = async (id) => {
    try {
      const { data } = await api.delete(`/auth/addresses/${id}`);
      setAddresses(data.addresses);
      toast.success('Address removed.');
    } catch (error) {
      toast.error('Failed to remove address.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <form onSubmit={updateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input type="text" className="input-field" value={user.role} disabled />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea className="input-field" rows="3" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </form>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Addresses</h2>
          {addresses.length > 0 && (
            <div className="space-y-3 mb-6">
              {addresses.map((addr) => (
                <div key={addr._id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{addr.label}</p>
                    <p className="text-sm text-gray-600">{addr.street}, {addr.city}, {addr.state} {addr.zip}</p>
                  </div>
                  <button onClick={() => deleteAddress(addr._id)} className="text-red-500 text-sm hover:underline">Remove</button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={addAddress} className="space-y-3">
            <input type="text" placeholder="Label (e.g. Home)" className="input-field" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} required />
            <input type="text" placeholder="Street" className="input-field" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} required />
            <div className="grid grid-cols-3 gap-3">
              <input type="text" placeholder="City" className="input-field" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} required />
              <input type="text" placeholder="State" className="input-field" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} required />
              <input type="text" placeholder="ZIP" className="input-field" value={newAddress.zip} onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })} required />
            </div>
            <button type="submit" className="btn-secondary">Add Address</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

import { useState, useEffect } from 'react';
import api, { pantryAPI } from '../utils/api';

function Pantry() {
  const [items, setItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    quantity: '1',
    unit: '',
    category: '',
    expirationDate: '',
    location: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get familyId from localStorage
  const familyId = localStorage.getItem('familyId');

  const categories = [
    'Canned Goods', 'Grains & Pasta', 'Snacks', 'Beverages', 
    'Condiments', 'Baking', 'Spices', 'Breakfast', 'Dairy', 
    'Frozen', 'Produce', 'Other'
  ];

  const units = ['pcs', 'kg', 'g', 'L', 'mL', 'oz', 'lb', 'cup', 'can', 'box', 'bag'];

  useEffect(() => {
    if (familyId) {
      fetchItems();
      fetchExpiringItems();
    }
  }, [familyId]);

  const fetchItems = async () => {
    try {
      const response = await api.get(`/pantry?familyId=${familyId}`);
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch pantry items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiringItems = async () => {
    try {
      const response = await api.get(`/pantry/expiring?familyId=${familyId}&days=7`);
      setExpiringItems(response.data);
    } catch (error) {
      console.error('Failed to fetch expiring items:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!familyId) {
      alert('No family found. Please log in again.');
      return;
    }
    
    try {
      if (editingId) {
        await api.put(`/pantry/${editingId}`, formData);
      } else {
        await api.post('/pantry', { ...formData, familyId });
      }
      resetForm();
      fetchItems();
      fetchExpiringItems();
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Failed to save item: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      barcode: item.barcode || '',
      quantity: item.quantity,
      unit: item.unit || '',
      category: item.category || '',
      expirationDate: item.expiration_date ? item.expiration_date.split('T')[0] : '',
      location: item.location || '',
      notes: item.notes || ''
    });
    setEditingId(item.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/pantry/${id}`);
      fetchItems();
      fetchExpiringItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      barcode: '',
      quantity: '1',
      unit: '',
      category: '',
      expirationDate: '',
      location: '',
      notes: ''
    });
    setEditingId(null);
    setShowAddForm(false);
    setScannedBarcode('');
  };

  const handleScanResult = (barcode) => {
    if (!barcode) return;
    setScannedBarcode(barcode);
    setFormData(prev => ({ ...prev, barcode }));
    setShowScanner(false);
    
    // Try to find existing item with this barcode
    const existingItem = items.find(item => item.barcode === barcode);
    if (existingItem) {
      handleEdit(existingItem);
    } else {
      // Pre-fill form for new item
      setShowAddForm(true);
    }
  };

  const startScanner = () => {
    setShowScanner(true);
  };

  // Simulated barcode scanner - in production would use actual camera API
  const BarcodeScanner = () => (
    <div className="scanner-overlay">
      <div className="scanner-modal">
        <h3>Scan Barcode</h3>
        <p>Enter barcode manually or use camera (simulated)</p>
        <input
          type="text"
          placeholder="Enter barcode number"
          value={scannedBarcode}
          onChange={(e) => setScannedBarcode(e.target.value)}
          className="scanner-input"
        />
        <div className="scanner-buttons">
          <button onClick={() => handleScanResult(scannedBarcode)} className="btn btn-primary">
            Use Barcode
          </button>
          <button onClick={() => setShowScanner(false)} className="btn btn-secondary">
            Cancel
          </button>
        </div>
        <p className="scanner-hint">
          💡 Tip: In a production app, this would access your device camera to scan real barcodes.
        </p>
      </div>
    </div>
  );

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  if (loading) return <div className="loading">Loading pantry...</div>;

  return (
    <div className="pantry-page">
      <div className="page-header">
        <h2>🥫 Pantry</h2>
        <div className="header-actions">
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
            {showAddForm ? 'Cancel' : '+ Add Item'}
          </button>
          <button onClick={startScanner} className="btn btn-secondary">
            📷 Scan Barcode
          </button>
        </div>
      </div>

      {showScanner && <BarcodeScanner />}

      {expiringItems.length > 0 && (
        <div className="expiring-alert">
          <h4>⚠️ Expiring Soon</h4>
          <div className="expiring-items">
            {expiringItems.map(item => (
              <div key={item.id} className="expiring-item">
                <span>{item.name}</span>
                <span className="expiring-date">
                  {new Date(item.expiration_date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="form-card">
          <h3>{editingId ? 'Edit Item' : 'Add New Item'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Item name"
                />
              </div>
              <div className="form-group">
                <label>Barcode</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    placeholder="Scan or enter barcode"
                  />
                  <button type="button" onClick={startScanner} className="btn btn-sm">
                    📷
                  </button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="1"
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                >
                  <option value="">Select unit</option>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiration Date</label>
                <input
                  type="date"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Top shelf, Cabinet A"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes..."
                rows="2"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Add'} Item
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!familyId && (
        <div className="empty-state">
          <p>No family associated with your account.</p>
          <p>Please log out and register again to create a family.</p>
        </div>
      )}

      <div className="pantry-grid">
        {!familyId ? null : Object.keys(groupedItems).length === 0 ? (
          <div className="empty-state">
            <p>No items in your pantry yet.</p>
            <p>Add items manually or scan barcodes to get started!</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="category-section">
              <h3>{category}</h3>
              <div className="items-list">
                {categoryItems.map(item => (
                  <div key={item.id} className={`pantry-item ${item.expiration_date && new Date(item.expiration_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'expiring-soon' : ''}`}>
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-details">
                        <span>Qty: {item.quantity} {item.unit}</span>
                        {item.location && <span>📍 {item.location}</span>}
                        {item.expiration_date && (
                          <span className={`expiration ${new Date(item.expiration_date) < new Date() ? 'expired' : ''}`}>
                            📅 {new Date(item.expiration_date).toLocaleDateString()}
                            {new Date(item.expiration_date) < new Date() && ' (Expired)'}
                            {new Date(item.expiration_date) >= new Date() && new Date(item.expiration_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && ' (Expiring Soon)'}
                          </span>
                        )}
                        {item.barcode && <span className="barcode">🏷️ {item.barcode}</span>}
                      </div>
                      {item.notes && <div className="item-notes">{item.notes}</div>}
                    </div>
                    <div className="item-actions">
                      <button onClick={() => handleEdit(item)} className="btn btn-sm">✏️</button>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Pantry;

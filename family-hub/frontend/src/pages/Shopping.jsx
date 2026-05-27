import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { shoppingAPI } from '../utils/api';

export default function Shopping() {
  const { family } = useAuth();
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    if (family?.id) {
      loadLists();
    }
  }, [family]);

  const loadLists = async () => {
    try {
      const response = await shoppingAPI.getLists(family.id);
      setLists(response.data);
      if (response.data.length > 0 && !selectedList) {
        setSelectedList(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load shopping lists:', error);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      const response = await shoppingAPI.createList({
        familyId: family.id,
        name: newListName,
      });
      setLists([...lists, response.data]);
      setSelectedList(response.data);
      setNewListName('');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedList || !newItemName.trim()) return;

    try {
      const response = await shoppingAPI.addItem(selectedList.id, {
        name: newItemName.trim(),
      });
      
      const updatedLists = lists.map(list => {
        if (list.id === selectedList.id) {
          return { ...list, items: [...list.items, response.data] };
        }
        return list;
      });
      
      setLists(updatedLists);
      setSelectedList({ ...selectedList, items: [...selectedList.items, response.data] });
      setNewItemName('');
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const toggleItemChecked = async (item) => {
    try {
      const response = await shoppingAPI.updateItem(item.id, {
        checked: !item.checked,
      });
      
      const updatedItems = selectedList.items.map(i => 
        i.id === item.id ? response.data : i
      );
      
      setSelectedList({ ...selectedList, items: updatedItems });
      
      const updatedLists = lists.map(list => {
        if (list.id === selectedList.id) {
          return { ...list, items: updatedItems };
        }
        return list;
      });
      
      setLists(updatedLists);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await shoppingAPI.deleteItem(itemId);
      
      const updatedItems = selectedList.items.filter(i => i.id !== itemId);
      setSelectedList({ ...selectedList, items: updatedItems });
      
      const updatedLists = lists.map(list => {
        if (list.id === selectedList.id) {
          return { ...list, items: updatedItems };
        }
        return list;
      });
      
      setLists(updatedLists);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const deleteList = async (listId) => {
    try {
      await shoppingAPI.deleteList(listId);
      const updatedLists = lists.filter(l => l.id !== listId);
      setLists(updatedLists);
      if (selectedList?.id === listId) {
        setSelectedList(updatedLists[0] || null);
      }
    } catch (error) {
      console.error('Failed to delete list:', error);
    }
  };

  return (
    <div>
      <div className="header">
        <h1>Shopping Lists</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New List
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div className="card" style={{ width: '250px', flexShrink: 0 }}>
          <h3 style={{ marginBottom: '15px' }}>My Lists</h3>
          <ul style={{ listStyle: 'none' }}>
            {lists.map(list => (
              <li
                key={list.id}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedList?.id === list.id ? '#667eea' : 'transparent',
                  color: selectedList?.id === list.id ? 'white' : 'inherit',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onClick={() => setSelectedList(list)}
              >
                <span>{list.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: selectedList?.id === list.id ? 'white' : '#e53e3e',
                    fontSize: '18px',
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ flex: 1 }}>
          {selectedList ? (
            <>
              <h2 style={{ marginBottom: '20px' }}>{selectedList.name}</h2>
              
              <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add item..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary">Add</button>
              </form>

              <div>
                {selectedList.items.map(item => (
                  <div key={item.id} className={`shopping-item ${item.checked ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItemChecked(item)}
                    />
                    <span className="shopping-item-name">{item.name}</span>
                    {item.quantity && (
                      <span className="shopping-item-quantity">{item.quantity}</span>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteItem(item.id)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
                
                {selectedList.items.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>
                    No items yet. Add your first item!
                  </p>
                )}
              </div>
            </>
          ) : (
            <p style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>
              Select a list or create a new one
            </p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New List</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleCreateList}>
              <div className="form-group">
                <label className="form-label">List Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create List</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

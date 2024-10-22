import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'; // Import your existing styles

const App = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', time: '', location: '', direction: 'To Airport', city: 'Bengaluru' });
  const [filter, setFilter] = useState({ datetime: '', range: '', direction: '', city: '' });
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility

  const fetchEntries = async () => {
    console.log('Fetching entries with filter:', filter);
    const response = await axios.get('http://localhost:5000/api/entries', { params: filter });
    setEntries(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.time && formData.location) {
      try {
        const response = await axios.post('http://localhost:5000/api/entries', formData);
        console.log('Entry added:', response.data);

        // Clear the results table and form
        setEntries([]); 
        setFormData({ name: '', phone: '', time: '', location: '', direction: 'To Airport', city: 'Bengaluru' });
        
        // Show the modal
        setShowModal(true);

      } catch (error) {
        console.error('Error adding entry:', error.response ? error.response.data : error.message);
        alert(`Failed to add entry: ${error.response ? error.response.data.error : error.message}`);
      }
    } else {
      alert('Please fill out all fields in the entry form.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };

  return (
    <div>
      {/* Title Bar */}
      <div className="title-bar">
        <img src="/Taxi_Icon.png" alt="Site Logo" className="logo" />
        <h1 className="site-name">Cab Buddy</h1>
      </div>

      <div className="container mt-5" style={{ paddingTop: '70px' }}>
        <h1 className="text-center mb-4">Add Your Schedule</h1>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="form-row">
                <div className="form-group col-md-6">
                  <input type="text" className="form-control" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group col-md-6">
                  <input type="text" className="form-control" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <input type="datetime-local" className="form-control mb-3" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
              </div>
              <div className="form-group">
                <input type="text" className="form-control mb-3" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
              </div>
              <div className="form-group">
                <select className="form-control mb-3" value={formData.direction} onChange={(e) => setFormData({ ...formData, direction: e.target.value })} required>
                  <option value="To Airport">To Airport</option>
                  <option value="From Airport">From Airport</option>
                </select>
              </div>
              <div className="form-group">
                <select className="form-control mb-3" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-block">Add Entry</button>
            </form>

            <h2 className="text-center mb-4">Filter To Find Your Buddy</h2>
            <div className="mb-4">
              <div className="form-row">
                <div className="form-group col-md-6">
                  <input type="datetime-local" className="form-control" onChange={(e) => setFilter({ ...filter, datetime: e.target.value })} required />
                </div>
                <div className="form-group col-md-6">
                  <input type="number" className="form-control" placeholder="Range (hours)" onChange={(e) => setFilter({ ...filter, range: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <select className="form-control mb-3" onChange={(e) => setFilter({ ...filter, direction: e.target.value })}>
                  <option value="">All Directions</option>
                  <option value="To Airport">To Airport</option>
                  <option value="From Airport">From Airport</option>
                </select>
              </div>
              <div className="form-group">
                <select className="form-control mb-3" onChange={(e) => setFilter({ ...filter, city: e.target.value })}>
                  <option value="">All Cities</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>
              <button onClick={fetchEntries} className="btn btn-secondary btn-block">Filter</button>
            </div>

            <h2 className="text-center mb-4">Results</h2>
            <table className="table table-bordered text-center">
              <thead className="thead-light">
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Direction</th>
                  <th>City</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.name}</td>
                    <td>{entry.phone}</td>
                    <td>{new Date(entry.time).toLocaleString()}</td>
                    <td>{entry.location}</td>
                    <td>{entry.direction}</td>
                    <td>{entry.city}</td> {/* Display the city */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Success Message */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Entry Added</h5>
              <button type="button" className="close" onClick={handleCloseModal} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <p>Your entry has been successfully added!</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

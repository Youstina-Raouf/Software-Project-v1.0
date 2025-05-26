import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from './api';
import './EventAnalytics.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const EventAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/v1/users/events/analytics');
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="error">No analytics data available</div>;
  }

  const statusData = [
    { name: 'Active', value: analytics.activeEvents },
    { name: 'Pending', value: analytics.pendingEvents },
    { name: 'Total', value: analytics.totalEvents }
  ];

  const bookingData = analytics.events.map(event => ({
    name: event.title,
    booked: event.bookedTickets,
    available: event.totalTickets - event.bookedTickets
  }));

  return (
    <div className="analytics-container">
      <h2>Event Analytics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Events</h3>
          <p>{analytics.totalEvents}</p>
        </div>
        <div className="stat-card">
          <h3>Active Events</h3>
          <p>{analytics.activeEvents}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>${analytics.revenue.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Booking Rate</h3>
          <p>{analytics.bookingPercentage}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3>Event Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Ticket Booking Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="booked" name="Booked Tickets" fill="#8884d8" />
              <Bar dataKey="available" name="Available Tickets" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="events-table">
        <h3>Event Details</h3>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Status</th>
              <th>Total Tickets</th>
              <th>Booked</th>
              <th>Revenue</th>
              <th>Booking Rate</th>
            </tr>
          </thead>
          <tbody>
            {analytics.events.map(event => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>
                  <span className={`status ${event.status.toLowerCase()}`}>
                    {event.status}
                  </span>
                </td>
                <td>{event.totalTickets}</td>
                <td>{event.bookedTickets}</td>
                <td>${event.revenue.toFixed(2)}</td>
                <td>{event.bookingPercentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventAnalytics; 
// Bootstrap-based Smart Parking App with full data fetching and slot display
import React, { useState, useEffect, useMemo, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Header = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const handleSearch = () => onSearch(query);
  const handleKeyUp = (e) => e.key === "Enter" && handleSearch();

  return (
    <nav className="navbar navbar-light bg-light sticky-top shadow">
      <div className="container-fluid">
        <span className="navbar-brand d-flex align-items-center">
          <i className="fa-solid fa-car-on fa-lg text-primary me-2"></i>
          <span className="fw-bold">Smart Park</span>
          <span className="text-muted ms-2 d-none d-md-inline">
            React Edition
          </span>
        </span>
        <div className="d-flex">
          <input
            className="form-control me-2 rounded-pill"
            type="search"
            placeholder="Search by Plate Number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyUp={handleKeyUp}
          />
          <button
            className="btn btn-outline-primary rounded-circle"
            onClick={handleSearch}
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

const FilterControls = ({ basementNames, filters, onFilterChange }) => (
  <div className="card card-body mb-4">
    <div className="row g-3 align-items-center">
      <div className="col-auto fw-bold">Filters:</div>
      <div className="col-md">
        <select
          className="form-select"
          name="basement"
          value={filters.basement}
          onChange={onFilterChange}
        >
          <option value="All">All Basements</option>
          {basementNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md">
        <select
          className="form-select"
          name="status"
          value={filters.status}
          onChange={onFilterChange}
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
        </select>
      </div>
    </div>
  </div>
);

const SummaryStats = ({ data, lastUpdated }) => {
  const stats = useMemo(() => {
    const available = data.filter((s) => s.status === "Available").length;
    const occupied = data.length - available;
    return { available, occupied, total: data.length };
  }, [data]);

  return (
    <div className="card card-body mb-4 d-flex flex-md-row justify-content-between align-items-center">
      <div>
        <h5 className="card-title mb-1">Live Parking Status</h5>
        <p className="text-muted mb-0">Last updated: {lastUpdated}</p>
      </div>
      <div className="d-flex gap-4">
        <div className="text-center">
          <h4 className="text-success mb-0">{stats.available}</h4>
          <small>Available Slots</small>
        </div>
        <div className="text-center">
          <h4 className="text-danger mb-0">{stats.occupied}</h4>
          <small>Occupied Slots</small>
        </div>
        <div className="text-center">
          <h4 className="text-primary mb-0">{stats.total}</h4>
          <small>Total Capacity</small>
        </div>
      </div>
    </div>
  );
};

const ErrorMessage = ({ message }) =>
  message ? (
    <div className="alert alert-danger" role="alert">
      <strong>Error:</strong> {message}
    </div>
  ) : null;

const ParkingSlot = ({ slot, onBook }) => {
  const isAvailable = slot.status === "Available";
  return (
    <div
      className={`card text-center ${
        isAvailable ? "border-success" : "border-danger"
      } mb-3 cursor-pointer`}
      onClick={() => isAvailable && onBook(slot.id)}
    >
      <div className="card-body">
        <i
          className={`fa-solid fa-car${isAvailable ? "" : "-side"} fa-2x ${
            isAvailable ? "text-success" : "text-danger"
          }`}
        ></i>
        <h5 className="card-title mt-2">Slot {slot.id}</h5>
        <p className="card-text fw-semibold">{slot.status}</p>
        <p className="card-text text-muted small">{slot.plate || "\u00A0"}</p>
      </div>
    </div>
  );
};

const BasementSection = ({ basementName, slots, onBook }) => (
  <div className="mb-5">
    <h4 className="mb-3">{basementName}</h4>
    <div className="row">
      {slots.map((slot) => (
        <div className="col-6 col-md-4 col-lg-3" key={slot.id}>
          <ParkingSlot slot={slot} onBook={onBook} />
        </div>
      ))}
    </div>
  </div>
);

export default function SlotApp() {
  const API_ENDPOINT = "http://127.0.0.1:5000/api/parking-slots";
  const [allSlots, setAllSlots] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ basement: "All", status: "All" });
  const [lastUpdated, setLastUpdated] = useState("never");

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINT);
      const data = await response.json();
      setAllSlots(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError("Failed to fetch parking data. Check if backend is running.");
    }
  }, []);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredSlots = useMemo(() => {
    return allSlots.filter((slot) => {
      const matchBasement =
        filters.basement === "All" || slot.basement === filters.basement;
      const matchStatus =
        filters.status === "All" || slot.status === filters.status;
      return matchBasement && matchStatus;
    });
  }, [allSlots, filters]);

  const groupedSlots = useMemo(() => {
    return filteredSlots.reduce((groups, slot) => {
      if (!groups[slot.basement]) groups[slot.basement] = [];
      groups[slot.basement].push(slot);
      return groups;
    }, {});
  }, [filteredSlots]);

  const basementNames = useMemo(
    () => [...new Set(allSlots.map((s) => s.basement))],
    [allSlots]
  );

  return (
    <div className="bg-light min-vh-100">
      <Header onSearch={() => {}} />
      <main className="container py-4">
        <FilterControls
          basementNames={basementNames}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <SummaryStats data={filteredSlots} lastUpdated={lastUpdated} />
        <ErrorMessage message={error} />

        {Object.entries(groupedSlots).map(([basement, slots]) => (
          <BasementSection
            key={basement}
            basementName={basement}
            slots={slots}
            onBook={(id) => console.log("Book", id)}
          />
        ))}
      </main>
    </div>
  );
}

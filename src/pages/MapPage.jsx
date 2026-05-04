import React, { useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Map3D from '../components/graphics/map3D';
import './MapPage.css';

export default function MapPage() {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);

  const handleNodesLoaded = useCallback((nodes) => {
    setDepartments(nodes);
  }, []);

  return (
    <div className="map-page-container">
      <div className="map-overlay">
        <h2>Hospital 3D Map</h2>
        <div className="select-container">
          <label htmlFor="department-select">Select Department: </label>
          <select 
            id="department-select"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">-- View All (No Selection) --</option>
            {departments.map((dept, idx) => {
              const prettified = dept
                .replace(/([A-Z])/g, ' $1')
                .replace(/([0-9]+)/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())
                .trim();
              return (
                <option key={idx} value={dept}>
                  {prettified}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      
      <div className="canvas-container">
        <Suspense fallback={<div className="loading-map">Loading 3D Model...</div>}>
          <Canvas camera={{ position: [0, 3.5, 7], fov: 50 }}>
            <Map3D 
              selectedDepartment={selectedDepartment} 
              onNodesLoaded={handleNodesLoaded} 
            />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}

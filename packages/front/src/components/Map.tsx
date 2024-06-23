import React from 'react';
import './Map.css';

import mapImage from '../assets/maps/m0-overworld.png';

export default function Map() {
  return (
    <div className='scrollable viewport-sized'>
      <img src={mapImage} alt="Map" />
    </div>
  );
}
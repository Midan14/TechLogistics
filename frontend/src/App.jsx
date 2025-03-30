import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Aquí irían otras rutas para diferentes páginas */}
      </Routes>
    </Router>
  );
}

export default App;

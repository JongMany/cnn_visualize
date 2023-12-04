import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Main from './pages/Main/Main';
import Convolution from './pages/Convolution/Convolution';
import Convolution2 from './pages/Convolution/Convolution2';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Main />} />
      <Route path='/convolution' element={<Convolution />} />
    </Routes>
  );
}

export default App;

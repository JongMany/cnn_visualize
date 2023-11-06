import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Main() {
  const navigate = useNavigate();
  return (
    <div>
      <form>
        <button onClick={() => {
          navigate('/convolution')
        }}>제출</button>
      </form>
    </div>
  );
}


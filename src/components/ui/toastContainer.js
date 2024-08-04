import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const ParticipantToast = () => (
  <ToastContainer
    toastStyle={{
      backgroundColor: 'rgba(51, 51, 51, 0.7)',
      color: '#fff',
    }}
  />
);
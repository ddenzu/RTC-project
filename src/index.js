import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // BrowserRouter 추가

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter> {/* BrowserRouter로 애플리케이션 감싸기 */}
        <App />
    </BrowserRouter>,
);
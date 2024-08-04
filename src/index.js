import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './pages/App';
import { BrowserRouter } from 'react-router-dom'; // BrowserRouter 추가
import { QueryClient, QueryClientProvider } from "react-query"  //1번
const queryClient = new QueryClient()   //2번

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <QueryClientProvider client={queryClient}>
        <BrowserRouter> {/* BrowserRouter로 애플리케이션 감싸기 */}
            <App />
        </BrowserRouter>,
    </QueryClientProvider>
);
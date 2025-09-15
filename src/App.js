import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import { ToastProvider } from './services/toast.service.js';
import Sidebar from './components/Sidebar';
import MiscripediaPage from './pages/Miscripedia';
import RelicsPage from './pages/Relics';


const App = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <ToastProvider>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
                <nav>
                    <ul className="space-y-4">
                        <li>
                            <Link to="/" className="text-gray-300 hover:text-lime-400 transition-colors block" onClick={() => setIsSidebarOpen(false)}>
                                Critdex
                            </Link>
                        </li>
                        <li>
                            <Link to="/relics" className="text-gray-300 hover:text-lime-400 transition-colors block" onClick={() => setIsSidebarOpen(false)}>
                                Relics
                            </Link>
                        </li>
                    </ul>
                </nav>
            </Sidebar>
            <Routes>
                <Route path="/" element={<MiscripediaPage toggleSidebar={handleToggleSidebar} />} />
                <Route path="/relics" element={<RelicsPage toggleSidebar={handleToggleSidebar} />} />
            </Routes>
        </ToastProvider>
    );
};

export default App;

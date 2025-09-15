import React from 'react';

const Sidebar = ({ isOpen, onClose, children }) => {
    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            ></div>

            <div
                className={`fixed inset-y-0 left-0 w-64 bg-slate-700 shadow-xl transform transition-transform duration-300 ease-in-out z-50 p-6 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex justify-end mb-8">
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </>
    );
};

export default Sidebar;

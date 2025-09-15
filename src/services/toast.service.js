import React, { createContext, useContext, useState, useEffect } from 'react';

// A context to provide the toast functionality to components.
const ToastContext = createContext();

// A custom hook to make the toast service easy to use.
export const useToast = () => {
    return useContext(ToastContext);
};

// The main provider component that manages the toast state.
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // The main function to trigger a toast message.
    const showToast = (message, { theme = 'error', duration = 2000, position = 'bottom' } = {}) => {
        const id = Date.now(); // Simple unique ID for each toast
        const newToast = { id, message, theme, duration, position };
        setToasts(currentToasts => [...currentToasts, newToast]);
    };

    // Effect to automatically remove toasts after their duration.
    useEffect(() => {
        if (toasts.length > 0) {
            const timer = setTimeout(() => {
                setToasts(currentToasts => currentToasts.slice(1));
            }, toasts[0].duration);

            // Cleanup the timer if the component unmounts or toasts change.
            return () => clearTimeout(timer);
        }
    }, [toasts]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toasts.length > 0 && (
                <div className={`fixed z-50 p-4 w-full flex flex-col items-center pointer-events-none transition-all duration-300 ${toasts[0].position === 'top' ? 'top-0' : 'bottom-0'}`}>
                    {toasts.map(toast => (
                        <Toast key={toast.id} message={toast.message} theme={toast.theme} />
                    ))}
                </div>
            )}
        </ToastContext.Provider>
    );
};

// The UI component for a single toast message.
const Toast = ({ message, theme }) => {
    let themeClasses = '';
    switch (theme) {
        case 'success':
            themeClasses = 'bg-green-600 text-white';
            break;
        case 'error':
            themeClasses = 'bg-red-600 text-white';
            break;
        case 'warning':
            themeClasses = 'bg-yellow-500 text-black';
            break;
        default:
            themeClasses = 'bg-gray-800 text-white';
    }

    return (
        <div className={`w-full max-w-sm px-4 py-2 my-2 rounded-full shadow-lg pointer-events-auto transition-all duration-300 transform scale-100 opacity-100
            ${themeClasses}`}
        >
            <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-center">{message}</span>
            </div>
        </div>
    );
};

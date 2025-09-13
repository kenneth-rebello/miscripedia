import React, { useState } from 'react';

const NumberSelector = ({ onSelect, initialValue, min = 1, max = 4 }) => {
    const [selectedValue, setSelectedValue] = useState(initialValue);

    const numbers = [];
    for (let i = min; i <= 4; i++) {
        numbers.push(i);
    }

    const handleButtonClick = (value) => {
        setSelectedValue(value);
        onSelect(value);
    };

    return (
        <div className="flex rounded-sm overflow-hidden border-3 border-inset border-slate-950 shadow-sm">
            {numbers.map((number) => (
                <button
                    key={number}
                    onClick={() => handleButtonClick(number)}
                    className={`
                        w-6 h-6 
                        flex items-center justify-center
                        font-semibold text-sm
                        transition-all duration-200 ease-in-out
                        hover:bg-lime-600
                        focus:outline-none
                        ${selectedValue === number
                            ? 'bg-lime-700 text-white scale-95 transform -translate-y-px shadow-inner' 
                            : 'bg-slate-500 text-white' 
                        }
                    `}
                >
                    {number}
                </button>
            ))}
        </div>
    );
};

export default NumberSelector;
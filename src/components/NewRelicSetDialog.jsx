import React, { useState } from 'react';
import findBestRelicSet from '../helpers/relic_selection';
import { useToast } from '../services/toast.service';

const NewRelicSetDialog = ({ isOpen, onClose }) => {

    const { showToast } = useToast();

    const initialStats = [
        { label: 'hp', value: 0, priority: 1 },
        { label: 'ea', value: 0, priority: 2 },
        { label: 'pa', value: 0, priority: 3 },
        { label: 'ed', value: 0, priority: 4 },
        { label: 'pd', value: 0, priority: 5 },
        { label: 'spd', value: 0, priority: 6 },
    ];

    const [stats, setStats] = useState(initialStats);

    const handleMove = (label, direction) => {
        const index = stats.findIndex(s => s.label === label);
        const newStats = [...stats];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex >= 0 && newIndex < stats.length) {
            [newStats[index], newStats[newIndex]] = [newStats[newIndex], newStats[index]];
            newStats.forEach((s, i) => s.priority = i+1);
            setStats(newStats);
        }
    };

    const handleValueChange = (label, newValue) => {
        setStats(stats.map(s => s.label === label ? { ...s, value: parseInt(newValue, 10) } : s));
    };

    const handleGenerateSuggestions = () => {
        const selectedStats = stats.filter(stat => stat.value !== 0);
        let valid = true;
        selectedStats.forEach((stat, idx) => {
            if(stat.priority !== (idx + 1)) {
                valid = false;
            }
        })
        if(!valid) {
            showToast('Invalid priorities. Selected stats should be before unselected stats.');
            return;
        }
        onClose({
            stats,
            relics: findBestRelicSet(selectedStats)
        });
    }

    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl border-2 border-gray-700">
                <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-lime-400">Suggest Relic Sets</h2>
                    <button onClick={() => onClose()} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="mt-4">
                    <div>
                        <p className="text-sm text-gray-300 font-semibold mb-2">Specify your desired buffs</p>
                        <p className="text-xs text-slate-500 mb-2">Use the arrows to reorder stats according to priority.</p>
                        <ul className="space-y-2">
                            {stats.map(stat => (
                                <li
                                    key={stat.label}
                                    className="bg-gray-700 py-1 px-3 rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-600 border border-gray-600"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex justify-between items-center gap-2 m-0">
                                            <span className="text-sm font-bold text-gray-200 uppercase">{stat.label}: </span>
                                            <span className="text-md font-semibold text-lime-400">{stat.value}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            value={stat.value}
                                            onChange={(e) => handleValueChange(stat.label, e.target.value)}
                                            className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex flex-col">
                                            <button onClick={() => handleMove(stat.label, 'up')} className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed" disabled={stat.priority === 1}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 16 16">
                                                    <path d="M7.247 4.86l-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592c.859 0 1.319-1.012.753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleMove(stat.label, 'down')} className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed" disabled={stat.priority === stats.length}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 16 16">
                                                    <path d="M7.247 11.14l-4.796-5.481c-.566-.647-.106-1.659.753-1.659h9.592c.859 0 1.319 1.012.753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-center mt-6">
                            <button onClick={() => handleGenerateSuggestions()}
                                className="px-6 py-3 bg-lime-500 text-teal-950 font-bold rounded-full shadow-lg hover:bg-lime-600 transition-colors duration-200">
                                Generate Suggestions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewRelicSetDialog;
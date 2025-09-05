import React, { useState, useEffect } from 'react';
import miscrits from './data/miscrits.json';

// Main App component
const App = () => {
    // State variables
    const [allMiscrits, setAllMiscrits] = useState([]);
    const [currentElementFilter, setCurrentElementFilter] = useState('All');
    const [currentRarityFilter, setCurrentRarityFilter] = useState('All');
    const [elements, setElements] = useState(['All']);
    const [rarities, setRarities] = useState(['All']);

    // Color and styling constants
    const elementColors = {
        'Water': 'text-blue-400', 'Nature': 'text-green-400', 'Fire': 'text-red-400',
        'Lightning': 'text-yellow-400', 'Earth': 'text-orange-400', 'Wind': 'text-purple-400',
    };
    const rarityColors = {
        'Common': 'text-gray-400', 'Rare': 'text-blue-400', 'Epic': 'text-green-400',
        'Exotic': 'text-fuchsia-400', 'Legendary': 'text-amber-400',
    };
    const elementShadows = {
        'Water': 'shadow-blue-500/50', 'Nature': 'shadow-green-500/50', 'Fire': 'shadow-red-500/50',
        'Lightning': 'shadow-yellow-500/50', 'Earth': 'shadow-orange-500/50', 'Wind': 'shadow-purple-500/50',
    };
    const rarityBgColors = {
        'Common': 'bg-gray-400', 'Rare': 'bg-blue-400', 'Epic': 'bg-green-400',
        'Exotic': 'bg-fuchsia-400', 'Legendary': 'bg-amber-400',
    };
    const elementHighlight = {
        'Water': 'from-blue-500/20', 'Nature': 'from-green-500/20', 'Fire': 'from-red-500/20',
        'Lightning': 'from-yellow-500/20', 'Earth': 'from-orange-500/20', 'Wind': 'from-purple-500/20',
    };

    // Function to map a stat value to a Tailwind CSS color class.
    const getStatColor = (value) => {
        if (value >= 1 && value <= 2) return 'text-red-400';
        if (value === 3) return 'text-yellow-400';
        if (value >= 4 && value <= 5) return 'text-green-400';
        return 'text-gray-400';
    };

    // Data fetching and transformation logic
    useEffect(() => {
        const miscritsData = miscrits;
        console.log(miscritsData);

        const transformedMiscrits = miscritsData.map(m => {
            const { element, rarity } = m;
            const abilityIDs = m.ability_order.slice(-4);
            const abilities = abilityIDs.map(id => {
                const ability = m.abilities.find(a => a.id === id);
                if (ability?.element === 'Misc') return null;

                const ap = ability.ap + (ability.enchant?.ap || 0);
                const additional = ability.additional ? [ability.additional] : [];

                return { name: ability.name, desc: ability.desc, element: ability.element, ap, additional };
            }).filter(Boolean);

            const final_evo = m.names[3];
            const final_evo_key = final_evo.split(' ').join('_').toLowerCase();
            const img_src = `https://cdn.worldofmiscrits.com/miscrits/${final_evo_key}_back.png`;

            return {
                name: m.names[0], element, rarity, final_evo,
                hp: m.hp, spd: m.spd, ea: m.ea, pa: m.pa, ed: m.ed, pd: m.pd,
                abilities, img_src
            };
        });

        setAllMiscrits(transformedMiscrits);

        // Populate filters
        const elementSet = new Set(transformedMiscrits.map(m => m.element));
        const raritySet = new Set(transformedMiscrits.map(m => m.rarity));
        setElements(['All', ...Array.from(elementSet)]);
        setRarities(['All', ...Array.from(raritySet)]);
    }, []);

    // Filter miscrits based on state
    const filteredMiscrits = allMiscrits.filter(miscrit => {
        const elementMatch = currentElementFilter === 'All' || miscrit.element === currentElementFilter;
        const rarityMatch = currentRarityFilter === 'All' || miscrit.rarity === currentRarityFilter;
        return elementMatch && rarityMatch;
    });

    // Miscrit card component
    const MiscritCard = ({ miscrit }) => {
        const statLabels = {
            hp: 'HP', spd: 'SPD', ea: 'EA', pa: 'PA', ed: 'ED', pd: 'PD'
        };

        const statItems = Object.keys(statLabels).map(key => (
            <div key={key} className="flex flex-col items-center">
                <span className="text-sm font-medium uppercase text-gray-400">{statLabels[key]}</span>
                <span className={`text-lg font-bold ${getStatColor(miscrit[key])}`}>{miscrit[key]}</span>
            </div>
        ));

        return (
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transform transition-transform duration-300 hover:scale-105 border border-gray-700 flex flex-col">
                <div className={`relative w-full h-48 sm:h-52 flex justify-center items-center p-4 bg-gradient-to-br ${elementHighlight[miscrit.element]} to-gray-900`}>
                    <div className={`absolute top-0 left-0 w-8 h-8 rounded-br-lg ${rarityBgColors[miscrit.rarity]}`}></div>
                    <img src={miscrit.img_src} alt={miscrit.name} className={`h-full object-contain drop-shadow-md ${elementShadows[miscrit.element]}`} />
                </div>
                <div className="p-4 sm:p-6 text-center flex-1 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                            {miscrit.name} <span className="text-gray-400 text-base font-normal">→ {miscrit.final_evo}</span>
                        </h2>
                        <div className="grid grid-cols-3 gap-y-4 gap-x-2 mt-4 text-center border-t border-gray-700 pt-4">
                            {statItems}
                        </div>
                    </div>
                </div>
                <div className="p-4 sm:p-6 text-center border-t border-gray-700 flex justify-between items-center mt-auto">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold uppercase text-gray-400">Element:</span>
                        <span className={`text-sm font-bold ${elementColors[miscrit.element]}`}>{miscrit.element}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold uppercase text-gray-400">Rarity:</span>
                        <span className={`text-sm font-bold ${rarityColors[miscrit.rarity]}`}>{miscrit.rarity}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-blue-100 p-6">
            <header className="sticky-header sticky top-0 z-10 p-4 mb-8">
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 max-w-7xl mx-auto bg-gray-900/80 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-400 font-semibold text-sm">Elements:</span>
                        <select
                            id="element-select"
                            value={currentElementFilter}
                            onChange={(e) => setCurrentElementFilter(e.target.value)}
                            className="bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {elements.map(el => (
                                <option key={el} value={el}>{el}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-400 font-semibold text-sm">Rarities:</span>
                        <select
                            id="rarity-select"
                            value={currentRarityFilter}
                            onChange={(e) => setCurrentRarityFilter(e.target.value)}
                            className="bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {rarities.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-teal-100 to-emerald-800 drop-shadow-md">
                    Miscrit Dex
                </h1>
                <div id="miscrit-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMiscrits.map(miscrit => (
                        <MiscritCard key={miscrit.name} miscrit={miscrit} />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default App;

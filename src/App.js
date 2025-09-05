import React, { useState, useEffect } from 'react';
import miscritsData from './data/miscrits.json';

// Main App component
const App = () => {
    

    // State variables
    const [allMiscrits, setAllMiscrits] = useState([]);
    const [currentElementFilter, setCurrentElementFilter] = useState('All');
    const [currentRarityFilter, setCurrentRarityFilter] = useState('All');
    const [elements, setElements] = useState(['All']);
    const [rarities, setRarities] = useState(['All']);
    const [showEvolved, setShowEvolved] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // New state for loading

    // Color and styling constants
    const rarityBgColors = {
        'Common': 'bg-gray-700', 'Rare': 'bg-indigo-800', 'Epic': 'bg-green-700',
        'Exotic': 'bg-fuchsia-700', 'Legendary': 'bg-amber-700',
    };
    const elementHighlight = {
        'Water': 'from-blue-500/50', 'Nature': 'from-green-500/50', 'Fire': 'from-red-500/50',
        'Lightning': 'from-yellow-500/50', 'Earth': 'from-orange-500/50', 'Wind': 'from-purple-500/50',
    };

    // Function to map a stat value to a Tailwind CSS color class.
    const getStatColor = (value) => {
        if (value >= 1 && value <= 2) return 'bg-red-400';
        if (value === 3) return 'bg-yellow-400';
        if (value >= 4 && value <= 5) return 'bg-green-400';
        return 'bg-gray-400';
    };

    // Data fetching and transformation logic
    useEffect(() => {
        const transformedMiscrits = miscritsData.map(m => {
            const { element, rarity, names } = m;
            const abilityIDs = m.ability_order.slice(-4);
            const abilities = abilityIDs.map(id => {
                const ability = m.abilities.find(a => a.id === id);
                if (ability?.element === 'Misc') return null;

                const ap = ability.ap + (ability.enchant?.ap || 0);
                const additional = ability.additional ? [ability.additional] : [];

                return { name: ability.name, desc: ability.desc, element: ability.element, ap, additional };
            }).filter(Boolean);

            let images = names.map(n => `https://cdn.worldofmiscrits.com/miscrits/${n.split(' ').join('_').toLowerCase()}_back.png`);

            return {
                name: m.names[0], element, rarity, names, images,
                hp: m.hp, spd: m.spd, ea: m.ea, pa: m.pa, ed: m.ed, pd: m.pd,
                abilities,
            };
        });

        setAllMiscrits(transformedMiscrits);

        // Populate filters
        const elementSet = new Set(transformedMiscrits.map(m => m.element));
        const raritySet = new Set(transformedMiscrits.map(m => m.rarity));
        setElements(['All', ...Array.from(elementSet)]);
        setRarities(['All', ...Array.from(raritySet)]);
        
        // Set loading to false after initial data load
        setIsLoading(false);
    }, []);

    // Function to handle toggle and show temporary loading state
    const handleToggle = (e) => {
        setShowEvolved(e.target.checked);
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };

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
        const statValues = {
            'Weak': 1, 'Moderate': 2, 'Strong': 3, 'Max': 4, 'Elite': 5
        }
        const statWidths = {
            1: 'w-[20%]', 2: 'w-[40%]', 3: 'w-[60%]', 4: 'w-[80%]', 5: 'w-[100%]'
        }

        const statIcons = {
            hp: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" /></svg>',
            spd: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path d="M11.646 1.516a.75.75 0 0 1 .708 0l7.5 4.5a.75.75 0 0 1 0 1.26l-7.5 4.5a.75.75 0 0 1-.708 0l-7.5-4.5a.75.75 0 0 1 0-1.26l7.5-4.5Z" /><path d="M16.924 12.516a.75.75 0 0 1 .672-.11l3.5-.75A.75.75 0 0 1 22 12.632v7.24a.75.75 0 0 1-.672.744l-3.5.75a.75.75 0 0 1-.672-.11v-8.25Z" /><path d="M11.646 13.516a.75.75 0 0 1 .708 0l7.5 4.5a.75.75 0 0 1 0 1.26l-7.5 4.5a.75.75 0 0 1-.708 0l-7.5-4.5a.75.75 0 0 1 0-1.26l7.5-4.5Z" /><path d="M6.924 12.516a.75.75 0 0 1 .672.11v8.25a.75.75 0 0 1-.672.11l-3.5-.75A.75.75 0 0 1 2 20.132v-7.24a.75.75 0 0 1 .672-.744l3.5-.75a.75.75 0 0 1 .672.11Z" /></svg>',
            ea: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path d="M12 2.25a.75.75 0 0 1 .75.75v6.59l4.588-3.327a.75.75 0 0 1 .84.148l.004.004a.75.75 0 0 1-.148.84l-4.225 3.064 4.015 3.064a.75.75 0 0 1-.004 1.258l-.004.004a.75.75 0 0 1-.84-.148L12.75 14.41v6.59a.75.75 0 0 1-1.5 0v-6.59l-4.588 3.327a.75.75 0 0 1-.84-.148l-.004-.004a.75.75 0 0 1 .148-.84l4.225-3.064-4.015-3.064a.75.75 0 0 1 .004-1.258l.004-.004a.75.75 0 0 1 .84.148L11.25 9.59V3a.75.75 0 0 1 .75-.75Z" /></svg>',
            pa: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path fill-rule="evenodd" d="M19.952 1.344a.75.75 0 0 0-1.002-.214l-12.742 7.27a.75.75 0 0 0 0 1.352l12.742 7.27a.75.75 0 0 0 1.002-.214l2.871-6.194a.75.75 0 0 0-.214-1.002l-2.871-6.194Z" clip-rule="evenodd" /><path d="M8.25 4.5a.75.75 0 0 0-1.5 0v15a.75.75 0 0 0 1.5 0v-15Z" /></svg>',
            ed: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 13.5a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Zm3.375-3.375a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75ZM8.25 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm3.75 1.5a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Zm-3.375-3.375a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Zm3.75-3.75a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Z" clip-rule="evenodd" /></svg>',
            pd: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 13.5a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Zm3.375-3.375a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75ZM8.25 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm3.75 1.5a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Zm-3.375-3.375a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Zm3.75-3.75a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Z" clip-rule="evenodd" /></svg>',
        };
        const iconBgColors = {
            hp: 'bg-green-600',
            spd: 'bg-yellow-600',
            ea: 'bg-red-600',
            ed: 'bg-red-600',
            pa: 'bg-blue-600',
            pd: 'bg-blue-600',
        };

        const stats = Object.keys(statLabels).map(key => ({
            label: statLabels[key],
            statKey: key, // Store the key for icon lookup
            value: statValues[miscrit[key]],
            colorClass: getStatColor(statValues[miscrit[key]]),
            widthClass: statWidths[statValues[miscrit[key]]]
        }));

        return (
            <div className={`bg-gray-100 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transform transition-transform duration-300 hover:scale-105 border-2 border-amber-200 flex flex-col`}>
                <div className={`relative w-full h-48 sm:h-52 flex justify-center items-center p-4 bg-gradient-to-br ${elementHighlight[miscrit.element]} to-gray-900`}>
                    
                    <img
                        src={`https://worldofmiscrits.com/${miscrit.element.toLowerCase()}.png`}
                        alt={`${miscrit.element} element`}
                        className="absolute top-2 left-2 w-8 h-8 rounded-full"
                    />

                    {showEvolved ? (
                        <div className="flex justify-around w-full h-full">
                            <div className="flex flex-col items-center justify-end">
                                <img src={miscrit.images[0]} alt={miscrit.names[0]} className={`h-full object-contain drop-shadow-md`} />
                                <span className="text-sm font-semibold text-white mt-1">{miscrit.names[0]}</span>
                            </div>
                            <div className="flex flex-col items-center justify-end">
                                <img src={miscrit.images[3]} alt={miscrit.names[3]} className={`h-full object-contain drop-shadow-md`} />
                                <span className="text-sm font-semibold text-white mt-1">{miscrit.names[3]}</span>
                            </div>
                        </div>
                    ) : (
                        <img src={miscrit.images[0]} alt={miscrit.names[0]} className={`h-full object-contain drop-shadow-md`} />
                    )}
                </div>
                <div className={`p-2 sm:p-3 text-center flex-1 flex flex-col justify-between ${rarityBgColors[miscrit.rarity]}`}>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                            {miscrit.name}
                        </h2>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 pt-2 border-t border-gray-700">
                            {stats.map(stat => (
                                <div key={stat.label} title={stat.label} className="flex items-center space-x-1">
                                    <div className={`p-1 rounded-full flex items-center justify-center ${iconBgColors[stat.statKey]}`}>
                                        <div dangerouslySetInnerHTML={{ __html: statIcons[stat.statKey] }} />
                                    </div>
                                    <div className="flex flex-col w-full text-left">
                                      <div className="flex space-x-[2px] mt-1 h-3 rounded overflow-hidden">
                                          {Array.from({ length: 5 }).map((_, i) => (
                                              <div
                                                  key={i}
                                                  className={`flex-1 rounded-sm ${i < stat.value ? stat.colorClass : 'bg-gray-600'}`}
                                              ></div>
                                          ))}
                                      </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-black p-3 min-h-screen">
            {isLoading && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-50 transition-opacity duration-300">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-gray-700 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                    </div>
                    <p className="mt-4 text-gray-200 font-semibold">Loading...</p>
                </div>
            )}

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
                    
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-400 font-semibold text-sm">Show Evolved:</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                value=""
                                className="sr-only peer"
                                checked={showEvolved}
                                onChange={handleToggle}
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                </div>
            </header>
            <main className="max-w-7xl mx-auto" style={{padding: 0}}>
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

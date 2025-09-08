import React, { useState, useEffect } from 'react';

import './App.css';
import MiscritCard from './components/MiscritCard';
import ExpandedMiscritCard from './components/ExpandedMiscritCard';
import AbilityFilterDialog from './components/AbilityFilter';
import miscritsData from './data/miscrits.json';

import {
    statValues, getStatColor, rarityValues, extractHitsNumber, removeDuplicates
} from './helpers.js';


const App = () => {

    // State variables
    const [allMiscrits, setAllMiscrits] = useState([]);

    const [elements, setElements] = useState(['All']);
    const [rarities, setRarities] = useState(['All']);
    const [locations, setLocations] = useState(['All']);
    const [showEvolved, setShowEvolved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedMiscritId, setExpandedMiscritId] = useState(null);

    const [showFilters, setShowFilters] = useState(false); // Changed to false by default
    const [currentElementFilter, setCurrentElementFilter] = useState('All');
    const [currentRarityFilter, setCurrentRarityFilter] = useState('All');
    const [currentLocationFilter, setCurrentLocationFilter] = useState('All');
    const [currentSortOrder, setCurrentSortOrder] = useState('id');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBuffs, setselectedBuffs] = useState([]);
    const [availableBuffs, setAvailableBuffs] = useState([]);
    const [showBuffsFilter, toggleBuffsFilter] = useState(false);
    const [availableAbilities, setAvailableAbilities] = useState([]);
    const [abilityFilters, setAbilityFilters] = useState({
        apply: false, name: '', text: ''
    });
    const [showAbilityFilter, toggleAbilityFilter] = useState(false);
    const [showStatFilter, toggleStatFilter] = useState(false);
    const [statFilters, setStatFilters] = useState({
        hp: 1, spd: 1, ea: 1, pa: 1, ed: 1, pd: 1,
    });



    // Data fetching and transformation logic
    useEffect(() => {
        let abilityOptions = [];
        const transformedMiscrits = miscritsData.map(m => {
            const { id, element, rarity, names, abilities: rawAbilities } = m;
            let extras = [];
            let maxAP = 0;


            let indexLevelMap = { 0: 1, 1: 1, 2: 4, 3: 7, 4: 10, 5: 13, 6: 16, 7: 19, 8: 22, 9: 25, 10: 28, 11: 30 }
            const abilities = m.ability_order.map((i, idx) => {
                const ability = rawAbilities.find(a => a.id === i);
                if (!ability) return null;

                const numOfTurns = extractHitsNumber(ability.desc);
                const ap = (ability.ap + (ability?.enchant?.ap || 0)) * numOfTurns;
                if (ability.type === 'Attack' && ap > maxAP) {
                    maxAP = ap;
                }

                let imgSrcName = (ability.type === 'Attack' ? ability.element : ability.type).toLowerCase();
                if(imgSrcName === 'buff' && ability.desc.includes('Lower')) imgSrcName = 'debuff';
                if(imgSrcName === 'dot' && ability.element) imgSrcName = `${ability.element.toLowerCase()}_poison`
                const imgSrc = `https://worldofmiscrits.com/${imgSrcName}.png`

                const unlockedAt = indexLevelMap[idx];
                abilityOptions.push({ 
                    id: ability.id, 
                    name: ability.name, 
                    ultimate: unlockedAt > 27 && ap > 29, 
                    type: ability.type, 
                    element: ability.element
                });

                if (ability.type && ability.type !== 'Attack' && ability.type !== 'Buff') {
                    extras.push(ability.type);
                }
                if (ability.additional?.length) {
                    ability.additional.forEach(a => {
                        if (a.type && a.type !== 'Attack' && a.type !== 'Buff') {
                            extras.push(a.type);
                        }
                    })
                }

                return {
                    name: ability.name,
                    desc: ability.desc,
                    element: ability.element,
                    ap,
                    additional: ability.additional,
                    type: ability.type,
                    unlockedAt,
                    imgSrc
                };
            }).filter(Boolean).reverse();

            const images = names.map(n => `https://cdn.worldofmiscrits.com/miscrits/${n.split(' ').join('_').toLowerCase()}_back.png`);
            const locations = Object.keys(m.locations);
            let offset = rarityValues[rarity] > 2 ? maxAP > 35 ? 5 : 2 : 0;
            const ultimates = abilities.filter(a => a.type === 'Attack' && (a.unlockedAt === 30 || a.ap >= (maxAP - offset)))

            return {
                id, name: m.names[0], element, rarity, names, images,
                hp: m.hp, spd: m.spd, ea: m.ea, pa: m.pa, ed: m.ed, pd: m.pd,
                abilities,
                locations, maxAP, ultimates,
                extras: [...new Set(extras)]
            };
        });

        console.log(transformedMiscrits);
        setAllMiscrits(transformedMiscrits);

        // Populate filters
        const allElements = new Set(transformedMiscrits.map(m => m.element));
        const allRarities = new Set(transformedMiscrits.map(m => m.rarity));
        setElements(['All', ...Array.from(allElements)]);
        setRarities(['All', ...Array.from(allRarities)]);

        const allLocations = new Set(transformedMiscrits.flatMap(m => m.locations));
        setLocations(['All', ...Array.from(allLocations).sort()]);

        const allExtras = new Set(transformedMiscrits.flatMap(m => m.extras));
        setAvailableBuffs(Array.from(allExtras).sort());

        const allAbilities = removeDuplicates(abilityOptions, 'id');
        setAvailableAbilities(allAbilities.sort((a,b) => b.name - a.name));

        // Set loading to false after initial data load
        setIsLoading(false);
    }, []);

    // Function to handle the Evolved toggle
    const handleToggle = (e) => {
        setShowEvolved(e.target.checked);
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };

    const handleStatFilterChange = (stat, value) => {
        setStatFilters(prevFilters => ({
            ...prevFilters,
            [stat]: value,
        }));
    };

    const handleAbilityFilterChange = (filters) => {
        setAbilityFilters(filters);
        toggleAbilityFilter(false);
    }

    const handleExtraToggle = (extra) => {
        setselectedBuffs(prevExtras => {
            if (prevExtras.includes(extra)) {
                return prevExtras.filter(item => item !== extra);
            } else {
                return [...prevExtras, extra];
            }
        });
    };


    const resetFilters = () => {
        setCurrentElementFilter('All')
        setCurrentRarityFilter('All')
        setCurrentLocationFilter('All')
        setCurrentSortOrder('id')
        setSearchTerm('')
        setAbilityFilters({ apply: false });
        setselectedBuffs([])
        toggleBuffsFilter(false)
        toggleStatFilter(false)
        setStatFilters({ hp: 1, spd: 1, ea: 1, pa: 1, ed: 1, pd: 1 });
        setShowFilters(false);
    }


    // Sort miscrits based on state
    const sortedMiscrits = [...allMiscrits].sort((a, b) => {
        if (currentSortOrder === 'power') {
            return b.maxAP - a.maxAP;
        }
        return a.id - b.id; // Default sort by ID
    });

    // Filter miscrits based on state
    const filteredMiscrits = sortedMiscrits.filter(miscrit => {
        const searchTermLower = searchTerm.toLowerCase();
        const nameMatch = miscrit.names.some(name => name.toLowerCase().includes(searchTermLower));
        let abilityMatch = true;
        if (abilityFilters.apply) {
            const { name, text } = abilityFilters;
            const searchString = text ? text.toLowerCase() : text;
            const textMatch = ability => text ? ability.desc.toLowerCase().includes(searchString) : true;
            abilityMatch = miscrit.abilities.some(a => a.name === name && textMatch(a))
        }
        const elementMatch = currentElementFilter === 'All' || miscrit.element === currentElementFilter;
        const rarityMatch = currentRarityFilter === 'All' || miscrit.rarity === currentRarityFilter;
        const locationMatch = currentLocationFilter === 'All' || miscrit.locations.includes(currentLocationFilter);
        const statMatch = Object.keys(statFilters).every(statKey => {
            return statValues[miscrit[statKey]] >= statFilters[statKey];
        });
        const extrasMatch = selectedBuffs.length === 0 || selectedBuffs.some(extra => miscrit.extras.includes(extra));

        return nameMatch && abilityMatch
            && elementMatch && rarityMatch && locationMatch && statMatch && extrasMatch;
    });



    return (
        <div className="bg-slate-900 p-3 min-h-screen">

            {isLoading && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-50 transition-opacity duration-300">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-gray-700 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                    </div>
                    <p className="mt-4 text-gray-200 font-semibold">Loading...</p>
                </div>
            )}

            <header className="sticky-header sticky top-0 z-10 p-4 mb-4">
                <div className="flex flex-col justify-center items-center gap-2 space-y-4 sm:space-y-0 sm:space-x-8 max-w-7xl mx-auto bg-gray-900/90 rounded-xl p-4 shadow-lg border-2 border-gray-500">
                    <h1 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-100 to-emerald-800 drop-shadow-md">
                        Miscrit Dex
                    </h1>
                    <div className="flex flex-row items-center space-x-0 sm:space-x-4 w-[95%] justify-between gap-3">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-full border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="mt-2 sm:mt-0 text-gray-200 text-sm px-4 py-2 rounded-full font-semibold border-2 border-gray-700 hover:bg-gray-700 transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel" viewBox="0 0 16 16">
                                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
                            </svg>
                        </button>
                    </div>
                    {showFilters && (
                        <>
                            <div className="flex flex-col sm:flex-row justify-center items-start flex-wrap gap-y-4 m-0 w-full sm:max-w-7xl mx-auto rounded-xl p-2 transition-all duration-500 ease-in-out">
                                <div className="flex items-center space-x-4 basis-1/4">
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
                                <div className="flex items-center space-x-4 basis-1/4">
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
                                <div className="flex items-center space-x-4 basis-1/4">
                                    <span className="text-gray-400 font-semibold text-sm">Locations:</span>
                                    <select
                                        id="location-select"
                                        value={currentLocationFilter}
                                        onChange={(e) => setCurrentLocationFilter(e.target.value)}
                                        className="bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {locations.map(l => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center space-x-4 basis-1/4">
                                    <span className="text-gray-400 font-semibold text-sm">Sort by:</span>
                                    <select
                                        id="sort-select"
                                        value={currentSortOrder}
                                        onChange={(e) => setCurrentSortOrder(e.target.value)}
                                        className="bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="id">ID</option>
                                        <option value="power">Ultimate AP</option>
                                    </select>
                                </div>
                                <div className="relative flex flex-row items-center space-x-2 basis-1/4">
                                    <span className="text-gray-400 font-semibold text-sm">Buffs:</span>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => toggleBuffsFilter(!showBuffsFilter)}
                                            className="bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
                                        >
                                            <span className="truncate">
                                                {selectedBuffs.length > 0 ? selectedBuffs.join(', ') : ''}
                                            </span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`w-4 h-4 transition-transform duration-200 ${showBuffsFilter ? 'rotate-180' : ''} bi bi-chevron-down`} viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                                            </svg>
                                        </button>
                                        {showBuffsFilter && (
                                            <div className="absolute z-20 w-48 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {availableBuffs.map(extra => (
                                                    <div
                                                        key={extra}
                                                        onClick={() => handleExtraToggle(extra)}
                                                        className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-700 transition duration-150"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            readOnly
                                                            checked={selectedBuffs.includes(extra)}
                                                            className="form-checkbox text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-400"
                                                        />
                                                        <span className="text-gray-200 text-sm">{extra}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="relative basis-1/4">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-gray-400 font-semibold text-sm">Filter Stats</span>
                                        <button
                                            onClick={() => toggleStatFilter(!showStatFilter)}
                                            className="flex items-center space-x-2 bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <svg className={`w-4 h-4 transition-transform duration-200 ${showStatFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>
                                    </div>
                                    {showStatFilter && (
                                        <div className="absolute top-full mt-2 w-64 p-4 rounded-xl shadow-lg bg-gray-800 z-20 transition-opacity duration-300">
                                            <h3 className="text-sm font-semibold text-gray-400 mb-2">Minimum Stat Value:</h3>
                                            <div className="space-y-3">
                                                {Object.keys(statFilters).map(stat => (
                                                    <div key={stat} className="flex items-center justify-start gap-2">
                                                        <p className="text-xs font-semibold uppercase text-slate-500">{stat.toUpperCase()}</p>
                                                        <div className="flex flex-1 justify-end space-x-1">
                                                            {[1, 2, 3, 4, 5].map(value => (
                                                                <div
                                                                    key={value}
                                                                    onClick={() => handleStatFilterChange(stat, value)}
                                                                    className={`w-6 h-6 rounded-md cursor-pointer transition-colors duration-100 ease-in-out ${value <= statFilters[stat] ? getStatColor(value) : 'bg-gray-600'}`}
                                                                ></div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 basis-1/4">
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
                            <div className="flex flex-row items-center justify-end gap-2 m-0 space-x-0 sm:space-x-4 w-[95%]">
                                <button
                                    onClick={() => toggleAbilityFilter(true)}
                                    className="bg-teal-800 text-white text-sm px-3 py-1 font-semibold hover:bg-teal-600 transition-colors duration-200"
                                >
                                    Explore Abilities
                                </button>
                                <button
                                    onClick={resetFilters}
                                    className="bg-red-800 text-white text-sm px-3 py-1 font-semibold hover:bg-red-700 transition-colors duration-200"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </header>
            <main className="max-w-7xl mx-auto" style={{ padding: 0 }}>
                <div id="miscrit-container" className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
                    {filteredMiscrits.map(miscrit => (
                        <MiscritCard
                            key={miscrit.id}
                            miscrit={miscrit}
                            showEvolved={showEvolved}
                            onClick={() => setExpandedMiscritId(miscrit.id)}
                        />
                    ))}
                </div>
            </main>
            {expandedMiscritId && (
                <ExpandedMiscritCard
                    miscrit={allMiscrits.find(m => m.id === expandedMiscritId)}
                    onClose={() => setExpandedMiscritId(null)}
                />
            )}

            {showAbilityFilter && (
                <AbilityFilterDialog filters={abilityFilters} abilities={availableAbilities} onClose={handleAbilityFilterChange} />
            )}
        </div>
    );
};

export default App;

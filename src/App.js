import React, { useState, useEffect } from 'react';
import './App.css';
import miscritsData from './data/miscrits.json';

// Main App component
const App = () => {

    // State variables
    const [allMiscrits, setAllMiscrits] = useState([]);
    const [currentElementFilter, setCurrentElementFilter] = useState('All');
    const [currentRarityFilter, setCurrentRarityFilter] = useState('All');
    const [currentLocationFilter, setCurrentLocationFilter] = useState('All');
    const [currentSortOrder, setCurrentSortOrder] = useState('id');
    const [elements, setElements] = useState(['All']);
    const [rarities, setRarities] = useState(['All']);
    const [locations, setLocations] = useState(['All']);
    const [showEvolved, setShowEvolved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedMiscritId, setExpandedMiscritId] = useState(null);
    const [isStatFilterOpen, setIsStatFilterOpen] = useState(false);
    const [statFilters, setStatFilters] = useState({
        hp: 1, spd: 1, ea: 1, pa: 1, ed: 1, pd: 1,
    });
    const [showFilters, setShowFilters] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // CSS for the sheen effect animation
    const sheenStyles = `
        @keyframes sheen {
            0% { transform: translateX(-100%) skewX(-20deg); }
            100% { transform: translateX(100%) skewX(-20deg); }
        }
        .common-sheen:hover::after, .rare-sheen:hover::after, .epic-sheen:hover::after {
            animation: sheen 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .exotic-sheen:hover::after, .legendary-sheen:hover::after {
            animation: sheen 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .common-sheen::after, .rare-sheen::after, .epic-sheen::after, .exotic-sheen::after, .legendary-sheen::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 200%;
            height: 100%;
            pointer-events: none;
            transition: none;
            z-index: 10;
        }
        .common-sheen::after, .rare-sheen::after, .epic-sheen::after {
            background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 100%);
            transform: translateX(-100%) skewX(-20deg);
        }
        .exotic-sheen::after, .legendary-sheen::after {
            background: linear-gradient(to right, rgba(255, 215, 0, 0) 0%, rgba(255, 215, 0, 0.5) 50%, rgba(255, 215, 0, 0) 100%);
            transform: translateX(-100%) skewX(-20deg);
        }
    `;

    const elementColors = {
        'Water': 'sky', 'Nature': 'green', 'Fire': 'red',
        'Lightning': 'indigo', 'Earth': 'orange', 'Wind': 'violet',
    };

    const rarityShinyBgColors = {
        'Common': 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-600 via-slate-700 to-slate-900',
        'Rare': 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700 via-blue-800 to-blue-950',
        'Epic': 'bg-[radial-gradient(ellipse_at-top,_var(--tw-gradient-stops))] from-emerald-600 via-emerald-700 to-emerald-900',
        'Exotic': 'bg-[radial-gradient(ellipse_at-top,_var(--tw-gradient-stops))] from-fuchsia-800 via-fuchsia-900 to-fuchsia-950',
        'Legendary': 'bg-[radial-gradient(ellipse_at-top,_var(--tw-gradient-stops))] from-amber-300 via-amber-400 to-amber-500',
    };

    const rarityTextColors = {
        'Common': 'text-gray-200',
        'Rare': 'text-gray-200',
        'Epic': 'text-gray-200',
        'Exotic': 'text-gray-200',
        'Legendary': 'text-black',
    };

    // Determine border color based on rarity
    const borderColors = {
        'Common': 'border-slate-500',
        'Rare': 'border-slate-500',
        'Epic': 'border-slate-500',
        'Exotic': 'border-amber-400',
        'Legendary': 'border-amber-400',
    };


    const statIcons = {
        hp: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" /></svg>',
        spd: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path d="M11.5 19.5L9 22V14H2L12.5 2.5L15 2V10H22L11.5 19.5Z" /></svg>',
        ea: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path d="M12 2.25a.75.75 0 0 1 .75.75v6.59l4.588-3.327a.75.75 0 0 1 .84.148l.004.004a.75.75 0 0 1-.148.84l-4.225 3.064 4.015 3.064a.75.75 0 0 1-.004 1.258l-.004.004a.75.75 0 0 1-.84-.148L12.75 14.41v6.59a.75.75 0 0 1-1.5 0v-6.59l-4.588 3.327a.75.75 0 0 1-.84-.148l-.004-.004a.75.75 0 0 1 .148-.84l4.225-3.064-4.015-3.064a.75.75 0 0 1 .004-1.258l.004-.004a.75.75 0 0 1 .84.148L11.25 9.59V3a.75.75 0 0 1 .75-.75Z" /></svg>',
        pa: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path fill-rule="evenodd" d="M19.952 1.344a.75.75 0 0 0-1.002-.214l-12.742 7.27a.75.75 0 0 0 0 1.352l12.742 7.27a.75.75 0 0 0 1.002-.214l2.871-6.194a.75.75 0 0 0-.214-1.002l-2.871-6.194Z" clip-rule="evenodd" /><path d="M8.25 4.5a.75.75 0 0 0-1.5 0v15a.75.75 0 0 0 1.5 0v-15Z" /></svg>',
        ed: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path d="M12 2.25c-2.33 0-4.5.918-6.121 2.539l-.025.025c-1.62 1.62-2.539 3.791-2.539 6.121v5.625A2.25 2.25 0 0 0 5.25 18.75h13.5a2.25 2.25 0 0 0 2.25-2.25v-5.625c0-2.33-.919-4.501-2.54-6.121l-.025-.025C16.5 3.168 14.33 2.25 12 2.25ZM12 4.5a.75.75 0 0 1 .75.75V9a.75.75 0 0 1-1.5 0V5.25a.75.75 0 0 1 .75-.75Z" /></svg>',
        pd: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path d="M12 2.25c-2.33 0-4.5.918-6.121 2.539l-.025.025c-1.62 1.62-2.539 3.791-2.539 6.121v5.625A2.25 2.25 0 0 0 5.25 18.75h13.5a2.25 2.25 0 0 0 2.25-2.25v-5.625c0-2.33-.919-4.501-2.54-6.121l-.025-.025C16.5 3.168 14.33 2.25 12 2.25ZM12 4.5a.75.75 0 0 1 .75.75V9a.75.75 0 0 1-1.5 0V5.25a.75.75 0 0 1 .75-.75Z" /></svg>',
    };
    const iconBgColors = {
        hp: 'bg-green-600',
        spd: 'bg-yellow-600',
        ea: 'bg-red-600',
        ed: 'bg-red-600',
        pa: 'bg-blue-600',
        pd: 'bg-blue-600',
    };



    // Function to get the correct gradient class for single or dual elements
    const getGradientClass = (element) => {
        const primaryElement = element;
        const [el1, el2] = element.split(/(?=[A-Z])/).filter(Boolean); // Split by capitalized letters
        if (el1 && el2 && elementColors[el1] && elementColors[el2]) {
            // Dual element
            return `from-${elementColors[el1]}-500 to-${elementColors[el2]}-500`;
        }
        // Single element
        return `from-${elementColors[primaryElement]}-100 to-${elementColors[primaryElement]}-700`;
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
            const { id, element, rarity, names, abilities: rawAbilities } = m;
            const abilityIDs = m.ability_order.slice(-4);
            const abilities = abilityIDs.map(i => {
                const ability = rawAbilities.find(a => a.id === i);
                if (ability?.element === 'Misc') return null;

                const ap = ability?.ap + (ability?.enchant?.ap || 0);
                const additional = ability?.additional ? [ability.additional] : [];

                return { name: ability?.name, desc: ability?.desc, element: ability?.element, ap, additional };
            }).filter(Boolean);

            // Calculate maxAP
            const maxAP = abilities.length > 0 ? Math.max(...abilities.map(a => a.ap)) : 0;

            let images = names.map(n => `https://cdn.worldofmiscrits.com/miscrits/${n.split(' ').join('_').toLowerCase()}_back.png`);

            let locations = Object.keys(m.locations);

            return {
                id, name: m.names[0], element, rarity, names, images,
                hp: m.hp, spd: m.spd, ea: m.ea, pa: m.pa, ed: m.ed, pd: m.pd,
                abilities, locations, maxAP
            };
        });

        setAllMiscrits(transformedMiscrits);

        // Populate filters
        const allElements = new Set(transformedMiscrits.map(m => m.element));
        const allRarities = new Set(transformedMiscrits.map(m => m.rarity));
        setElements(['All', ...Array.from(allElements)]);
        setRarities(['All', ...Array.from(allRarities)]);

        const allLocations = new Set(transformedMiscrits.flatMap(m => m.locations));
        setLocations(['All', ...Array.from(allLocations).sort()]);

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

    const resetStatFilters = () => {
        setStatFilters({ hp: 1, spd: 1, ea: 1, pa: 1, ed: 1, pd: 1 });
    };

    // Function to map stat string values to a number for comparison
    const statValues = {
        'Weak': 1, 'Moderate': 2, 'Strong': 3, 'Max': 4, 'Elite': 5
    };

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
        const elementMatch = currentElementFilter === 'All' || miscrit.element === currentElementFilter;
        const rarityMatch = currentRarityFilter === 'All' || miscrit.rarity === currentRarityFilter;
        const locationMatch = currentLocationFilter === 'All' || miscrit.locations.includes(currentLocationFilter);
        const statMatch = Object.keys(statFilters).every(statKey => {
            return statValues[miscrit[statKey]] >= statFilters[statKey];
        });

        return nameMatch && elementMatch && rarityMatch && locationMatch && statMatch;
    });

    // Miscrit card component
    const MiscritCard = ({ miscrit, onClick }) => {
        const statLabels = {
            hp: 'HP', spd: 'SPD', ea: 'EA', pa: 'PA', ed: 'ED', pd: 'PD'
        };
        const statWidths = {
            1: 'w-[20%]', 2: 'w-[40%]', 3: 'w-[60%]', 4: 'w-[80%]', 5: 'w-[100%]'
        }



        const stats = Object.keys(statLabels).map(key => ({
            label: statLabels[key],
            statKey: key, // Store the key for icon lookup
            value: statValues[miscrit[key]],
            colorClass: getStatColor(statValues[miscrit[key]]),
            widthClass: statWidths[statValues[miscrit[key]]]
        }));

        const sheenClass = miscrit.rarity === 'Exotic' || miscrit.rarity === 'Legendary' ? 'exotic-sheen' : 'common-sheen';

        return (
            <div
                className={`${rarityShinyBgColors[miscrit.rarity]} rounded-xl overflow-hidden shadow-xl transform transition-transform duration-300 hover:scale-105 border-2 ${borderColors[miscrit.rarity]} flex flex-col relative ${sheenClass} cursor-pointer`}
                onClick={onClick}
            >
                <div className={`relative w-full h-48 sm:h-52 flex justify-center items-center p-4 z-20 bg-gradient-to-br ${getGradientClass(miscrit.element)}`}>
                    <img
                        src={`https://worldofmiscrits.com/${miscrit.element.toLowerCase()}.png`}
                        alt={`${miscrit.element} element`}
                        className="absolute top-2 left-2 w-8 h-8 rounded-full"
                    />
                    {
                        showEvolved ? <div className="flex justify-between w-full h-full p-4 items-end">
                            <img src={miscrit.images[0]} alt={miscrit.names[0]} className={`h-[30%] object-contain drop-shadow-md`} />
                            <img src={miscrit.images[3]} alt={miscrit.names[3]} className={`h-full object-contain drop-shadow-md`} />
                        </div>
                            :
                            <img src={miscrit.images[0]} alt={miscrit.names[0]} className={`h-full object-contain drop-shadow-md`} />
                    }
                </div>
                <div className={`p-2 sm:p-3 text-center flex-1 flex-col justify-between ${rarityTextColors[miscrit.rarity]}`}>
                    <div>
                        {showEvolved ? <div className="flex flex-col items-center w-full p-0">
                            <h2 className={`text-xs sm:text-xs font-bold text-slate-400`}>{miscrit.name}</h2>
                            <h2 className={`text-xl sm:text-3xl font-bold mb-4 card-font`}>{miscrit.names[3]}</h2>
                        </div> :
                            <h2 className={`text-xl sm:text-3xl font-bold mb-4 card-font`}>{miscrit.name}</h2>
                        }
                        <div className="bg-slate-400 rounded-lg p-2">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 pt-2">
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
            </div>
        );
    };

    const ExpandedMiscritCard = ({ miscrit, onClose }) => {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 transition-opacity duration-300"
                onClick={onClose}
            >
                <div className={`relative w-full max-w-6xl rounded-xl shadow-2xl transition-all duration-300 transform scale-95`}>
                    <div className={`${rarityShinyBgColors[miscrit.rarity]} rounded-xl overflow-hidden shadow-xl border-2 ${borderColors[miscrit.rarity]} flex flex-col relative`}>
                        <div className={`relative w-full flex justify-center items-center p-4 bg-gradient-to-br ${getGradientClass(miscrit.element)}`}>
                            <img
                                src={`https://worldofmiscrits.com/${miscrit.element.toLowerCase()}.png`}
                                alt={`${miscrit.element} element`}
                                className="absolute top-2 left-2 w-10 h-10 rounded-full"
                            />
                            <div className="grid grid-cols-4 gap-4 w-full h-full p-4">
                                {miscrit.images.map((image, index) => (
                                    <div key={index} className="flex flex-col items-center justify-end">
                                        <img src={image} alt={miscrit.names[index]} className={`w-[${(30 * (index + 1)) - (10 * (index + 1))}%] object-contain drop-shadow-md hover-expand`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 w-full h-full p-4">
                            {miscrit.names.map((name, index) => (
                                <h2 className={`text-2xl text-center card-font font-bold ${rarityTextColors[miscrit.rarity]}`} key={index}>{name}</h2>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-black p-3 min-h-screen">
            {/* The style tag is placed here to define the animation keyframes and classes */}
            <style>{sheenStyles}</style>

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
                <div className="flex flex-col justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 max-w-7xl mx-auto bg-gray-900/80 rounded-xl p-4 shadow-lg">
                    <div className="flex flex-row items-center space-x-0 sm:space-x-4 w-full justify-center mb-4 sm:mb-0">
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-funnel" viewBox="0 0 16 16">
                                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
                            </svg>
                        </button>
                    </div>
                    {showFilters && (
                        <div className="flex flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 max-w-7xl mx-auto rounded-xl p-4 transition-all duration-500 ease-in-out">
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
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-400 font-semibold text-sm">Sort by:</span>
                                <select
                                    id="sort-select"
                                    value={currentSortOrder}
                                    onChange={(e) => setCurrentSortOrder(e.target.value)}
                                    className="bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="id">ID</option>
                                    <option value="power">Max AP</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-4">
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
                            <div className="relative">
                                <button
                                    onClick={() => setIsStatFilterOpen(!isStatFilterOpen)}
                                    className="flex items-center space-x-2 bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <span className="font-semibold">Stats</span>
                                    <svg className={`w-4 h-4 transition-transform duration-200 ${isStatFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                                {isStatFilterOpen && (
                                    <div className="absolute top-full mt-2 w-64 p-4 rounded-xl shadow-lg bg-gray-800 z-20 transition-opacity duration-300">
                                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Minimum Stat Value:</h3>
                                        <div className="space-y-3">
                                            {Object.keys(statFilters).map(stat => (
                                                <div key={stat} className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold uppercase w-12">{stat.toUpperCase()}</span>
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
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={resetStatFilters}
                                                className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-semibold hover:bg-red-700 transition-colors duration-200"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                    )}
                </div>
            </header>
            <main className="max-w-7xl mx-auto" style={{ padding: 0 }}>
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-teal-100 to-emerald-800 drop-shadow-md">
                    Miscrit Dex
                </h1>
                <div id="miscrit-container" className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
                    {filteredMiscrits.map(miscrit => (
                        <MiscritCard
                            key={miscrit.id}
                            miscrit={miscrit}
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
        </div>
    );
};

export default App;

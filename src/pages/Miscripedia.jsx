import React, { useState, useEffect, useRef } from 'react';

import MiscritCard from '../components/MiscritCard';
import ExpandedMiscritCard from '../components/ExpandedMiscritCard';
import AbilityFilterDialog from '../components/AbilityFilter';
import NumberSelector from '../components/inputs/NumberSelector';
import { ToastProvider } from '../services/toast.service.js';

import miscritsData from '../data/miscrits.json';
import MiscritLogo from '../data/MiscritsLogo.png';
import {
    dayMap, statValues, getStatColor, rarityValues, removeDuplicates, extractBuffs
} from '../helpers/helpers.js';


const MiscripediaPage = ({ toggleSidebar }) => {

    // State variables
    const [allMiscrits, setAllMiscrits] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedEvo, setSelectedEvo] = useState(1);

    const [elements, setElements] = useState([]);
    const [selectedElements, setSelectedElements] = useState([]);
    const [showElementFilter, toggleElementFilter] = useState(false);
    const [rarities, setRarities] = useState([]);
    const [selectedRarities, setSelectedRarities] = useState([]);
    const [showRarityFilter, toggleRarityFilter] = useState(false);
    const [locations, setLocations] = useState(['All']);
    // eslint-disable-next-line
    const [days, setDays] = useState(Object.values(dayMap));
    const [availableUltBuffs, setAvailableUltBuffs] = useState([]);
    const [availableAbilities, setAvailableAbilities] = useState([]);

    const [currentLocationFilter, setCurrentLocationFilter] = useState('All');
    const [currentDayFilter, setCurrentDayFilter] = useState('All');
    const [currentSortOrder, setCurrentSortOrder] = useState('id');
    const [expandedMiscritId, setExpandedMiscritId] = useState(null);

    const [selectedBuffs, setSelectedBuffs] = useState([]);
    const [availableBuffs, setAvailableBuffs] = useState([]);
    const [showBuffsFilter, toggleBuffsFilter] = useState(false);

    const [showStatFilter, toggleStatFilter] = useState(false);
    const [currentStatFilters, setCurrentStatFilters] = useState('');
    const [statFilters, setStatFilters] = useState({
        hp: 1, spd: 1, ea: 1, pa: 1, ed: 1, pd: 1,
    });
    const [exactStats, toggleExactStats] = useState(false);

    const [showAbilityFilter, toggleAbilityFilter] = useState(false);
    const [abilityFilters, setAbilityFilters] = useState({
        apply: false, name: '', text: '', ultBuff: ''
    });


    const [isLoading, setIsLoading] = useState(true);
    const [showHeader, setShowHeader] = useState(true);
    const sentinelRef = useRef(null);
    const sentinelPositionRef = useRef(0);
    const [forceHeader, setForceHeader] = useState(false);
    const forceHeaderRef = useRef(false);

    const checkForcedHeader = () => {
        if (sentinelRef.current) {
            const rect = sentinelRef.current.getBoundingClientRect();
            if (rect) {
                if (rect.width < 450)
                    setShowHeader(rect.y > 0);
                if (forceHeaderRef.current) {
                    const oldY = sentinelPositionRef.current;
                    const newY = rect.y;
                    if (Math.abs(oldY - newY) > 10)
                        setForceHeader(false);
                }
            }
        }
    }
    useEffect(() => {
        if (forceHeader && sentinelRef.current) {
            const rect = sentinelRef.current.getBoundingClientRect();
            if (rect)
                sentinelPositionRef.current = rect.y;
        }
        forceHeaderRef.current = forceHeader;
    }, [forceHeader])

    useEffect(() => {
        window.addEventListener('scroll', () => {
            checkForcedHeader();
        })
        // eslint-disable-next-line
    }, []);


    // Data fetching and transformation logic
    useEffect(() => {
        let abilityOptions = [];
        const transformedMiscrits = miscritsData.map(m => {
            let miscritUltBuffs = [];
            const { id, element, rarity, names, abilities: rawAbilities } = m;
            let buffs = [];
            let maxAP = 0;
            let indexLevelMap = { 0: 1, 1: 1, 2: 4, 3: 7, 4: 10, 5: 13, 6: 16, 7: 19, 8: 22, 9: 25, 10: 28, 11: 30 }
            const abilities = m.ability_order.map((i, idx) => {
                const ability = rawAbilities.find(a => a.id === i);
                if (!ability) return null;
                const unlockedAt = indexLevelMap[idx];

                const numOfTurns = (ability?.times || 1) + (ability?.enchant?.times || 0);
                const ap = (ability.ap + (ability?.enchant?.ap || 0)) * numOfTurns;
                if (ability.type === 'Attack' && ap > maxAP) {
                    maxAP = ap;
                }

                let imgSrcName = (ability.type === 'Attack' ? ability.element : ability.type).toLowerCase();
                if (imgSrcName === 'buff' && ability.desc.includes('Lower')) imgSrcName = 'debuff';
                else if (imgSrcName === 'dot' && ability.element) imgSrcName = `${ability.element.toLowerCase()}_poison`
                else if (imgSrcName === 'hot') imgSrcName = 'heal';
                const imgSrc = `https://worldofmiscrits.com/${imgSrcName}.png`

                abilityOptions.push({
                    id: ability.id,
                    name: ability.name,
                    ultimate: unlockedAt > 27 && ap > 29,
                    type: ability.type,
                    element: ability.element
                });

                if (ability.type && ability.type !== 'Attack' && ability.type !== 'Buff') {
                    buffs.push(ability.type);
                }

                if (ability.additional?.length) {
                    ability.additional.forEach(a => {
                        if (a.type && a.type !== 'Attack' && a.type !== 'Buff') {
                            buffs.push(a.type);
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
                    imgSrc,
                };
            }).filter(Boolean).reverse();

            const images = names.map(n => `https://cdn.worldofmiscrits.com/miscrits/${n.split(' ').join('_').toLowerCase()}_back.png`);

            const locations = [];
            Object.entries(m.locations).forEach(([loc, data]) => {
                const areas = Object.keys(data);
                const days = [];
                Object.values(data).forEach(a => {
                    a.forEach(day => days.push(dayMap[day]))
                })
                locations.push({
                    location: loc,
                    areas, days
                })
            })
            if (!locations.length) locations.push({
                location: 'Shop', days: [], areas: []
            });

            let offset = rarityValues[rarity] > 2 ? maxAP > 35 ? 5 : 2 : 0;
            const ultimates = abilities.filter(a => a.type === 'Attack' && (a.unlockedAt === 30 || a.ap >= (maxAP - offset)))
            ultimates.forEach(ult => {
                if (ult.additional?.length) {
                    ult.additional.forEach(a => {
                        if (a.type) {
                            const formattedBuffs = extractBuffs(a, ult.desc);
                            if (Array.isArray(formattedBuffs)) {
                                formattedBuffs.map(fb => miscritUltBuffs.push(fb))
                            } else {
                                miscritUltBuffs.push(formattedBuffs);
                            }
                        }
                    })
                }
            })

            return {
                id, name: m.names[0], element, rarity, names, images,
                hp: m.hp, spd: m.spd, ea: m.ea, pa: m.pa, ed: m.ed, pd: m.pd,
                abilities,
                locations,
                buffs: [...new Set(buffs)],
                ultBuffs: miscritUltBuffs, maxAP, ultimates,
            };
        });

        setAllMiscrits(transformedMiscrits);

        // Populate filters
        const allElements = new Set(transformedMiscrits.map(m => m.element));
        const allRarities = new Set(transformedMiscrits.map(m => m.rarity));
        setElements([...Array.from(allElements), 'Dual']);
        setRarities(Array.from(allRarities));

        const allLocations = new Set(transformedMiscrits.flatMap(m => m.locations || []).map(l => l.location));
        setLocations(['All', ...Array.from(allLocations).sort()]);

        const allBuffs = new Set(transformedMiscrits.flatMap(m => m.buffs));
        setAvailableBuffs(Array.from(allBuffs).sort());

        const allUltBuffs = new Set(transformedMiscrits.flatMap(m => m.ultBuffs));
        setAvailableUltBuffs(Array.from(allUltBuffs).sort());

        const allAbilities = removeDuplicates(abilityOptions, 'id');
        setAvailableAbilities(allAbilities.sort((a, b) => b.name - a.name));

        // Set loading to false after initial data load
        setIsLoading(false);
    }, []);


    useEffect(() => {
        setCurrentStatFilters(Object.entries(statFilters).filter(([k, v]) => v > 1).map(([k, v]) => `${k}: ${v}`).join(', '));
    }, [statFilters])

    useEffect(() => {
        resetStatFilters();
        // eslint-disable-next-line
    }, [exactStats])

    const resetStatFilters = () => {
        const resetTo = exactStats ? 0 : 1;
        setStatFilters({
            hp: resetTo, spd: resetTo, ea: resetTo, pa: resetTo, ed: resetTo, pd: resetTo,
        })
    }

    const handleStatFilterChange = (stat, value) => {
        setStatFilters(prevFilters => ({
            ...prevFilters,
            [stat]: value,
        }));
    };

    const handleAbilityFilterChange = (filters) => {
        setAbilityFilters(filters);
        toggleAbilityFilter(false);
        setShowFilters(false);
    }

    const handleEvoChange = (evo) => {
        setSelectedEvo(evo);
    };

    const handleMultiSelect = (value, type) => {
        if (type === 'rarity')
            setSelectedRarities(prevRarities => {
                if (prevRarities.includes(value)) {
                    return prevRarities.filter(item => item !== value);
                } else {
                    return [...prevRarities, value];
                }
            })
        else if (type === 'buff')
            setSelectedBuffs(prevBuffs => {
                if (prevBuffs.includes(value)) {
                    return prevBuffs.filter(item => item !== value);
                } else {
                    return [...prevBuffs, value];
                }
            });
        else if (type === 'element')
            setSelectedElements(prevElements => {
                if (prevElements.includes(value)) {
                    return prevElements.filter(item => item !== value);
                } else {
                    return [...prevElements, value];
                }
            });
    };


    const resetFilters = () => {
        setSelectedElements([])
        setSelectedRarities([]);
        setCurrentLocationFilter('All')
        setCurrentDayFilter('All')
        setCurrentSortOrder('id')
        setSearchTerm('')
        setAbilityFilters({ apply: false });
        setSelectedBuffs([])
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
        let abilityMatch = true; let ultBuffMatch = true; let ultTypeMatch = true;
        if (abilityFilters.apply) {
            const { name, text, type, element, ultBuff, ultType, maxLevel, matchExact } = abilityFilters;
            const searchString = text ? text.toLowerCase() : text;
            const textMatch = ability => text ? ability.desc.toLowerCase().includes(searchString) : true;
            const nameMatch = ability => name ? ability.name === name : true;
            const typeMatch = ability => type ? ability.type === type : true;
            const elementMatch = ability => element ? ability.element === element : true;
            const abilitiesToCheck = maxLevel ?
                matchExact ? miscrit.abilities.filter(a => a.unlockedAt === maxLevel) :
                    miscrit.abilities.filter(a => a.unlockedAt <= maxLevel) : miscrit.abilities;
            abilityMatch = abilitiesToCheck.some(a => nameMatch(a) && typeMatch(a) && elementMatch(a) && textMatch(a));
            ultBuffMatch = ultBuff ? miscrit.ultBuffs.some(ult => ult?.includes(ultBuff)) : true;
            ultTypeMatch = ultType ? miscrit.ultimates.some(ult => ultType === 'Elemental' ? ult.element !== 'Physical' : ult.element === ultType) : true;
        }
        const miscritElements = miscrit.element.split(/(?=[A-Z])/).filter(Boolean);
        let elementMatch = selectedElements.length === 0 || miscritElements.some(ele => selectedElements.includes(ele));
        if (selectedElements.includes('Dual')) elementMatch = miscritElements.length === 2;
        const rarityMatch = selectedRarities.length === 0 || selectedRarities.includes(miscrit.rarity);
        const locationMatch = currentLocationFilter === 'All' || miscrit.locations?.some(l => l.location === currentLocationFilter);
        const dayMatch = currentDayFilter === 'All' ||
            (currentDayFilter === 'Everyday' && miscrit.locations?.some(l => l.days?.length === 0)) ||
            miscrit.locations?.some(l => l.days?.includes(currentDayFilter));
        const statMatch = Object.keys(statFilters).every(statKey => {
            return exactStats ? (statFilters[statKey] ? statValues[miscrit[statKey]] === statFilters[statKey] : true) : statValues[miscrit[statKey]] >= statFilters[statKey];
        });
        const buffsMatch = selectedBuffs.length === 0 || selectedBuffs.every(buff => miscrit.buffs.includes(buff));

        return nameMatch && abilityMatch && ultBuffMatch && ultTypeMatch
            && elementMatch && rarityMatch && locationMatch && dayMatch && statMatch && buffsMatch;
    });



    return (
        <ToastProvider>
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

                <header className="sticky-header sticky top-2 z-10 p-4 mb-4">
                    {showHeader || forceHeader ? (<div className={`flex flex-col justify-center items-center gap-2 space-y-4 sm:space-y-0 sm:space-x-8 max-w-8xl mx-auto bg-gray-900/90 rounded-xl p-4 shadow-lg border-2 border-gray-500`}>
                        <div className="flex items-center justify-center sm:justify-start gap-4">
                            <button className="absolute left-10 text-white" onClick={toggleSidebar}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <img src={MiscritLogo} alt="Miscrits" className="h-[4rem]" />
                            <h1 className="hidden md:block text-3xl md:text-[2rem] font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-lime-200 to-lime-600 drop-shadow-md header-font">
                                Critdex
                            </h1>
                        </div>
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
                                <div className="flex flex-col sm:flex-row justify-between items-start flex-wrap gap-y-4 m-0 w-full sm:max-w-7xl mx-auto rounded-xl p-2 transition-all duration-500 ease-in-out">

                                    <div className="relative flex flex-row items-center space-x-2 basis-1/4">
                                        <span className="text-gray-400 font-semibold text-sm">Element:</span>
                                        <div className="relative flex space-x-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleElementFilter(!showElementFilter)}
                                                className="bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
                                            >
                                                <span className="truncate">
                                                    {selectedElements.length > 0 ? selectedElements.join(', ') : ''}
                                                </span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`w-4 h-4 transition-transform duration-200 ${showBuffsFilter ? 'rotate-180' : ''} bi bi-chevron-down`} viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                                                </svg>
                                            </button>
                                            {selectedElements.length > 0 && <button
                                                onClick={() => setSelectedElements([])}
                                                className="bg-red-500 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                                </svg>
                                            </button>}
                                            {showElementFilter && (
                                                <div className="absolute z-20 top-5 w-48 mt-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                    {elements.map(element => (
                                                        <div
                                                            key={element}
                                                            onClick={() => handleMultiSelect(element, 'element')}
                                                            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-700 transition duration-150"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                readOnly
                                                                checked={selectedElements.includes(element)}
                                                                className="form-checkbox text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-400"
                                                            />
                                                            <img
                                                                src={`https://worldofmiscrits.com/${(element === 'Dual' ? 'WaterEarth' : element).toLowerCase()}.png`}
                                                                alt={`${element}`}
                                                                className="w-5 h-5 rounded-full"
                                                            />
                                                            <span className="text-gray-200 text-sm">{element}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative flex flex-row items-center space-x-2 basis-1/4">
                                        <span className="text-gray-400 font-semibold text-sm">Rarity:</span>
                                        <div className="relative flex space-x-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleRarityFilter(!showRarityFilter)}
                                                className="bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
                                            >
                                                <span className="truncate">
                                                    {selectedRarities.length > 0 ? selectedRarities.join(', ') : ''}
                                                </span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`w-4 h-4 transition-transform duration-200 ${showBuffsFilter ? 'rotate-180' : ''} bi bi-chevron-down`} viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                                                </svg>
                                            </button>
                                            {selectedRarities.length > 0 && <button
                                                onClick={() => setSelectedRarities([])}
                                                className="bg-red-500 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                                </svg>
                                            </button>}
                                            {showRarityFilter && (
                                                <div className="absolute z-20 top-5 w-48 mt-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                    {rarities.map(rarity => (
                                                        <div
                                                            key={rarity}
                                                            onClick={() => handleMultiSelect(rarity, 'rarity')}
                                                            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-700 transition duration-150"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                readOnly
                                                                checked={selectedRarities.includes(rarity)}
                                                                className="form-checkbox text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-400"
                                                            />
                                                            <span className="text-gray-200 text-sm">{rarity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
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
                                        <span className="text-gray-400 font-semibold text-sm">Days:</span>
                                        <select
                                            id="day-select"
                                            value={currentDayFilter}
                                            onChange={(e) => setCurrentDayFilter(e.target.value)}
                                            className="bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option key={'All'} value={'All'}>All</option>
                                            {days.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                            <option key={'Everyday'} value={'Everyday'}>Everyday</option>
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
                                        <div className="relative flex space-x-4">
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
                                            {selectedBuffs.length > 0 && <button
                                                onClick={() => setSelectedBuffs([])}
                                                className="bg-red-500 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                                </svg>
                                            </button>}
                                            {showBuffsFilter && (
                                                <div className="absolute z-20 top-5 w-48 mt-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                    {availableBuffs.map(buff => (
                                                        <div
                                                            key={buff}
                                                            onClick={() => handleMultiSelect(buff, 'buff')}
                                                            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-700 transition duration-150"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                readOnly
                                                                checked={selectedBuffs.includes(buff)}
                                                                className="form-checkbox text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-400"
                                                            />
                                                            <span className="text-gray-200 text-sm">{buff}</span>
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
                                                className="flex items-center text-white space-x-2 bg-gray-700 px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <span className="truncate">
                                                    {currentStatFilters}
                                                </span>
                                                <svg className={`w-4 h-4 transition-transform duration-200 ${showStatFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </button>
                                            {currentStatFilters && <button
                                                onClick={() => resetStatFilters()}
                                                className="flex items-center text-white space-x-2 bg-red-500 px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                                </svg>
                                            </button>}
                                        </div>
                                        {showStatFilter && (
                                            <div className="absolute top-full mt-2 w-64 p-4 rounded-xl shadow-lg bg-gray-800 z-20 transition-opacity duration-300">
                                                <div className="w-full flex justify-between items-center">
                                                    <h3 className="text-sm font-semibold text-gray-400 mb-2">{`${exactStats ? '' : 'Minimum '}Stat Values:`}</h3>
                                                    <div className="flex items-center space-x-2">
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                value=""
                                                                className="sr-only peer"
                                                                checked={exactStats}
                                                                onChange={e => toggleExactStats(e.target.checked)}
                                                            />
                                                            <div className="w-11 h-5 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                </div>
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
                                        <span className="text-gray-400 font-semibold text-sm">Show Evolution:</span>
                                        <NumberSelector onSelect={(evo) => handleEvoChange(evo)} initialValue={selectedEvo} />
                                    </div>
                                </div>
                                {abilityFilters.apply && <div className='w-[90%] flex items-center justify-start gap-4 px-3'>
                                    <p className="text-gray-400 font-semibold text-sm">Ability filters</p>
                                    {abilityFilters.name && <div className='flex items-center justify-between gap-1'>
                                        <p className="text-gray-400 font-semibold text-sm">Name:</p>
                                        <p className="text-gray-400 text-sm">{abilityFilters.name}</p>
                                    </div>}
                                    {abilityFilters.text && <div className='flex items-center justify-between gap-1'>
                                        <p className="text-gray-400 font-semibold text-sm">Description:</p>
                                        <p className="text-gray-400 text-sm">{abilityFilters.text}</p>
                                    </div>}
                                    {abilityFilters.type && <div className='flex items-center justify-between gap-1'>
                                        <p className="text-gray-400 font-semibold text-sm">Type:</p>
                                        <p className="text-gray-400 text-sm">{abilityFilters.type}</p>
                                    </div>}
                                    {abilityFilters.element && <div className='flex items-center justify-between gap-1'>
                                        <p className="text-gray-400 font-semibold text-sm">Element:</p>
                                        <p className="text-gray-400 text-sm">{abilityFilters.element}</p>
                                    </div>}
                                    {abilityFilters.maxLevel && abilityFilters.maxLevel < 30 && <div className='flex items-center justify-between gap-1'>
                                        <p className="text-gray-400 font-semibold text-sm">Max Level:</p>
                                        <p className="text-gray-400 text-sm">{abilityFilters.maxLevel}</p>
                                    </div>}
                                    {abilityFilters.ultType && <div className='flex items-center justify-between gap-1'>
                                        <p className="text-gray-400 font-semibold text-sm">Ultimate type:</p>
                                        <p className="text-gray-400 text-sm">{abilityFilters.ultType}</p>
                                    </div>}
                                    {abilityFilters.ultBuff && <div className='flex items-center justify-between gap-1'>
                                        <p className="text-gray-400 font-semibold text-sm">Ultimate buff:</p>
                                        <p className="text-gray-400 text-sm">{abilityFilters.ultBuff.replace(/<|>/g, '')}</p>
                                    </div>}
                                </div>}
                                <div className="flex flex-row items-center justify-end gap-2 m-0 space-x-0 sm:space-x-4 w-[95%]">
                                    <button
                                        onClick={() => toggleAbilityFilter(true)}
                                        className="bg-slate-300 border-3 border-lime-800 px-1 py-1 text-lime-950 text-sm rounded-full font-semibold hover:bg-teal-600 transition-colors duration-200"
                                    >
                                        Filter by Abilities
                                    </button>
                                    <button
                                        onClick={resetFilters}
                                        className="bg-red-800 text-white text-sm px-3 py-1 rounded-full font-semibold hover:bg-red-700 transition-colors duration-200"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </>
                        )}
                    </div>) : (<div className={`flex justify-center items-center gap-2 space-y-4 sm:space-y-0  mx-auto bg-gray-900/90 rounded-xl p-4 shadow-lg border-2 border-gray-500 w-fit`} onClick={() => setForceHeader(true)}>
                        <img src={MiscritLogo} alt="Miscrits" className="h-[2rem]" />
                    </div>)}
                </header>
                <main className="max-w-8xl mx-auto p-7 pt-0">
                    <div ref={sentinelRef} className="h-px w-full"></div>
                    <div id="miscrit-container" className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
                        {filteredMiscrits.map(miscrit => (
                            <MiscritCard
                                key={miscrit.id}
                                miscrit={miscrit}
                                showEvolution={selectedEvo}
                                onClick={() => setExpandedMiscritId(miscrit.id)}
                                onBuffClick={buff => handleMultiSelect(buff, 'buff')}
                                selectedBuffs={selectedBuffs}
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
                    <AbilityFilterDialog
                        filters={abilityFilters}
                        abilities={availableAbilities} onClose={handleAbilityFilterChange}
                        ultBuffs={availableUltBuffs}
                    />
                )}
            </div>
        </ToastProvider>
    );
};

export default MiscripediaPage;

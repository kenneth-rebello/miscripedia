import React, { useState, useEffect, useRef } from 'react';
import NewRelicSetDialog from '../components/NewRelicSetDialog';

import relicData from '../data/relics.json';
import MiscritsLogo from '../data/MiscritsLogo.png';

const RelicsPage = ({ toggleSidebar }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const allRelics = [...relicData];
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [minStats, setMinStats] = useState({
        hp: 0, ed: 0, pd: 0, ea: 0, pa: 0, s: 0
    });
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [generatedRelicSets, setGeneratedRelicSets] = useState([]);
    const [targetStats, setTargetStats] = useState({});
    const [expandSuggestedRelics, toggleSuggestedRelics] = useState(true);

    // State for the new custom relic set
    const initialCustomSet = { '10': null, '20': null, '30': null, '35': null };
    const [customRelicSet, setCustomRelicSet] = useState(initialCustomSet);
    const [customSetBuffs, setCustomSetBuffs] = useState({});
    const [expandCustomRelics, toggleCustomRelics] = useState(true);
    const customRef = useRef(null);

    const filteredRelics = allRelics.filter(relic => {
        const matchesSearch = relic.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesMinStats = Object.keys(minStats).every(stat =>
            minStats[stat] > 0 ? relic.stats[stat] ? relic.stats[stat] >= minStats[stat] : false : true
        );

        // Filter by selected level
        const matchesLevel = selectedLevel ? relic.level === selectedLevel : true;

        return matchesSearch && matchesMinStats && matchesLevel;
    });

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

    useEffect(() => {
        const newBuffs = {};
        Object.values(customRelicSet).forEach(relic => {
            if (relic) {
                Object.keys(relic.stats).forEach(stat => {
                    newBuffs[stat] = (newBuffs[stat] || 0) + relic.stats[stat];
                });
            }
        });
        setCustomSetBuffs(newBuffs);
    }, [customRelicSet]);

    const handleRelicGeneratorClosed = (result) => {
        setIsModalOpen(false);
        if (result && result.relics) {
            setGeneratedRelicSets(result.relics);
            setTargetStats(result.stats);
        }
    }

    const clearGeneratedSets = () => {
        setGeneratedRelicSets([]);
        setTargetStats({});
    }

    const addRelicToCustomSet = (relic) => {
        const newCustomSet = { ...customRelicSet, [relic.level]: relic };
        setCustomRelicSet(newCustomSet);
    };

    const removeRelicFromCustomSet = (relic) => {
        const existing = customRelicSet[relic.level];
        if (existing && existing.name === relic.name) {
            const newCustomSet = { ...customRelicSet }
            delete newCustomSet[relic.level];
            setCustomRelicSet(newCustomSet);
        }
    }

    useEffect(() => {
        if(expandCustomRelics && customRef.current)
            customRef.current.scrollIntoView();
    }, [expandCustomRelics])

    const handleEditSet = (relicSet) => {
        toggleSuggestedRelics(false);
        const newCustomSet = { '10': null, '20': null, '30': null, '35': null };
        relicSet.relics.forEach(relic => {
            if (relic.level) {
                newCustomSet[relic.level] = relic;
            }
        });
        toggleSuggestedRelics(false);
        setCustomRelicSet(newCustomSet);
        toggleCustomRelics(true);
    };

    const clearCustomSet = () => {
        setCustomRelicSet(initialCustomSet);
    };

    const statsList = ['hp', 'ed', 'pd', 'ea', 'pa', 's'];
    const levelsList = [10, 20, 30, 35];

    return (
        <div className="bg-slate-900 min-h-screen p-4">
            <header className="sticky top-2 z-10 mb-4">
                {showHeader || forceHeader ? (<div className={`flex flex-col justify-center items-center sm:space-y-0 sm:space-x-8 max-w-8xl mx-auto bg-gray-900/90 rounded-xl p-4 shadow-lg border-2 border-gray-500`}>
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                        <button className="absolute left-5 text-white" onClick={toggleSidebar}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <img src={MiscritsLogo} alt="Miscrits" className="h-[4rem]" />
                        <h1 className="hidden md:block text-3xl md:text-[2rem] font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-lime-200 to-lime-600 drop-shadow-md">
                            Critdex
                        </h1>
                    </div>
                    <div className="flex flex-row items-center space-x-0 sm:space-x-2 w-[95%] justify-between gap-3">
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
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-2 sm:mt-0 text-gray-200 text-sm px-4 py-2 rounded-full font-semibold border-2 border-gray-700 hover:bg-gray-700 transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-collection" viewBox="0 0 16 16">
                                <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6zm1.5.5A.5.5 0 0 1 1 13V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5z" />
                            </svg>
                        </button>
                    </div>
                    {showFilters && (
                        <div className="p-4 w-[95%] m-0">
                            <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-4">
                                {statsList.map(stat => (
                                    <div key={stat} className="flex items-center justify-start space-x-2 basis-1/4 sm:basis-1/4">
                                        <label htmlFor={`${stat}-slider`} className="text-sm font-semibold text-gray-300 capitalize mb-1">{stat.toUpperCase()}</label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                id={`${stat}-slider`}
                                                type="range"
                                                min="0"
                                                max="30"
                                                value={minStats[stat]}
                                                onChange={(e) => setMinStats({ ...minStats, [stat]: parseInt(e.target.value, 10) })}
                                                className="h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                            />
                                            {minStats[stat] > 0 ? <span className="text-sm text-white font-semibold w-6">{minStats[stat]}</span> : <span className='w-6'></span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold text-gray-300">Level:</span>
                                <div className="flex flex-wrap gap-2">
                                    {levelsList.map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                                            className={`px-3 py-0.5 rounded-full text-sm font-semibold transition-colors duration-200 ${selectedLevel === level
                                                ? 'bg-lime-500 text-gray-900 border-2 border-lime-500'
                                                : 'bg-gray-700 text-gray-200 border-2 border-gray-600 hover:bg-gray-600'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>) : (<div className={`flex justify-center items-center gap-2 space-y-4 sm:space-y-0  mx-auto bg-gray-900/90 rounded-xl p-4 shadow-lg border-2 border-gray-500 w-fit`} onClick={() => setForceHeader(true)}>
                    <img src={MiscritsLogo} alt="Miscrits" className="h-[2rem]" />
                </div>)}
            </header>

            {generatedRelicSets.length > 0 && (
                <div className="max-w-7xl mx-auto my-6 p-6 rounded-lg bg-gray-900 border-2 border-gray-700 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-lime-400">Suggested Relic Sets</h2>
                        <div className='flex items-center gap-4'>
                            <button onClick={clearGeneratedSets} className="text-gray-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <button onClick={() => toggleSuggestedRelics(!expandSuggestedRelics)} className="text-gray-400 hover:text-white transition-colors">
                                {expandSuggestedRelics ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-up" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z" />
                                </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                                </svg>}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center mb-6 p-4 rounded-lg bg-gray-800 border border-gray-700">
                        <h3 className="text-md font-bold text-gray-300">Target Buffs</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            {targetStats.filter(stat => stat.value > 0).map(stat => (
                                <div key={stat.label} className="flex items-center gap-1">
                                    <span className="uppercase">{stat.label}:</span>
                                    <span className="font-bold text-lime-400">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {expandSuggestedRelics && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {generatedRelicSets.map(set => (
                            <div key={set.id} className="bg-gray-800 rounded-md p-4 shadow-lg border-2 border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex flex-wrap gap-2 text-sm text-gray-300">
                                        {Object.keys(set.buffs).filter(stat => set.buffs[stat] > 0).map(stat => (
                                            <div key={stat} className="flex items-center gap-1">
                                                <span className="text-slate-400 uppercase">{stat}:</span>
                                                <span className="font-bold text-lime-400">{set.buffs[stat]}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => handleEditSet(set)} className="text-lime-400 hover:text-lime-500 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {set.relics.map(relic => (
                                        <div key={relic.name} className="flex flex-col p-2 rounded bg-gray-700 border border-gray-600">
                                            <h5 className="text-md text-gray-200 font-semibold">{relic.name}</h5>
                                            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                                                {Object.keys(relic.stats).map(stat => (
                                                    <span key={stat} className="uppercase">{stat}: {relic.stats[stat]}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>}
                </div>
            )}

            {Object.values(customRelicSet).some(relic => relic !== null) && (
                <div className="max-w-7xl mx-auto my-6 p-6 rounded-lg bg-gray-900 border-2 border-gray-700 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-lime-400">Custom Relic Set</h2>
                        <div className='flex gap-4 items-center'>
                            <button onClick={clearCustomSet} className="text-gray-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <button onClick={() => toggleCustomRelics(!expandCustomRelics)} className="text-gray-400 hover:text-white transition-colors">
                                {expandCustomRelics ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-up" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z" />
                                </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                                </svg>}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center mb-6 p-4 rounded-lg bg-gray-800 border border-gray-700">
                        <h3 className="text-md font-bold text-gray-300">Total Buffs</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            {Object.keys(customSetBuffs).filter(stat => customSetBuffs[stat] > 0).map(stat => (
                                <div key={stat} className="flex items-center gap-1">
                                    <span className="uppercase">{stat}:</span>
                                    <span className="font-bold text-lime-400">{customSetBuffs[stat]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {expandCustomRelics && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {levelsList.map(level => {
                            const relic = customRelicSet[level];
                            if (relic) {
                                return (
                                    <div key={relic.name} className="flex flex-col justify-between bg-gray-800 rounded-md p-3 shadow-lg border-2 border-gray-700">
                                        <div className="flex justify-between items-center space-x-2 mb-4">
                                            <h3 className="text-xl font-bold text-lime-500">{relic.name}</h3>
                                            <div className="flex items-center space-x-2">
                                                <span className="px-2 bg-lime-500 text-gray-900 text-sm font-bold rounded-full">{relic.level}</span>
                                                <button onClick={() => removeRelicFromCustomSet(relic)} className="text-white hover:text-lime-500 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash-circle" viewBox="0 0 16 16">
                                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                        <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div ref={customRef} className="h-px w-full"></div>
                                        <div className="flex items-center gap-4 text-sm text-gray-300">
                                            {Object.keys(relic.stats).map(stat => (
                                                <div key={stat} className="flex items-center gap-1">
                                                    <span className="uppercase">{stat}:{` `}</span>
                                                    <span className="font-bold text-white">{relic.stats[stat]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={level} className="flex flex-col items-center justify-center bg-gray-800 rounded-md p-3 shadow-lg border-2 border-gray-700 text-gray-500">
                                        <div className="text-center">
                                            <p>Empty Slot</p>
                                            <p className="text-sm">Level {level} Relic</p>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>}
                </div>
            )}


            <div className="max-w-7xl mx-auto">
                <div ref={sentinelRef} className="h-px w-full"></div>
                {filteredRelics.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredRelics.map(relic => (
                            <div key={relic.name} className="flex flex-col justify-between bg-gray-800 rounded-md p-3 shadow-lg border-2 border-gray-700 transition-transform transform hover:scale-105">
                                <div className="flex justify-between items-center space-x-2 mb-4">
                                    <h3 className="text-xl font-bold text-lime-500">{relic.name}</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2 bg-lime-500 text-gray-900 text-sm font-bold rounded-full">{relic.level}</span>
                                        <button onClick={() => addRelicToCustomSet(relic)} className="text-white hover:text-lime-500 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-300">
                                    {Object.keys(relic.stats).map(stat => (
                                        <div key={stat} className="flex items-center gap-1">
                                            <span className="uppercase">{stat}:{` `}</span>
                                            <span className="font-bold text-white">{relic.stats[stat]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-400 text-xl mt-12">No relics found with the current filters.</div>
                )}
            </div>
            <NewRelicSetDialog isOpen={isModalOpen} onClose={(sets) => handleRelicGeneratorClosed(sets)} />
        </div>
    );
};

export default RelicsPage;

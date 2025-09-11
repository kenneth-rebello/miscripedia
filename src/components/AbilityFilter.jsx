import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../services/toast.service.js';

const AbilityFilterDialog = ({ filters, abilities, ultBuffs, onClose }) => {
    const [selectedAbility, setSelectedAbility] = useState(filters.name);
    const [abilitySearchTerm, setAbilitySearchTerm] = useState(filters.text);
    const [abilityOptions, setAbilityOptions] = useState([]);

    const [ultimateFilter, setUltimateFilter] = useState('all');
    const [selectedType, setSelectedType] = useState('');
    const [selectedElement, setSelectedElement] = useState('');
    const [availableTypes, setAvailableTypes] = useState([]);
    const [availableElements, setAvailableElements] = useState([]);

    const [selectedLabel, setSelectedLabel] = useState('');
    const [selectedStat, setSelectedStat] = useState('');
    const [selectedAp, setSelectedAp] = useState('');
    const [selectedTurns, setSelectedTurns] = useState('');
    const [selectedUltBuff, setSelectedUltBuff] = useState('');
    const [selectedUltType, setSelectedUltType] = useState('');
    const [statOptions, setStatOptions] = useState([]);
    const [apOptions, setApOptions] = useState([]);
    const [turnsOptions, setTurnsOptions] = useState([]);
    const [maxLevel, setMaxLevel] = useState(filters.maxLevel || 30);

    const { showToast } = useToast();

    const uniqueLabels = useMemo(() => {
        if (ultBuffs?.length) {
            const labels = new Set();
            ultBuffs.filter(Boolean).forEach(item => {
                const label = item.split(' [')[0].split(' (x')[0].split(' +')[0].split(' <')[0];
                labels.add(label.trim());
            });
            return Array.from(labels).sort();
        }
        return [];
    }, [ultBuffs]);

    useEffect(() => {
        const corrections = {
            1: 1, 2: 1, 3: 1, 4: 4, 5: 4, 6: 4, 7: 7, 8: 7, 9: 7, 10: 10, 11: 10, 12: 10, 13: 13, 14: 13, 15: 13,
            16: 16, 17: 16, 18: 16, 19: 19, 20: 19, 21: 19, 22: 22, 23: 22, 24: 22, 25: 25, 26: 25, 27: 25, 28: 28, 29: 28, 30: 30
        }
        const valid = [...new Set(Object.values(corrections))];
        if (!valid.includes(maxLevel)) {
            setMaxLevel(corrections[maxLevel])
        }
    }, [maxLevel])


    useEffect(() => {
        if (abilities) {
            const types = [];
            const elements = [];
            abilities.forEach(a => {
                types.push(a.type);
                if (a.element !== 'Misc') elements.push(a.element);
            });
            setAvailableTypes([...new Set(types)]);
            setAvailableElements([...new Set(elements)]);
        }
    }, [abilities])


    useEffect(() => {
        if (abilities) {
            setSelectedAbility('')
            let opts = abilities.filter(a => a.name !== a.type);
            if (ultimateFilter !== 'all') opts = opts.filter(a => a.ultimate === (ultimateFilter === 'ultimates'));
            if (selectedElement) opts = opts.filter(o => o.element === selectedElement)
            if (selectedType) opts = opts.filter(o => o.type === selectedType)
            setAbilityOptions(opts);
        }
    }, [abilities, ultimateFilter, selectedElement, selectedType])


    useEffect(() => {
        // Reset selections and options when the label changes
        setSelectedAp('');
        setSelectedTurns('');
        setSelectedStat('');
        if (!selectedLabel) {
            setApOptions([]);
            setTurnsOptions([]);
            setStatOptions([]);
            return;
        }

        const filteredItems = ultBuffs.filter(item => item && item.startsWith(selectedLabel));
        const apValues = new Set();
        const turnsValues = new Set();
        const statValues = new Set();

        filteredItems.forEach(item => {
            const apMatch = item.match(/\[(\d+)\]/);
            if (apMatch) {
                apValues.add(apMatch[1]);
            }
            const turnsMatch = item.match(/\(x(\d+)\)/);
            if (turnsMatch) {
                turnsValues.add(turnsMatch[1]);
            }
            const statMatch = item.match(/<(.*?)>/);
            if (statMatch) {
                statValues.add(statMatch[1]);
            }
        });

        const sortedAp = Array.from(apValues).sort((a, b) => a - b);
        const sortedTurns = Array.from(turnsValues).sort((a, b) => a - b);
        const sortedStats = Array.from(statValues).sort((a, b) => a - b);

        setApOptions(sortedAp);
        setTurnsOptions(sortedTurns);
        setStatOptions(sortedStats);
    }, [selectedLabel, ultBuffs]);

    const combinedString = useMemo(() => {
        if (!selectedLabel) return '';
        let result = selectedLabel;
        if (selectedStat) {
            result += ` <${selectedStat}>`
        }
        if (selectedAp) {
            result += ` [${selectedAp}]`;
        }
        if (selectedTurns) {
            result += ` (x${selectedTurns})`;
        }
        return result.trim();
    }, [selectedLabel, selectedStat, selectedAp, selectedTurns]);

    // Handlers
    const handleCancel = () => {
        onClose({
            apply: filters.apply,
            name: filters.name,
            text: filters.text,
            type: filters.type,
            element: filters.element,
            ultBuff: filters.ultBuff,
            ultType: filters.ultType,
            maxLevel: filters.maxLevel
        });
    }

    const handleClear = () => {
        setSelectedAbility('');
        setAbilitySearchTerm('');
        setSelectedType('');
        setSelectedElement('');
        setSelectedUltBuff('');
        setSelectedUltType('');
        setMaxLevel(30);
    }

    const handleApplyFilter = () => {
        if(maxLevel < 30) {
            const atLeastOne = [selectedAbility, abilitySearchTerm, selectedType, selectedElement, selectedUltBuff, selectedUltType].some(Boolean);
            if(!atLeastOne) {
                showToast('Select at least one ability filter when Max Level < 30');
                return;
            }
        }
        onClose({
            apply: true,
            name: selectedAbility,
            text: abilitySearchTerm,
            type: selectedType,
            element: selectedElement,
            ultBuff: selectedUltBuff,
            ultType: selectedUltType,
            maxLevel: maxLevel
        });
    };

    // Update ability search term when combined string changes
    useEffect(() => {
        if (combinedString) {
            setSelectedUltBuff(combinedString);
        }
    }, [combinedString]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 transition-opacity duration-300">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 w-11/12 md:w-1/2 lg:w-1/3 border-2 border-gray-700 relative">
                <button
                    onClick={handleCancel}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                    </svg>
                </button>
                <h3 className="text-lg font-bold text-center text-gray-100 mb-4">Filter Miscrits by abilities</h3>
                <div className="flex flex-col gap-2">

                    <div>
                        <div className="flex w-full items-center justify-between">
                            <label htmlFor="ability-name" className="text-gray-300 text-sm mb-1">Ability Name</label>
                            <span className="text-xs text-slate-400">{abilityOptions?.length || 0} abilities</span>
                        </div>
                        <div className="flex flex-row items-center space-x-0 sm:space-x-4 w-[95%] justify-between gap-3">
                            <select
                                id="ability-name"
                                value={selectedAbility}
                                onChange={e => setSelectedAbility(e.target.value)}
                                className="w-full px-4 py-2 rounded-full border border-gray-700 bg-gray-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Abilities</option>
                                {abilityOptions.map(ability => (
                                    <option key={ability.name} value={ability.name}>{ability.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-start space-x-4 space-y-1 px-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="filter-options"
                                value="all"
                                checked={ultimateFilter === 'all'}
                                onChange={e => setUltimateFilter(e.target.value)}
                                className="form-radio bg-gray-700 checked:border-indigo-500 rounded-full"
                            />
                            <span className="text-white text-xs">All</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="filter-options"
                                value="ultimates"
                                checked={ultimateFilter === 'ultimates'}
                                onChange={e => setUltimateFilter(e.target.value)}
                                className="form-radio bg-gray-700 checked:border-indigo-500 rounded-full"
                            />
                            <span className="text-white text-xs">Only Ultimates</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="filter-options"
                                value="no-ultimates"
                                checked={ultimateFilter === 'no-ultimates'}
                                onChange={e => setUltimateFilter(e.target.value)}
                                className="form-radio bg-gray-700 checked:border-indigo-500 rounded-full"
                            />
                            <span className="text-white text-xs">No Ultimates</span>
                        </label>
                    </div>

                    <div className="flex flex-row gap-4 items-center justify-between">
                        <div className={`${selectedType === 'Attack' ? 'w-[45%]' : 'w-full'}`}>
                            <label htmlFor="ability-type" className="text-gray-300 text-xs mb-1">Ability Type</label>
                            <select
                                id="ability-type"
                                value={selectedType}
                                onChange={e => setSelectedType(e.target.value)}
                                className="w-full px-4 py-2 rounded-full border border-gray-700 bg-gray-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option key="" value="all">All Types</option>
                                {availableTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {selectedType === 'Attack' && (<div>
                            <label htmlFor="ability-element" className="text-gray-300 text-xs mb-1">Ability Element</label>
                            <select
                                id="ability-element"
                                value={selectedElement}
                                onChange={e => setSelectedElement(e.target.value)}
                                className="w-full px-4 py-2 rounded-full border border-gray-700 bg-gray-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option key="" value="all">All Elements</option>
                                {availableElements.map(element => (
                                    <option key={element} value={element}>{element}</option>
                                ))}
                            </select>
                        </div>)}
                    </div>

                    <div>
                        <label htmlFor="description-input" className="text-gray-300 text-sm mb-1">Ability Description</label>
                        <input
                            id="description-input"
                            type="text"
                            placeholder="Search by description..."
                            value={abilitySearchTerm}
                            onChange={e => setAbilitySearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-full border border-gray-700 bg-gray-800 text-white text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mt-1 px-2">
                        <label htmlFor="max-level" className="flex items-center justify-between text-gray-300">
                            <span className="text-xs">Max Miscrit Level</span>
                            <span className="text-white text-sm font-bold">{maxLevel}</span>
                        </label>
                        <input
                            id="max-level"
                            type="range"
                            min="1"
                            max="30"
                            value={maxLevel}
                            onChange={e => setMaxLevel(parseInt(e.target.value))}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4"
                        />
                    </div>

                    {maxLevel === 30 && <>
                        <div className='flex flex-col mt-4'>
                            <div className="flex items-center justify-between">
                                <p className="text-gray-300 text-sm mb-1">
                                    Ultimate Type
                                </p>
                            </div>
                            <div className="flex flex-row flex-wrap gap-2 mt-1">
                                <div>
                                    <select
                                        id="ultimate-type"
                                        value={selectedUltType}
                                        onChange={e => setSelectedUltType(e.target.value)}
                                        className="w-full px-4 py-2 rounded-full border border-gray-700 bg-gray-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option key="all" value="all">All</option>
                                        {['Elemental', ...availableElements].map(element => (
                                            <option key={element} value={element}>{element}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-300 text-sm mb-1">
                                    Ultimate Buffs
                                </p>
                                {selectedUltBuff && <p className='text-slate-100 text-xs'>
                                    {selectedUltBuff.replace(/<|>/g, '')}
                                </p>}
                            </div>
                            <div className="flex flex-row flex-wrap gap-2 mt-1">
                                <select
                                    value={selectedLabel}
                                    onChange={e => setSelectedLabel(e.target.value)}
                                    className="flex grow p-2 rounded-full border border-gray-700 bg-gray-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="" disabled>-- Label --</option>
                                    {uniqueLabels.map(label => (
                                        <option key={label} value={label}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedStat}
                                    onChange={e => setSelectedStat(e.target.value)}
                                    className="flex grow p-2 rounded-full border border-gray-700 bg-gray-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="" disabled>-- Stat --</option>
                                    {statOptions.map(stat => (
                                        <option key={stat} value={stat}>
                                            {stat}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedAp}
                                    onChange={e => setSelectedAp(e.target.value)}
                                    className="flex grow p-2 rounded-full border border-gray-700 bg-gray-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={apOptions.length === 0}
                                >
                                    <option value="">-- AP --</option>
                                    {apOptions.map(ap => (
                                        <option key={ap} value={ap}>
                                            {ap}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedTurns}
                                    onChange={e => setSelectedTurns(e.target.value)}
                                    className="flex grow-0 p-2 rounded-full border border-gray-700 bg-gray-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={turnsOptions.length === 0}
                                >
                                    <option value="">{turnsOptions.length === 0 ? '-- Turns --' : '-- Turns --'}</option>
                                    {turnsOptions.map(turns => (
                                        <option key={turns} value={turns}>
                                            x{turns}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </>}
                    <div className='w-full flex justify-between items-center mt-2'>
                        <button
                            onClick={handleClear}
                            className="w-[45%] bg-red-600 hover:bg-red-700 text-white text-[0.85rem] font-semibold py-1 px-2 rounded-full transition-colors duration-300"
                        >
                            Clear Filters
                        </button>
                        <button
                            onClick={handleApplyFilter}
                            className="w-[45%] bg-teal-800 hover:bg-teal-600 text-white text-[0.85rem] font-semibold py-1 px-2 rounded-full transition-colors duration-300"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AbilityFilterDialog;

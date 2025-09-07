import React, { useState, useEffect } from 'react';

const AbilityFilterDialog = ({ filters, abilities, onClose }) => {

    const [selectedAbility, setSelectedAbility] = useState(filters.name);
    const [abilitySearchTerm, setAbilitySearchTerm] = useState(filters.text);
    const [abilityOptions, setAbilityOptions] = useState([]);

    const [showFilters, toggleFilters] = useState(false);
    const [ultimateFilter, setUltimateFilter] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedElement, setSelectedElement] = useState('all');
    const [availableTypes, setAvailableTypes] = useState([]);
    const [availableElements, setAvailableElements] = useState([]);

    useEffect(() => {
        if (abilities) {
            const types = [];
            const elements = [];
            abilities.forEach(a => {
                types.push(a.type); elements.push(a.element);
            });
            setAvailableTypes([...new Set(types)]);
            setAvailableElements([...new Set(elements)]);
        }
    }, [abilities])

    useEffect(() => {
        if (abilities) {
            setSelectedAbility('')
            let opts = ultimateFilter === 'all' ? abilities : abilities.filter(a => a.ultimate === (ultimateFilter === 'ultimates'));
            if (selectedElement !== 'all') opts = opts.filter(o => o.element === selectedElement)
            if (selectedType !== 'all') opts = opts.filter(o => o.type === selectedType)
            setAbilityOptions(opts);
        }
    }, [abilities, ultimateFilter, selectedElement, selectedType])

    const handleCancel = () => {
        onClose({
            apply: filters.apply,
            name: selectedAbility,
            text: abilitySearchTerm
        });
    }

    const handleClear = () => {
        onClose({
            apply: false,
            name: '',
            text: ''
        });
    }

    const handleApplyFilter = () => {
        onClose({
            apply: true,
            name: selectedAbility,
            text: abilitySearchTerm
        });
    };

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
                <h3 className="text-xl font-bold text-center text-gray-100 mb-4">Search by Abilities</h3>
                <div className="flex flex-col gap-4">

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
                                className="w-full px-4 py-2 rounded-full border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Abilities</option>
                                {abilityOptions.map(ability => (
                                    <option key={ability.name} value={ability.name}>{ability.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => toggleFilters(!showFilters)}
                                className="mt-2 sm:mt-0 text-gray-200 text-sm px-4 py-2 rounded-full font-semibold border-2 border-gray-700 hover:bg-gray-700 transition-colors duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel" viewBox="0 0 16 16">
                                    <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {showFilters && (<div className="flex flex-col gap-2 bg-slate-700 p-4 pt-1 pb-2 border-2 border-inset border-slate-600">
                        <p className="text-gray-300 text-sm font-bold">
                            Filter abilities
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className={`${selectedType === 'Attack' ? 'w-[45%]' : 'w-full'}`}>
                                <select
                                    id="ability-type"
                                    value={selectedType}
                                    onChange={e => setSelectedType(e.target.value)}
                                    className="w-full px-4 py-2 rounded-full border border-gray-700 bg-gray-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option key="all" value="all">All Types</option>
                                    {availableTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedType === 'Attack' && (<div>
                                <select
                                    id="ability-element"
                                    value={selectedElement}
                                    onChange={e => setSelectedElement(e.target.value)}
                                    className="w-full px-4 py-2 rounded-full border border-gray-700 bg-gray-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option key="all" value="all">All Elements</option>
                                    {availableElements.map(element => (
                                        <option key={element} value={element}>{element}</option>
                                    ))}
                                </select>
                            </div>)}
                        </div>


                        <div className="flex items-center space-x-4">
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
                    </div>)}

                    <div>
                        <label htmlFor="description-input" className="text-gray-300 text-sm mb-1">Ability Description</label>
                        <input
                            id="description-input"
                            type="text"
                            placeholder="Search by description..."
                            value={abilitySearchTerm}
                            onChange={e => setAbilitySearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-full border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleApplyFilter}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-300 mt-2"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={handleClear}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-300 mt-2"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AbilityFilterDialog;

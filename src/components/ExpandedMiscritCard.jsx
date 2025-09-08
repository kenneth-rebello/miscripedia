import React, { useRef, useState, useEffect } from 'react';
import '../App.css';

import {
    getGradientClass, rarityShinyBgColors, rarityTextColors, rarityBorderColors
} from '../helpers.js';

const ExpandedMiscritCard = ({ miscrit, onClose }) => {
    const abilitiesContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [selectedMiscritIndex, setSelectedMiscritIndex] = useState(null);

    const checkScrollState = () => {
        if (abilitiesContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = abilitiesContainerRef.current;
            // The scrollLeft must be greater than 0 to scroll left
            setCanScrollLeft(scrollLeft > 0);
            // We can scroll right if there's content hidden to the right. We use Math.ceil to handle sub-pixel values.
            setCanScrollRight(Math.ceil(scrollLeft) + clientWidth < scrollWidth);
        }
    };

    useEffect(() => {
        const container = abilitiesContainerRef.current;
        if (container) {
            checkScrollState();
            container.addEventListener('scroll', checkScrollState);
            window.addEventListener('resize', checkScrollState);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', checkScrollState);
                window.removeEventListener('resize', checkScrollState);
            }
        };
    }, []);

    const scroll = (direction) => {
        const container = abilitiesContainerRef.current;
        if (container) {
            const abilityWidth = container.querySelector('.ability-desktop')?.offsetWidth || 0;
            const gap = 12; // Tailwind 'gap-3' roughly translates to 12px
            const scrollAmount = (abilityWidth + gap) * 2; // Scroll 2 items at a time

            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className={`relative w-full h-[90vh] md:h-[75vh] max-w-6xl rounded-xl shadow-2xl transition-all duration-300 transform scale-95 border-2 ${rarityBorderColors[miscrit.rarity]} flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`${rarityShinyBgColors[miscrit.rarity]} rounded-xl rounded-b-none overflow-hidden flex flex-col relative flex-grow-0 md:flex-shrink-0`}>
                    <div className={`relative w-full flex justify-center items-center p-4 bg-gradient-to-br ${getGradientClass(miscrit.element)}`}>
                        <img
                            src={`https://worldofmiscrits.com/${miscrit.element.toLowerCase()}.png`}
                            alt={`${miscrit.element} element`}
                            className="absolute top-2 right-2 w-10 h-10 rounded-full"
                        />
                        {/* Desktop Image Section */}
                        <div className="hidden md:grid grid-cols-4 items-end gap-4 w-full h-full p-4">
                            {miscrit.images.map((image, index) => (
                                <div key={index} className={`flex flex-col items-center justify-end w-full h-full`}>
                                    <img src={image} alt={miscrit.names[index]} className="h-full w-auto object-contain drop-shadow-md" />
                                    <h2 className={`text-xl md:text-2xl text-center card-font font-bold ${rarityTextColors[miscrit.rarity]}`} key={index}>{miscrit.names[index]}</h2>
                                </div>
                            ))}
                        </div>
                        
                        {/* Mobile Image Section */}
                        <div className="md:hidden relative w-full h-[60vh] p-4 flex flex-col items-center justify-center">
                            {selectedMiscritIndex !== null && (
                                <button
                                    onClick={() => setSelectedMiscritIndex(null)}
                                    className="absolute top-2 left-2 z-10 p-2 text-white bg-black bg-opacity-50 rounded-full"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                    </svg>
                                </button>
                            )}
                            {selectedMiscritIndex === null ? (
                                <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-4 transition-all duration-500">
                                    {miscrit.images.map((image, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedMiscritIndex(index)}
                                            className="flex flex-col items-center justify-end p-2 transition-all duration-500 cursor-pointer"
                                        >
                                            <img
                                                src={image}
                                                alt={miscrit.names[index]}
                                                className="w-auto h-full object-contain drop-shadow-md transition-all duration-500"
                                            />
                                            <h2 className={`text-xl text-center font-bold card-font transition-all duration-500 ${rarityTextColors[miscrit.rarity]}`}>
                                                {miscrit.names[index]}
                                            </h2>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full w-full transition-all duration-500">
                                    <img
                                        src={miscrit.images[selectedMiscritIndex]}
                                        alt={miscrit.names[selectedMiscritIndex]}
                                        className="w-auto h-full object-contain drop-shadow-md transition-all duration-500"
                                    />
                                    <h2 className={`text-xl text-center font-bold card-font transition-all duration-500 ${rarityTextColors[miscrit.rarity]}`}>
                                        {miscrit.names[selectedMiscritIndex]}
                                    </h2>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Desktop Abilities Section */}
                <div className="relative h-full flex-grow bg-slate-700 p-4 hidden md:block">
                    <div
                        id="abilities-desktop"
                        ref={abilitiesContainerRef}
                        className="h-full flex flex-row items-center gap-3 overflow-x-hidden overflow-y-hidden"
                    >
                        {miscrit.abilities.map(ability => (
                            <div key={ability.name} className="ability-desktop min-w-[250px] p-4 bg-gray-800 rounded-lg shadow-lg flex-shrink-0 border-2 border-slate-400">
                                <div className='flex items-center space-x-2'>
                                    <img
                                        src={ability.imgSrc}
                                        alt={`${ability.element} element`}
                                        className='w-8 h-8'
                                    />
                                    <div className='flex flex-col'>
                                        <h4 className='ability-name text-lg font-semibold text-white'>{ability.name}</h4>
                                        <div className='ability-power text-sm text-gray-400'>
                                            <p>AP: {ability.ap === 'NaN' ? 'N/A' : ability.ap}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className='ability-main text-sm text-gray-300 mt-2'>
                                    <p>{ability.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-900 p-2 rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity duration-300"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                    )}
                    {canScrollRight && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-900 p-2 rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity duration-300"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    )}
                </div>

                {/* Mobile Abilities Section */}
                <div className="relative flex-grow bg-slate-700 p-4 md:hidden overflow-hidden rounded-b-md h-[30vh]">
                    <div
                        id="abilities-mobile"
                        className="h-full grid grid-cols-2 gap-3 overflow-y-scroll"
                    >
                        {miscrit.abilities.map((ability, index) => (
                            <div key={ability.name} className="ability-mobile p-1 bg-gray-800 rounded-lg shadow-lg flex-shrink-0 flex items-center justify-between text-center p-3 border-2 border-slate-400 min-h-[45px]">
                                <img src={ability.imgSrc} alt={`${ability.element} element`} className="w-6 h-6" />
                                <h4 className='ability-name text-xs font-semibold text-white max-w-[80px]'>{ability.name}</h4>
                                <div className="relative group ml-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="w-5 h-5 md:w-4 md:h-4 text-gray-400 cursor-pointer"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className={`absolute top-full mt-2 w-48 p-2 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10
                                        ${(index % 2 !== 0) ? 'right-0' : 'left-1/2 transform -translate-x-1/2'}`}>
                                        <p className="font-semibold mb-1">{ability.name}</p>
                                        <p className="text-gray-400 text-xs mb-1">AP: {ability.ap === 'NaN' ? 'N/A' : ability.ap}</p>
                                        <p className="text-gray-300">{ability.desc}</p>
                                        <div className={`absolute bottom-full w-3 h-3 bg-slate-900 rotate-45 border-l border-t border-slate-700
                                            ${(index % 2 !== 0) ? 'right-2' : 'left-1/2 transform -translate-x-1/2'}`}></div>
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

export default ExpandedMiscritCard;

import React from 'react';

import { 
    getGradientClass, rarityShinyBgColors, rarityTextColors, rarityBorderColors
} from '../helpers.js';

const ExpandedMiscritCard = ({ miscrit, onClose }) => {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 transition-opacity duration-300"
                onClick={onClose}
            >
                <div className={`relative w-full max-w-6xl rounded-xl shadow-2xl transition-all duration-300 transform scale-95`}>
                    <div className={`${rarityShinyBgColors[miscrit.rarity]} rounded-xl overflow-hidden shadow-xl border-2 ${rarityBorderColors[miscrit.rarity]} flex flex-col relative`}>
                        <div className={`relative w-full flex justify-center items-center p-4 bg-gradient-to-br ${getGradientClass(miscrit.element)}`}>
                            <img
                                src={`https://worldofmiscrits.com/${miscrit.element.toLowerCase()}.png`}
                                alt={`${miscrit.element} element`}
                                className="absolute top-2 left-2 w-10 h-10 rounded-full"
                            />
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full h-full p-4">
                                {miscrit.images.map((image, index) => (
                                    <div key={index} className="flex flex-col items-center justify-end">
                                        <img src={image} alt={miscrit.names[index]} className={`w-[${(30 * (index + 1)) - (10 * (index + 1))}%] object-contain drop-shadow-md hover-expand`} />
                                        <h2 className={`text-2xl text-center card-font font-bold ${rarityTextColors[miscrit.rarity]}`} key={index}>{miscrit.names[index]}</h2>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    export default ExpandedMiscritCard;
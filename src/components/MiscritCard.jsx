import React from 'react';

import {
    statValues, getGradientClass, rarityShinyBgColors, rarityTextColors, rarityBorderColors, statIcons, iconBgColors, getStatColor
} from '../helpers.js';

const MiscritCard = ({ miscrit, onClick, showEvolved }) => {
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
            className={`${rarityShinyBgColors[miscrit.rarity]} rounded-xl overflow-hidden shadow-xl transform transition-transform duration-300 hover:scale-105 border-2 ${rarityBorderColors[miscrit.rarity]} flex flex-col relative ${sheenClass} cursor-pointer`}
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
                        <h2 className={`text-xl sm:text-3xl font-bold card-font`}>{miscrit.names[3]}</h2>
                    </div> :
                        <h2 className={`text-xl sm:text-3xl font-bold card-font`}>{miscrit.name}</h2>
                    }

                    {miscrit.extras.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center m-2">
                            {miscrit.extras.map(extra => (
                                <div
                                    key={extra}
                                    className="px-2 py-1 bg-gray-700 text-gray-200 text-xs font-semibold rounded-full"
                                >
                                    {extra}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={`bg-gray-400 rounded-lg p-2 ${miscrit.extras.length <= 0 && 'mt-9'}`}>
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

                {miscrit.ultimates.length > 0 && (
                    <div className='flex flex-col w-full'>
                        {miscrit.ultimates.map(ult => (
                            <div className="ability">
                                <div className="ability-header">
                                    <div className='ability-icon'>
                                        <img
                                            src={`https://worldofmiscrits.com/${ult.element.toLowerCase()}.png`}
                                            alt={`${ult.element} element`}
                                        />
                                    </div>
                                    <h4 className='ability-name'>{ult.name}</h4>
                                    <div className='power'>
                                        <p>{ult.ap}</p>
                                    </div>
                                </div>
                                <div className='ability-main'>
                                    <p>{ult.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MiscritCard;
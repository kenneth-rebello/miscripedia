import { calculateHeal, calculateHot, calculateTurns, calculateBlock, calculateBuff, calculateSteal, extractDot, statMap } from "./extract-buffs";

export const elementColors = {
    'Water': 'sky', 'Nature': 'green', 'Fire': 'red',
    'Lightning': 'indigo', 'Earth': 'orange', 'Wind': 'violet',
};

export const rarityValues = {
    'Common': 1, 'Rare': 2, 'Epic': 3, 'Exotic': 4, 'Legendary': 5
}

// Function to get the correct gradient class for single or dual elements
export const getGradientClass = (element) => {
    const primaryElement = element;
    const [el1, el2] = element.split(/(?=[A-Z])/).filter(Boolean); // Split by capitalized letters
    if (el1 && el2 && elementColors[el1] && elementColors[el2]) {
        // Dual element
        return `from-${elementColors[el1]}-500 to-${elementColors[el2]}-500`;
    }
    // Single element
    return `from-${elementColors[primaryElement]}-100 to-${elementColors[primaryElement]}-700`;
};

export const rarityShinyBgColors = {
    'Common': 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-600 to-slate-800',
    'Rare': 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700 via-blue-800 to-blue-950',
    'Epic': 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600 via-emerald-700 to-emerald-900',
    'Exotic': 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-800 via-fuchsia-900 to-fuchsia-950',
    'Legendary': 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-800 via-amber-400 to-yellow-800',
};

export const rarityTextColors = {
    'Common': 'text-gray-200',
    'Rare': 'text-gray-200',
    'Epic': 'text-gray-200',
    'Exotic': 'text-gray-200',
    'Legendary': 'text-black',
};

// Determine border color based on rarity
export const rarityBorderColors = {
    'Common': 'border-slate-500',
    'Rare': 'border-slate-500',
    'Epic': 'border-slate-500',
    'Exotic': 'border-amber-400',
    'Legendary': 'border-amber-400',
};


// Function to map stat string values to a number for comparison
export const statValues = {
    'Weak': 1, 'Moderate': 2, 'Strong': 3, 'Max': 4, 'Elite': 5
};

export const statIcons = {
    hp: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" /></svg>',
    spd: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path d="M11.5 19.5L9 22V14H2L12.5 2.5L15 2V10H22L11.5 19.5Z" /></svg>',
    ea: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path d="M12 2.25a.75.75 0 0 1 .75.75v6.59l4.588-3.327a.75.75 0 0 1 .84.148l.004.004a.75.75 0 0 1-.148.84l-4.225 3.064 4.015 3.064a.75.75 0 0 1-.004 1.258l-.004.004a.75.75 0 0 1-.84-.148L12.75 14.41v6.59a.75.75 0 0 1-1.5 0v-6.59l-4.588 3.327a.75.75 0 0 1-.84-.148l-.004-.004a.75.75 0 0 1 .148-.84l4.225-3.064-4.015-3.064a.75.75 0 0 1 .004-1.258l.004-.004a.75.75 0 0 1 .84.148L11.25 9.59V3a.75.75 0 0 1 .75-.75Z" /></svg>',
    pa: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path fill-rule="evenodd" d="M19.952 1.344a.75.75 0 0 0-1.002-.214l-12.742 7.27a.75.75 0 0 0 0 1.352l12.742 7.27a.75.75 0 0 0 1.002-.214l2.871-6.194a.75.75 0 0 0-.214-1.002l-2.871-6.194Z" clip-rule="evenodd" /><path d="M8.25 4.5a.75.75 0 0 0-1.5 0v15a.75.75 0 0 0 1.5 0v-15Z" /></svg>',
    ed: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path d="M12 2.25c-2.33 0-4.5.918-6.121 2.539l-.025.025c-1.62 1.62-2.539 3.791-2.539 6.121v5.625A2.25 2.25 0 0 0 5.25 18.75h13.5a2.25 2.25 0 0 0 2.25-2.25v-5.625c0-2.33-.919-4.501-2.54-6.121l-.025-.025C16.5 3.168 14.33 2.25 12 2.25ZM12 4.5a.75.75 0 0 1 .75.75V9a.75.75 0 0 1-1.5 0V5.25a.75.75 0 0 1 .75-.75Z" /></svg>',
    pd: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-5 h-5"><path d="M12 2.25c-2.33 0-4.5.918-6.121 2.539l-.025.025c-1.62 1.62-2.539 3.791-2.539 6.121v5.625A2.25 2.25 0 0 0 5.25 18.75h13.5a2.25 2.25 0 0 0 2.25-2.25v-5.625c0-2.33-.919-4.501-2.54-6.121l-.025-.025C16.5 3.168 14.33 2.25 12 2.25ZM12 4.5a.75.75 0 0 1 .75.75V9a.75.75 0 0 1-1.5 0V5.25a.75.75 0 0 1 .75-.75Z" /></svg>',
};

export const iconBgColors = {
    hp: 'bg-green-600',
    spd: 'bg-yellow-600',
    ea: 'bg-red-600',
    ed: 'bg-red-600',
    pa: 'bg-blue-600',
    pd: 'bg-blue-600',
};

export const getStatColor = (value) => {
    if (value >= 1 && value <= 2) return 'bg-red-400';
    if (value === 3) return 'bg-yellow-400';
    if (value >= 4 && value <= 5) return 'bg-green-400';
    return 'bg-gray-400';
};


export const removeDuplicates = (arr, key) => {
    const uniqueMap = new Map();
    arr.forEach(item => {
        uniqueMap.set(item[key], item);
    });
    return Array.from(uniqueMap.values());
};

export const extractHitsNumber = (text) => {
    const pattern = /hits (\d+) times/;
    const match = text.match(pattern);
    if (match) {
        return parseInt(match[1], 10);
    } else {
        return 1;
    }
}

export const extractBuffs = (buff, desc) => {
    if (buff.type === 'Attack')
        return;
    if (buff.type === 'Heal') {
        return `Heal ${calculateHeal(desc)}`;
    } else if (buff.type === 'Hot') {
        return `Heal ${calculateHot(desc)}`
    } else if (buff.type === 'Antiheal') {
        return `Antiheal ${calculateTurns(desc, 'heal')}`;
    } else if (buff.type === 'Bleed') {
        return `Bleed ${calculateTurns(desc, 'Bleed')}`
    } else if (buff.type === 'Block') {
        return `Block ${calculateBlock(desc)}`
    } else if (buff.type === 'Dot' || buff.type === 'Poison') {
        return extractDot(desc, buff.element || buff.type);
    } else if (buff.type === 'LifeSteal') {
        return `${buff.type.replace(/([a-z])([A-Z])/g, '$1 $2')} [${calculateSteal(desc)}]`;
    } else if (buff.type === 'StatSteal') {
        if (buff.keys) {
            let label = buff.type.replace(/([a-z])([A-Z])/g, '$1 $2');
            const buffs = buff.keys.map(b => `${label} ${statMap[b]} [${calculateSteal(desc)}]`);
            return buffs
        };
    } else if (buff.type === 'Confuse' || buff.type === 'Paralyze') {
        return `${buff.type} ${calculateTurns(desc, buff.type)}`;
    } else if (buff.type === 'Bot') {
        if (buff.keys) {
            const buffs = buff.keys.map(b => `Raise ${statMap[b]} ${calculateTurns(desc, '')}`);
            return buffs;
        }
    } else if (buff.type === 'Buff') {
        if (buff.keys) {
            const amount = desc.includes('Chaos') ? -5 : desc.includes('Surge') ? 5 : calculateBuff(desc);
            const buffs = buff.keys.map(k => amount > 0 ? `Raise ${statMap[k]} [${amount}]` : `Lower foes ${statMap[k]} [${-amount}]`);
            return buffs;
        }
    }
    return buff.type;
}
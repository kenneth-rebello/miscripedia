export const calculateHeal = (s) => {
    const baseHealMatch = s.match(/by (\d+) HP/);
    if (!baseHealMatch) {
        return null;
    }
    const baseHeal = parseInt(baseHealMatch[1], 10);
    const hitsMatch = s.match(/hits (\d+) times/);
    if (hitsMatch) {
        const hits = parseInt(hitsMatch[1], 10);
        return `[${baseHeal}] (x${hits})`;
    } else {
        return `[${baseHeal}]`;
    }
}

export const calculateHot = (s) => {
    const match = s.match(/(\d+) healing for (\d+) turns/);
    if (!match) {
        return null;
    }
    const healingAmount = parseInt(match[1], 10);
    const turns = parseInt(match[2], 10);
    return `[${healingAmount}] (x${turns})`;
};

export const calculateTurns = (s, label) => {
    const byYforXPattern = /by (\d+) for (\d+) turns/;
    const byYforXMatch = s.match(byYforXPattern);
    if (byYforXMatch) {
        const y = parseInt(byYforXMatch[1], 10);
        const x = parseInt(byYforXMatch[2], 10);
        return `+${y} (x${x})`;
    }
    const labelForXPattern = new RegExp(`${label}.*for (\\d+) turn`);
    const labelForXMatch = s.match(labelForXPattern);
    if (s.includes('Surge'))
        return `+5 (x${parseInt(labelForXMatch[1], 10)})`
    if (labelForXMatch)
        return `(x${parseInt(labelForXMatch[1], 10)})`;
    return null;
};

export const calculateBlock = (s) => {
    const match = s.match(/provides (\d+) Block/);
    if (match)
        return `[${parseInt(match[1], 10)}]`;
    return null;
};

export const calculateBuff = (s) => {
    let amount = 0;
    const raisePattern = /raises your.*by (\d+)/i;
    const raiseMatch = s.match(raisePattern);
    if (raiseMatch)
        amount = parseInt(raiseMatch[1], 10);
    const lowerPattern = /lower.*by (\d+)/i;
    const lowerMatch = s.match(lowerPattern);
    if (lowerMatch)
        amount = -parseInt(lowerMatch[1], 10);
    return amount;
};

export const calculateSteal = (s) => {
    const match = s.match(/steals (\d+)/);
    if (match) 
        return parseInt(match[1], 10);
    return null;
};

export const extractDot = (s, element) => {
    if(element !== 'Poison') element = element + ' DoT';
    const pattern = new RegExp(`(\\d+) AP ${element} for (\\d+) turns`);
    const match = s.match(pattern);
    if (match) {
        const apValue = match[1];
        const turnsValue = match[2];
        return `${element} [${apValue}] (x${turnsValue})`;
    }
    return null;
};

export const statMap = {
    'acc': 'Acc', 'spd': 'Speed', 'ea': 'EA', 'ed': 'ED', 'pa': 'PA', 'pd': 'PD'
}
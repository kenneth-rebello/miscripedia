import relicsData from '../data/relics.json';
import { removeDuplicates } from './helpers';

const calculateWeightedScore = (score, targetScore, priority) => {
    const scoreDifference = score - targetScore;
    const priorityWeight = 100 / (priority * priority);

    if (scoreDifference <= 0) {
        return scoreDifference * priorityWeight;
    } else {
        return Math.log(1 + scoreDifference) * priorityWeight;
    }
};


const relics = relicsData;

const findBestRelicSet = (targetStats) => {
    const relicsByLevel = {
        10: [], 20: [], 30: [], 35: []
    };
    relics.forEach(relic => {
        relicsByLevel[relic.level].push(relic);
    });

    const candidateSets = [];
    const candidateRelics = {
        10: [], 20: [], 30: [], 35: []
    };
    targetStats.sort((a, b) => a.priority - b.priority);
    const targetBuffs = {}

    targetStats.forEach(target => {
        const targetStat = target.stat;
        targetBuffs[targetStat] = target.value;
        let suggestions = {};

        for (const level of [10, 20, 30, 35]) {
            let levelSuggestions = [];
            relicsByLevel[level].forEach(relic => {
                const actualValue = relic.stats[targetStat] || 0;
                if (actualValue) {
                    levelSuggestions.push({ actualValue, name: relic.name, stats: relic.stats });
                }
            })
            levelSuggestions.sort((a, b) => b.actualValue - a.actualValue);
            suggestions[level] = levelSuggestions.slice(0, targetStats.length);
            candidateRelics[level].push(...suggestions[level]);
        }
    });

    candidateRelics[10].forEach(relic_10 => {
        candidateRelics[20].forEach(relic_20 => {
            candidateRelics[30].forEach(relic_30 => {
                candidateRelics[35].forEach(relic_35 => {
                    const setBuffs = {}
                    let score = 0;
                    Object.keys(targetBuffs).forEach(stat => {
                        const statContribution = (relic_10.stats[stat] || 0) + (relic_20.stats[stat] || 0) + (relic_30.stats[stat] || 0) + (relic_35.stats[stat] || 0);
                        setBuffs[stat] = statContribution;
                        const targetStat = targetStats.find(t => t.stat === stat);
                        const priority = [targetStat?.priority || 5];
                        score += calculateWeightedScore(statContribution, targetBuffs[stat], priority);
                    })
                    candidateSets.push({
                        relics: [relic_10, relic_20, relic_30, relic_35],
                        id: `${relic_10.name}_${relic_20.name}_${relic_30.name}_${relic_35.name}`,
                        buffs: setBuffs,
                        score
                    })
                })
            })
        })
    })

    candidateSets.sort((a, b) => b.score - a.score);
    const finalSets = removeDuplicates(candidateSets, 'id');
    return finalSets.slice(0, 5);
}

export default findBestRelicSet;
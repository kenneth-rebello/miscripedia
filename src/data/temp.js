
import './App.css';
import miscritsData from './data/miscrits.json';

[
    {
        "name": "Mighty Bash",
        "desc": "A massively powerful Physical attack that heals yourself by 10 HP",
        "element": "Physical",
        "ap": 30,
        "additional": [
            {
                "type": "Heal"
            }
        ],
        "type": "Attack",
        "unloackedAt": 30
    },
    {
        "name": "Bastion",
        "desc": "Raises your Elemental Defense and Physical Attack by 11",
        "element": "Misc",
        "ap": 14,
        "type": "Buff",
        "unloackedAt": 28
    },
    {
        "name": "Brimstone",
        "desc": "A very powerful Fire attack",
        "element": "Fire",
        "ap": 22,
        "type": "Attack",
        "unloackedAt": 25
    },
    {
        "name": "Debilitate",
        "desc": "Lowers your foe's Defenses by 11",
        "element": "Misc",
        "ap": -14,
        "type": "Buff",
        "unloackedAt": 22
    },
    {
        "name": "Campfire",
        "desc": "A powerful Fire attack",
        "element": "Fire",
        "ap": 18,
        "type": "Attack",
        "unloackedAt": 19
    },
    {
        "name": "Bash",
        "desc": "A powerful Physical attack",
        "element": "Physical",
        "ap": 18,
        "type": "Attack",
        "unloackedAt": 16
    },
    {
        "name": "Tickle",
        "desc": "Lowers your foe's Attacks by 8",
        "element": "Misc",
        "ap": -10,
        "type": "Buff",
        "unloackedAt": 13
    },
    {
        "name": "Fire Flight",
        "desc": "An average Fire attack",
        "element": "Fire",
        "ap": 13,
        "type": "Attack",
        "unloackedAt": 10
    },
    {
        "name": "Confuse",
        "desc": "Confuses your foe so that they may attack themselves for 2 turns",
        "element": "Misc",
        "ap": null,
        "type": "Confuse",
        "unloackedAt": 7
    },
    {
        "name": "Smack",
        "desc": "A simple Physical attack",
        "element": "Physical",
        "ap": 8,
        "type": "Attack",
        "unloackedAt": 4
    },
    {
        "name": "Power Up",
        "desc": "Raises your Attacks by 5",
        "element": "Misc",
        "ap": 6,
        "type": "Buff",
        "unloackedAt": 1
    },
    {
        "name": "Burn",
        "desc": "A simple Fire attack",
        "element": "Fire",
        "ap": 8,
        "type": "Attack",
        "unloackedAt": 1
    }
]
/**
 * This file is cursed; ignore
 */

'use strict';

const fs = require("fs");
const html2json = require('html2json').html2json;
const QUEST_HTML_FOLDER_PATH = "./data/quest";
const INCLUDE_VILLAGE_QUESTS = false;
const ENGLISH_KEY = "mh-lang-1";
const JAPANESE_KEY = "mh-lang-0";
const MONSTER_SECTIONS = {
    BASIC_DATA: 0,
    QUESTS: 1,
    HITZONE_DATA: 2,
    PARTS: 3,
    ABNORM_STATUS: 4,
    LOW_REWARD: 5,
    HIGH_REWARD: 6
}
const MONSTER_REWARDS = {
    TARGET: 0,
    CARVES: 1,
    CAPTURES: 2,
    BROKEN_PART: 3,
    DROPPED_MATERIALS: 4,
    PALICO: 5,
}
const RANK = {
    LOW: 0,
    HIGH: 1
}

function traverse(obj, filter) {
    if (typeof obj !== 'object' || obj === null) return;

    Object.entries(obj).forEach(([key, value]) => {
        // Key is either an array index or object key
        if (filter(key, value)) traverse(value, filter);
    });
}

function main() {
    const result = {};
    let questFilePaths = fs.readdirSync(QUEST_HTML_FOLDER_PATH);
    if(!INCLUDE_VILLAGE_QUESTS) {
        questFilePaths = questFilePaths.filter((e) => e.indexOf("00") !== 0);
    }
    for(let i = 0; i < questFilePaths.length; i++) {
        // console.log(questFilePaths[i]);
        const key = questFilePaths[i].substr(0, questFilePaths[i].indexOf("."));
        const rating = parseInt(key.substr(2, 2));
        const isVillage = key.indexOf("00") === 0;
        const rank = ((rating < 4) ? (RANK.LOW) : (RANK.HIGH));
        const ref = result[key] = {
            name: {},
            objective: {},
            monsters: [],
            targetMonsters: 0,
            rank: isVillage ? RANK.LOW : rank,
            rating: rating
        };
        const questHTMLString = fs.readFileSync(`${QUEST_HTML_FOLDER_PATH}/${questFilePaths[i]}`, "utf8");
        const questHTMLJSON =
            html2json(questHTMLString);
        const htmlMainContentJSON =
            questHTMLJSON.child[0].child
                .find((e) => e.tag === "body").child
                .find((e) => e.tag === "main").child
                .find((e) => e.tag === "div").child
                .find((e) => e.tag === "div");
        let tCounter = 0;

        htmlMainContentJSON.child
            .find((e) => e.tag === "h1").child
            .find((e) => e.tag === "span" && tCounter++ === 1).child
            .forEach((e) => {
                ref.name[e.attr.class] = e.child[0].text;
            });

        tCounter = 0;
        htmlMainContentJSON.child
            .find((e) => e.tag === "p").child
            .find((e) => e.tag === "span" && tCounter++ === 1).child[0].child
            .forEach((e) => {
                if(e.attr)
                    ref.objective[e.attr.class] = e.child[0].text;
            });

        // cheat to get monsters because fuck this it's 2am
        const test = [...questHTMLString.matchAll(new RegExp("\.\.\/monster\/", 'gi'))].map(a => a.index);
        const numOfTargetMonsters =
            [...questHTMLString.matchAll(new RegExp("is\-primary\ tag", 'gi'))]
            .map(a => a.index).length;
        if(test.length % 2 !== 0) {
            throw new Error("Number of monster string occurrences not factor of 2");
        }

        ref.targetMonsters = numOfTargetMonsters / 2;
        test.forEach((e, _i) => {
            if(_i >= test.length / 2) return;
            ref.monsters.push(questHTMLString.substr(
                test[_i] + "../monster/".length,
                6
            ));
        });
        ref.monsters = [...new Set(ref.monsters)];
    }
    fs.writeFileSync("./src/quests.json", JSON.stringify(result, undefined, " "));
}

try {
    main();
} catch (err) {
    console.error(err);
}

/**
 * This file is cursed; ignore
 */

'use strict';

const fs = require("fs");
const html2json = require('html2json').html2json;
const MAIN_HTML_PATH = "./data/main.html";
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
const LANGUAGES = [
    "mh-lang-0",
    "mh-lang-1",
    "mh-lang-2",
    "mh-lang-3",
    "mh-lang-4",
    "mh-lang-5",
    "mh-lang-6",
    "mh-lang-7",
    "mh-lang-10",
    "mh-lang-11",
    "mh-lang-12",
    "mh-lang-13",
    "mh-lang-21",
]

function main() {
    const items = {};
    const result = {};
    const htmlString = fs.readFileSync(MAIN_HTML_PATH, "utf8");
    const htmlJSON = html2json(htmlString);
    const htmlBodyJSON = htmlJSON.child[0].child.find((e) => e.tag === "body");
    // let counter = 0;
    const htmlMonsterListJSONArray =
        htmlBodyJSON.child
            .find((e) => e.tag === "main").child
            .find((e) => e.tag === "div").child
            .find((e) => e.tag === "div").child
            .find((e) => e.tag === "section").child
            .find((e) => e.tag === "ul").child
            .filter((e) => e.tag === "li");

    htmlMonsterListJSONArray.forEach((x) => {
        // if(counter === 2) return;
        // else counter++;
        const monKey = x.child[0].attr.href.substr(x.child[0].attr.href.indexOf("/") + 1, 6);
        const ref = result[monKey] = {
            name: {},
            img: x.child[0].child[0].attr.src,
            items: {
                [RANK.LOW]: {
                    [MONSTER_REWARDS.TARGET]: [],
                    [MONSTER_REWARDS.CARVES]: [],
                    [MONSTER_REWARDS.CAPTURES]: [],
                    [MONSTER_REWARDS.BROKEN_PART]: [],
                    [MONSTER_REWARDS.DROPPED_MATERIALS]: [],
                    [MONSTER_REWARDS.PALICO]: [],
                },
                [RANK.HIGH]: {
                    [MONSTER_REWARDS.TARGET]: [],
                    [MONSTER_REWARDS.CARVES]: [],
                    [MONSTER_REWARDS.CAPTURES]: [],
                    [MONSTER_REWARDS.BROKEN_PART]: [],
                    [MONSTER_REWARDS.DROPPED_MATERIALS]: [],
                    [MONSTER_REWARDS.PALICO]: [],
                },
            },
            quests: []
        };

        // get+set names
        x.child[0].child[2].child[0].child.forEach((e) => {
            ref.name[e.attr.class] = e.child[0].text;
        });

        // load monster file
        const monsterDataHTMLJSON = html2json(fs.readFileSync(`data/${x.child[0].attr.href}`, "utf8"));
        const monsterSectionsHTMLJSON =
            monsterDataHTMLJSON.child[0].child.find((e) => e.tag === "body").child
                .find((e) => e.tag === "main").child
                .find((e) => e.tag === "div").child
                .find((e) => e.tag === "div");

        // quests
        const monsterQuestsHTMLJSON =
            monsterSectionsHTMLJSON.child
                .filter((e) => e.tag === "section")[MONSTER_SECTIONS.QUESTS].child
                .find((e) => e.tag === "table").child
                .find((e) => e.tag === "tbody").child
                .filter((e) => e.tag === "tr");
        monsterQuestsHTMLJSON.forEach((q) => {
            const curr = q.child.filter((e) => e.tag === "td")[0];
            const a = curr.child.find((e) => e.tag === "a");
            if(!a) return;
            const htmlFilePath = a.attr.href;
            const key = htmlFilePath.substring(htmlFilePath.lastIndexOf("/") + 1, htmlFilePath.lastIndexOf("."));
            // const questRes = {};
            // questRes.name = {};
            // questRes.id = key;
            // a.child.forEach((t) => {
            //     for(let i = 0; i < t.child.length; i++) {
            //         questRes.name[t.child[i].attr.class] = t.child[i].child[0].text;
            //     }
            // });
            if(
                INCLUDE_VILLAGE_QUESTS ||
                !key.startsWith("00")
            ) {
                ref.quests.push(key);
            }
        });

        // drops
        try {
            handleLowRankDrops(monsterSectionsHTMLJSON, ref, items);
            handleHighRankDrops(monsterSectionsHTMLJSON, ref, undefined, items);
        } catch(err) {
            console.error(err);
        }

        // for(let y = 0; y < 2; y++) {
        //     for(let x = 0; x < 6; x++) {
        //         const currList = ref.items[y][x];
        //         currList.forEach((item) => {
        //             if(!items.hasOwnProperty(item.id)) {
        //                 items[item.id] =
        //             }
        //         });
        //     }
        // }
    });
    fs.writeFileSync("./src/monsters.json", JSON.stringify(result, undefined, " "), "utf8");
    fs.writeFileSync("./src/items.json", JSON.stringify(items, undefined, " "), "utf8");
}

function getItemNameAndAddToItemCache(_itemsCache, _langHTMLChildren /* array */, _id) {
    _itemsCache[_id] = {
        name: {}
    }
    for(let i = 0; i < 12; i++) {
        _itemsCache[_id].name[LANGUAGES[i]] = _langHTMLChildren[i].child[0].text;
    }
}

function handleHighRankDrops(_monsterSectionsHTMLJSON, _ref, _offset, _itemsCache) {
    const monsterHRDropsHTMLArray
        = _monsterSectionsHTMLJSON.child
        .filter((e) => e.tag === "section")[_offset ? MONSTER_SECTIONS.LOW_REWARD : MONSTER_SECTIONS.HIGH_REWARD].child
        .find((e) => e.tag === "div").child
        .filter((e) => e.tag === "div");

    const targetDropsHTMLArray =
        monsterHRDropsHTMLArray[MONSTER_REWARDS.TARGET].child
            .find((e) => e.tag === "table").child
            .find((e) => e.tag === "tbody").child
            .filter((e) => e.tag === "tr");
    for(let i = 0; i < targetDropsHTMLArray.length; i++) {
        let curr;
        if(targetDropsHTMLArray[i].child.filter((e) => e.tag === "td").length === 3) {
            let _tagCount = 0;
            curr = targetDropsHTMLArray[i].child.find((e) => e.tag === "td" && _tagCount++ === 1);
        } else {
            curr = targetDropsHTMLArray[i].child.find((e) => e.tag === "td");
        }
        const amount = curr.child[0].text.trim().match(/(\d+)/)[0];
        const id = curr.child[2].attr.href.substring(
            curr.child[2].attr.href.lastIndexOf("/") + 1,
            curr.child[2].attr.href.lastIndexOf(".")
        );
        _ref.items[RANK.HIGH][MONSTER_REWARDS.TARGET].push({id, amount});
        if(!_itemsCache.hasOwnProperty(id))
            getItemNameAndAddToItemCache(_itemsCache, curr.child[2].child[1].child[0].child, id);
    }

    const carveRewardsHTMLArray =
        monsterHRDropsHTMLArray[MONSTER_REWARDS.CARVES].child
            .find((e) => e.tag === "table").child
            .find((e) => e.tag === "tbody").child
            .filter((e) => e.tag === "tr");
    for(let i = 0; i < carveRewardsHTMLArray.length; i++) {
        let curr;
        if(carveRewardsHTMLArray[i].child.filter((e) => e.tag === "td").length === 3) {
            let _tagCount = 0;
            curr = carveRewardsHTMLArray[i].child.find((e) => e.tag === "td" && _tagCount++ === 1);
        } else {
            curr = carveRewardsHTMLArray[i].child.find((e) => e.tag === "td");
        }
        const amount = curr.child[0].text.trim().match(/(\d+)/)[0];
        const id = curr.child[2].attr.href.substring(
            curr.child[2].attr.href.lastIndexOf("/") + 1,
            curr.child[2].attr.href.lastIndexOf(".")
        );
        _ref.items[RANK.HIGH][MONSTER_REWARDS.CARVES].push({id, amount});
        if(!_itemsCache.hasOwnProperty(id))
            getItemNameAndAddToItemCache(_itemsCache, curr.child[2].child[1].child[0].child, id);
    }

    const _captureRewardsHTMLArray =
        monsterHRDropsHTMLArray[MONSTER_REWARDS.CAPTURES].child
            .find((e) => e.tag === "table").child
            .find((e) => e.tag === "tbody").child;
    if(_captureRewardsHTMLArray) {
        const captureRewardsHTMLArray = _captureRewardsHTMLArray.filter((e) => e.tag === "tr");
        for(let i = 0; i < captureRewardsHTMLArray.length; i++) {
            let curr;
            if(captureRewardsHTMLArray[i].child.filter((e) => e.tag === "td").length === 3) {
                let _tagCount = 0;
                curr = captureRewardsHTMLArray[i].child.find((e) => e.tag === "td" && _tagCount++ === 1);
            } else {
                curr = captureRewardsHTMLArray[i].child.find((e) => e.tag === "td");
            }
            const amount = curr.child[0].text.trim().match(/(\d+)/)[0];
            const id = curr.child[2].attr.href.substring(
                curr.child[2].attr.href.lastIndexOf("/") + 1,
                curr.child[2].attr.href.lastIndexOf(".")
            );
            _ref.items[RANK.HIGH][MONSTER_REWARDS.CAPTURES].push({id, amount});
            if(!_itemsCache.hasOwnProperty(id))
                getItemNameAndAddToItemCache(_itemsCache, curr.child[2].child[1].child[0].child, id);
        }
    }

    const brokenPartRewardsHTMLArray =
        monsterHRDropsHTMLArray[MONSTER_REWARDS.BROKEN_PART].child
            .find((e) => e.tag === "table").child
            .find((e) => e.tag === "tbody").child
            .filter((e) => e.tag === "tr");
    for(let i = 0; i < brokenPartRewardsHTMLArray.length; i++) {
        let curr;
        if(brokenPartRewardsHTMLArray[i].child.filter((e) => e.tag === "td").length === 3) {
            let _tagCount = 0;
            curr = brokenPartRewardsHTMLArray[i].child.find((e) => e.tag === "td" && _tagCount++ === 1);
        } else {
            curr = brokenPartRewardsHTMLArray[i].child.find((e) => e.tag === "td");
        }
        const amount = curr.child[0].text.trim().match(/(\d+)/)[0];
        const id = curr.child[2].attr.href.substring(
            curr.child[2].attr.href.lastIndexOf("/") + 1,
            curr.child[2].attr.href.lastIndexOf(".")
        );
        _ref.items[RANK.HIGH][MONSTER_REWARDS.BROKEN_PART].push({id, amount});
        if(!_itemsCache.hasOwnProperty(id))
            getItemNameAndAddToItemCache(_itemsCache, curr.child[2].child[1].child[0].child, id);
    }

    const droppedMaterialsRewardsHTMLArray =
        monsterHRDropsHTMLArray[MONSTER_REWARDS.DROPPED_MATERIALS].child
            .find((e) => e.tag === "table").child
            .find((e) => e.tag === "tbody").child
            .filter((e) => e.tag === "tr");
    for(let i = 0; i < droppedMaterialsRewardsHTMLArray.length; i++) {
        let curr;
        if(droppedMaterialsRewardsHTMLArray[i].child.filter((e) => e.tag === "td").length === 3) {
            let _tagCount = 0;
            curr = droppedMaterialsRewardsHTMLArray[i].child.find((e) => e.tag === "td" && _tagCount++ === 1);
        } else {
            curr = droppedMaterialsRewardsHTMLArray[i].child.find((e) => e.tag === "td");
        }
        const amount = curr.child[0].text.trim().match(/(\d+)/)[0];
        const id = curr.child[2].attr.href.substring(
            curr.child[2].attr.href.lastIndexOf("/") + 1,
            curr.child[2].attr.href.lastIndexOf(".")
        );
        _ref.items[RANK.HIGH][MONSTER_REWARDS.DROPPED_MATERIALS].push({id, amount});
        if(!_itemsCache.hasOwnProperty(id))
            getItemNameAndAddToItemCache(_itemsCache, curr.child[2].child[1].child[0].child, id);
    }

    const palicoRewardsHTMLArray =
        monsterHRDropsHTMLArray[MONSTER_REWARDS.PALICO].child
            .find((e) => e.tag === "table").child
            .find((e) => e.tag === "tbody").child
            .filter((e) => e.tag === "tr");
    for(let i = 0; i < palicoRewardsHTMLArray.length; i++) {
        let curr;
        if(palicoRewardsHTMLArray[i].child.filter((e) => e.tag === "td").length === 3) {
            let _tagCount = 0;
            curr = palicoRewardsHTMLArray[i].child.find((e) => e.tag === "td" && _tagCount++ === 1);
        } else {
            curr = palicoRewardsHTMLArray[i].child.find((e) => e.tag === "td");
        }
        const amount = curr.child[0].text.trim().match(/(\d+)/)[0];
        const id = curr.child[2].attr.href.substring(
            curr.child[2].attr.href.lastIndexOf("/") + 1,
            curr.child[2].attr.href.lastIndexOf(".")
        );
        _ref.items[RANK.HIGH][MONSTER_REWARDS.PALICO].push({id, amount});
        if(!_itemsCache.hasOwnProperty(id))
            getItemNameAndAddToItemCache(_itemsCache, curr.child[2].child[1].child[0].child, id);
    }
}

function handleLowRankDrops(_monsterSectionsHTMLJSON, _ref, _itemsCache) {
    const _monsterLRDropsHTMLArray
        = _monsterSectionsHTMLJSON.child
        .filter((e) => e.tag === "section")[MONSTER_SECTIONS.LOW_REWARD].child;

    if(!_monsterLRDropsHTMLArray) return;

    const monsterLRDropsHTMLArray = _monsterLRDropsHTMLArray
        .find((e) => e.tag === "div").child
        .filter((e) => e.tag === "div");

    const targetDropsHTMLArray =
        monsterLRDropsHTMLArray[MONSTER_REWARDS.TARGET].child
            .find((e) => e.tag === "table").child
            .find((e) => e.tag === "tbody").child
            .filter((e) => e.tag === "tr");
    for(let i = 0; i < targetDropsHTMLArray.length; i++) {
        let curr;
        if(targetDropsHTMLArray[i].child.filter((e) => e.tag === "td").length === 3) {
            let _tagCount = 0;
            curr = targetDropsHTMLArray[i].child.find((e) => e.tag === "td" && _tagCount++ === 1);
        } else {
            curr = targetDropsHTMLArray[i].child.find((e) => e.tag === "td");
        }
        const amount = curr.child[0].text.trim().match(/(\d+)/)[0];
        const id = curr.child[2].attr.href.substring(
            curr.child[2].attr.href.lastIndexOf("/") + 1,
            curr.child[2].attr.href.lastIndexOf(".")
        );
        _ref.items[RANK.LOW][MONSTER_REWARDS.TARGET].push({id, amount});
        if(!_itemsCache.hasOwnProperty(id))
            getItemNameAndAddToItemCache(_itemsCache, curr.child[2].child[1].child[0].child, id);
    }

    const carveRewardsHTMLArray =
        monsterLRDropsHTMLArray[MONSTER_REWARDS.CARVES].child
            .find((e) => e.tag === "table").child
            .find((e) => e.tag === "tbody").child
            .filter((e) => e.tag === "tr");
    for(let i = 0; i < carveRewardsHTMLArray.length; i++) {
        let curr;
        if(carveRewardsHTMLArray[i].child.filter((e) => e.tag === "td").length === 3) {
            let _tagCount = 0;
            curr = carveRewardsHTMLArray[i].child.find((e) => e.tag === "td" && _tagCount++ === 1);
        } else {
            curr = carveRewardsHTMLArray[i].child.find((e) => e.tag === "td");
        }
        const amount = curr.child[0].text.trim().match(/(\d+)/)[0];
        const id = curr.child[2].attr.href.substring(
            curr.child[2].attr.href.lastIndexOf("/") + 1,
            curr.child[2].attr.href.lastIndexOf(".")
        );
        _ref.items[RANK.LOW][MONSTER_REWARDS.CARVES].push({id, amount});
        if(!_itemsCache.hasOwnProperty(id))
            getItemNameAndAddToItemCache(_itemsCache, curr.child[2].child[1].child[0].child, id);
    }

    const captureRewardsHTMLArray =
        monsterLRDropsHTMLArray[MONSTER_REWARDS.CAPTURES].child
            .find((e) => e.tag === "table").child
            .find((e) => e.tag === "tbody").child
            .filter((e) => e.tag === "tr");
    for(let i = 0; i < captureRewardsHTMLArray.length; i++) {
        let curr;
        if(captureRewardsHTMLArray[i].child.filter((e) => e.tag === "td").length === 3) {
            let _tagCount = 0;
            curr = captureRewardsHTMLArray[i].child.find((e) => e.tag === "td" && _tagCount++ === 1);
        } else {
            curr = captureRewardsHTMLArray[i].child.find((e) => e.tag === "td");
        }
        const amount = curr.child[0].text.trim().match(/(\d+)/)[0];
        const id = curr.child[2].attr.href.substring(
            curr.child[2].attr.href.lastIndexOf("/") + 1,
            curr.child[2].attr.href.lastIndexOf(".")
        );
        _ref.items[RANK.LOW][MONSTER_REWARDS.CAPTURES].push({id, amount});
        if(!_itemsCache.hasOwnProperty(id))
            getItemNameAndAddToItemCache(_itemsCache, curr.child[2].child[1].child[0].child, id);
    }

    const brokenPartRewardsHTMLArray =
        monsterLRDropsHTMLArray[MONSTER_REWARDS.BROKEN_PART].child
            .find((e) => e.tag === "table").child
            .find((e) => e.tag === "tbody").child
            .filter((e) => e.tag === "tr");
    for(let i = 0; i < brokenPartRewardsHTMLArray.length; i++) {
        let curr;
        if(brokenPartRewardsHTMLArray[i].child.filter((e) => e.tag === "td").length === 3) {
            let _tagCount = 0;
            curr = brokenPartRewardsHTMLArray[i].child.find((e) => e.tag === "td" && _tagCount++ === 1);
        } else {
            curr = brokenPartRewardsHTMLArray[i].child.find((e) => e.tag === "td");
        }
        const amount = curr.child[0].text.trim().match(/(\d+)/)[0];
        const id = curr.child[2].attr.href.substring(
            curr.child[2].attr.href.lastIndexOf("/") + 1,
            curr.child[2].attr.href.lastIndexOf(".")
        );
        _ref.items[RANK.LOW][MONSTER_REWARDS.BROKEN_PART].push({id, amount});
        if(!_itemsCache.hasOwnProperty(id))
            getItemNameAndAddToItemCache(_itemsCache, curr.child[2].child[1].child[0].child, id);
    }

    const droppedMaterialsRewardsHTMLArray =
        monsterLRDropsHTMLArray[MONSTER_REWARDS.DROPPED_MATERIALS].child
            .find((e) => e.tag === "table").child
            .find((e) => e.tag === "tbody").child
            .filter((e) => e.tag === "tr");
    for(let i = 0; i < droppedMaterialsRewardsHTMLArray.length; i++) {
        let curr;
        if(droppedMaterialsRewardsHTMLArray[i].child.filter((e) => e.tag === "td").length === 3) {
            let _tagCount = 0;
            curr = droppedMaterialsRewardsHTMLArray[i].child.find((e) => e.tag === "td" && _tagCount++ === 1);
        } else {
            curr = droppedMaterialsRewardsHTMLArray[i].child.find((e) => e.tag === "td");
        }
        const amount = curr.child[0].text.trim().match(/(\d+)/)[0];
        const id = curr.child[2].attr.href.substring(
            curr.child[2].attr.href.lastIndexOf("/") + 1,
            curr.child[2].attr.href.lastIndexOf(".")
        );
        _ref.items[RANK.LOW][MONSTER_REWARDS.DROPPED_MATERIALS].push({id, amount});
        if(!_itemsCache.hasOwnProperty(id))
            getItemNameAndAddToItemCache(_itemsCache, curr.child[2].child[1].child[0].child, id);
    }

    const palicoRewardsHTMLArray =
        monsterLRDropsHTMLArray[MONSTER_REWARDS.PALICO].child
            .find((e) => e.tag === "table").child
            .find((e) => e.tag === "tbody").child
            .filter((e) => e.tag === "tr");
    for(let i = 0; i < palicoRewardsHTMLArray.length; i++) {
        let curr;
        if(palicoRewardsHTMLArray[i].child.filter((e) => e.tag === "td").length === 3) {
            let _tagCount = 0;
            curr = palicoRewardsHTMLArray[i].child.find((e) => e.tag === "td" && _tagCount++ === 1);
        } else {
            curr = palicoRewardsHTMLArray[i].child.find((e) => e.tag === "td");
        }
        const amount = curr.child[0].text.trim().match(/(\d+)/)[0];
        const id = curr.child[2].attr.href.substring(
            curr.child[2].attr.href.lastIndexOf("/") + 1,
            curr.child[2].attr.href.lastIndexOf(".")
        );
        _ref.items[RANK.LOW][MONSTER_REWARDS.PALICO].push({id, amount});
        if(!_itemsCache.hasOwnProperty(id))
            getItemNameAndAddToItemCache(_itemsCache, curr.child[2].child[1].child[0].child, id);
    }
}

main();

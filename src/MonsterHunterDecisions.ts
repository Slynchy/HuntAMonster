import * as _monsterdata from "./monsters.json";
import * as _questdata from "./quests.json";
import * as _itemdata from "./items.json";
import { ISearchCriteria, ISearchMonsterItem } from "./ISearchCriteria";
import { LANGUAGES, MONSTER_REWARDS } from "./Enums";
import { debugLog, debugLogObj } from "./DebugLog";
import { QuestID } from "./SharedTypes";
import { QuestData, QuestRaw } from "./QuestTypes";
import { MonsterData, MonsterDropData, MonstersRaw } from "./MonsterTypes";
import { ItemsRaw } from "./ItemTypes";

export interface ISearchResult {
    quests: QuestID[]
}

export class MonsterHunterDecisions {
    // fixme: work out what's wrong with the types needing `unknown`
    private static _itemCache: Readonly<ItemsRaw> =
        _itemdata as unknown as ItemsRaw;
    private static _monsterCache: Readonly<MonstersRaw> =
        _monsterdata as unknown as MonstersRaw;
    private static _questCache: Readonly<QuestRaw> =
        _questdata;

    private static _monsterIDs: Readonly<string[]> =
        Object.keys(_monsterdata).filter((e: string) => _monsterdata.hasOwnProperty(e));
    private static _questIDs: Readonly<string[]> =
        Object.keys(_questdata).filter((e: string) => _questdata.hasOwnProperty(e));

    private static _numOfMonsters: Readonly<number> =
        MonsterHunterDecisions._monsterIDs.length;
    private static _numOfQuests: Readonly<number> =
        MonsterHunterDecisions._questIDs.length;

    constructor() { throw new Error("This class is not to be instantiated.") }

    public static getItemData(): ItemsRaw {
        return this._itemCache;
    }

    public static getMonsterData(): ItemsRaw {
        return this._monsterCache;
    }

    public static getQuestData(): ItemsRaw {
        return this._itemCache;
    }

    public static findQuests(_criteria: ISearchCriteria): ISearchResult {
        const critMonsters: ISearchMonsterItem[] = _criteria.monsters || [];
        const critExcludeQuests: (string)[] = _criteria.excludeQuests || [];
        const critIncludeMaterials: (string)[] = _criteria.includeMaterials || [];
        const relevantQuests: QuestID[] = [];

        // iterate over quests
        for(let q = 0; q < this._numOfQuests; q++) {
            const currQID: QuestID = this._questIDs[q];
            const currQuest: QuestData = this._questCache[currQID];
            if(currQID === "default") continue; // fixme: hacky fix for JSON loading

            if(
                critExcludeQuests.indexOf(currQID) !== -1 ||
                !this.detectExclusions(_criteria, currQuest)
            ) {
                debugLog(`Quest ${currQID} contains excluded values; skipping...`);
                continue;
            }

            if(critIncludeMaterials.length > 0) {
                // iterate over quest monsters
                let proceed: boolean = false;
                for (const mon of currQuest.monsters) {
                    const monData: MonsterData = this._monsterCache[mon];

                    // Iterate over types of monster drop
                    for(let x = 0; x < MONSTER_REWARDS.NUM_OF_REWARDS; x++) {
                        // if the criteria includes any of the current list of items
                        const currItems: MonsterDropData[] = monData.items[currQuest.rank][x];
                        currItems.forEach((_item: MonsterDropData) => {
                            if(critIncludeMaterials.indexOf(_item.id) !== -1) {
                                // good quest, proceed
                                proceed = true;
                            }
                        });
                        if(proceed) break;
                    }
                    if(proceed) break;
                }
                if(!proceed) {
                    // quest doesn't have any relevant items, move on
                    debugLog(`Quest ${currQID} does not contain specified items; skipping...`);
                    continue;
                }
            }

            // iterate over specified search monsters
            if(critMonsters.length > 0) {
                critMonsters.forEach((_m: ISearchMonsterItem) => {
                    // if quest contains specified monster
                    const ind: number = currQuest.monsters.indexOf(_m.id);
                    if(ind !== -1) {
                        relevantQuests.push(currQID);
                    }
                });
            } else {
                // user did not specify a target monster; skip check
                relevantQuests.push(currQID);
            }
        }

        debugLogObj(relevantQuests);
        return {
            quests: relevantQuests
        };
    }

    public static getItemNameFromID(_id: string, _lang: LANGUAGES): string {
        return this._itemCache[_id].name[_lang];
    }

    private static detectExclusions<T>(_exclusions: ISearchCriteria, _quest: QuestData): boolean {
        let {
            minRating,
            maxRating,
            excludeMonsters
        } = _exclusions;

        if(typeof minRating === "undefined")
            minRating = -1;

        if(typeof maxRating === "undefined")
            maxRating = Number.MAX_VALUE;

        if(typeof excludeMonsters === "undefined")
            excludeMonsters = [];

        if(
            _quest.rating < minRating ||
            _quest.rating > maxRating
        ) {
            debugLog(`Rating of ${_quest.rating} does not match bounds of ${_exclusions.minRating}-${_exclusions.maxRating}`);
            return false;
        }

        for(const _qMID of _quest.monsters) {
            for(const _mon of excludeMonsters) {
                if(_mon.id === _qMID) {
                    debugLog(`Quest contains excluded monster ${_qMID}`);
                    return false
                }
            }
        }
        return true;
    }
}


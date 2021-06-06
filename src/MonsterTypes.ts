import { QuestID } from "./SharedTypes";

export interface MonsterDropData {
    id: string;
    amount: string;
}

export interface MonsterData {
    name: { [key: string /** LANGUAGES */]: string };
    quests: QuestID[];
    img: string;
    items: {
        [key: string /** RANK */ ]: {
            [key: string /** MONSTER_REWARDS */]: MonsterDropData[]
        }
    }
}

export type MonstersRaw = { [key: string]: MonsterData }

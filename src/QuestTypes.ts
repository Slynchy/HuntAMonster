import { RANK } from "./Enums";
import { MonsterID } from "./SharedTypes";

export interface QuestData {
    name:       { [key: string /** LANGUAGES */]: string };
    objective:  { [key: string /** LANGUAGES */]: string };
    monsters:   MonsterID[];
    rank:       RANK;
    rating:     number;
}
export type QuestRaw = { [key: string]: QuestData };

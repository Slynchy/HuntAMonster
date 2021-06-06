import { MonsterData } from "./MonsterTypes";

export interface ItemData {
    name: { [key: string /** LANGUAGES */]: string };
}

export type ItemsRaw = {
    [key: string /** Item ID */ ]: MonsterData
}

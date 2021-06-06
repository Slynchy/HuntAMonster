export interface ISearchMonsterItem {
   id: string;
   targetRequired?: boolean;
}

export interface ISearchCriteria {
    monsters?: ISearchMonsterItem[];
    excludeMonsters?: string[];
    excludeQuests?: string[];
    includeMaterials?: string[];
    minRating?: number;
    maxRating?: number;
}

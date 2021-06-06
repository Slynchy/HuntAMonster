export interface ISearchMonsterItem {
   id: string;
   targetRequired?: boolean;
}

export interface ISearchCriteria {
    monsters?: ISearchMonsterItem[];
    excludeMonsters?: ISearchMonsterItem[];
    excludeQuests?: string[];
    includeMaterials?: string[];
    minRating?: number;
    maxRating?: number;
}

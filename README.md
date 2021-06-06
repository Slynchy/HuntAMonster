# HuntAMonster

An npm module written in Typescript that can find quests for Monster Hunter: Rise matching specified parameters (e.g. possible monsters, items/materials, HR, etc.)

## Install

### To install to your project:

`npm install --save-dev huntamonster`

### To develop locally:

* Clone this repository
* Run `npm install` in the root directory of this repository
* Run `npm run build` to build library/module
* Run `npm test` to run lint and unit tests

## Usage

````
import { 
    HuntAMonster
} from "huntamonster";

// You can access the raw data to fetch things like item names <-> ids
HuntAMonster.getItemData();
HuntAMonster.getMonsterData();
HuntAMonster.getQuestData();

// Once you know the IDs of what you need to find, you can plug them
// into the search property object like so:
HuntAMonster.findQuests({

    // Mizutsune
    monsters: [{id: "082_00"}],

    // Goss Harag
    excludeMonsters: [{id: "097_00"}],

    // "Ruckus in the Ruins"
    excludeQuests: ["010715"],

    // Bubblefoam+
    includeMaterials: ["normal_0308"],

    minRating: 2,

    maxRating: 7

});

/** Output:
    {
      quests: [
        '010602', '010606',
        '010609', '010612',
        '010614', '010615',
        '010616', '010618',
        '010707', '010709',
        '010730', '010733',
        '010736', '010740',
        '010744'
      ]
    }
*/


````

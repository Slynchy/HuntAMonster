import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';
import { expect } from 'chai';
import { MonsterHunterDecisions } from "../src/MonsterHunterDecisions";
import * as data from "../src/monsters.json";
import * as questData from "../src/quests.json";
import { LANGUAGES, RANK } from "../src/Enums";

_chai.should();
@suite class HelloWorldTests {

    before() {}

    @test
    'should not be able to instantiate module'(): any {
        let err;
        try {
            const module: MonsterHunterDecisions = new MonsterHunterDecisions();
        } catch(_err) { err = _err }
        expect(Boolean(err)).to.equal(true);
    }

    @test
    'Fetching item ID "normal_0308" in "en" should return "Bubblefoam+"'(): any {
        expect(
            MonsterHunterDecisions.getItemNameFromID("normal_0308", LANGUAGES.en)
        ).to.equal(
            "Bubblefoam+"
        );
    }

    @test
    'Fetching item ID "normal_0308" in "ja" should return "泡立つ上滑液"'(): any {
        expect(
            MonsterHunterDecisions.getItemNameFromID("normal_0308", LANGUAGES.ja)
        ).to.equal(
            "泡立つ上滑液"
        );
    }

    @test
    'an empty search should return all quests'(): any {
        const questsLength: number = Object.keys(questData).length - 1;
        const result: number = MonsterHunterDecisions.findQuests({}).quests.length;
        expect(result).to.equal(questsLength);
    }

    @test
    'two identical searches should return the same result'(): any {
        function runTest() {
            return MonsterHunterDecisions.findQuests({
                monsters: [{
                    id: "082_00"
                }]
            })
        }
        const result: string[] = runTest().quests;
        const result2: string[] = runTest().quests;
        expect(result.length).to.equal(result2.length);
    }

    @test
    'a Mizutsune-only search should return same number of quests as all Mizutsune quests'(): any {
        const mizutsuneQuestsLength: number = data["082_00"].quests.length;
        const result: number = MonsterHunterDecisions.findQuests({
            monsters: [{
                id: "082_00"
            }]
        }).quests.length;
        expect(result).to.equal(mizutsuneQuestsLength);
    }

    @test
    'a Mizutsune-only search but excluding Goss Harag should return a different number less-than the total Mizutsune quests'(): any {
        const mizutsuneQuestsLength: number = data["082_00"].quests.length;
        const result: number = MonsterHunterDecisions.findQuests({
            monsters: [{
                id: "082_00"
            }],
            excludeMonsters: [{id: "097_00"}]
        }).quests.length;
        expect(
            result,
            "Search results number greater-than-or-equal-to the number of total Mizutsune quests"
        ).to.be.below(mizutsuneQuestsLength);
    }

    @test
    'a Mizutsune-only search but excluding HR7 quests should return a different number less-than the total Mizutsune'(): any {
        const mizutsuneQuestsLength: number = data["082_00"].quests.length;
        const result: number = MonsterHunterDecisions.findQuests({
            monsters: [{
                id: "082_00"
            }],
            minRating: -1,
            maxRating: 6
        }).quests.length;
        expect(
            result,
            "Search results number greater-than-or-equal-to the number of total Mizutsune quests"
        ).to.be.below(mizutsuneQuestsLength);
    }

    @test
    'a search for a HR Mizutsune-only item should return only all HR Mizutsune quests'(): any {
        // Get num of Mizu HR quests
        const mizutsuneHRQuestsLength: number =
            data["082_00"].quests.filter((e) => questData[e].rank === RANK.HIGH).length;

        // Do search for Mizutsune quests with item from HR Mizu
        const result = MonsterHunterDecisions.findQuests({
            includeMaterials: ["normal_0308"]
        });

        // Check if all quests are HR
        let pass: boolean = true;
        for(const i of result.quests) {
            if(questData[i].rank !== RANK.HIGH) {
                pass = false;
                break;
            }
        }

        expect(
            pass,
            "Search results yielded quests in a rank other than HIGH"
        ).to.be.equal(true);

        expect(
            mizutsuneHRQuestsLength,
            "Search results length is not equal to number of Mizutsune HR quests"
        ).to.be.equal(result.quests.length);
    }


}

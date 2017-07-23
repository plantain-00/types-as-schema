/**
 * @entry match-schema.json
 * @uniqueItems
 */
export type Groups = Group[];

export type Group = {
    /**
     * @uniqueItems
     */
    matches: Match[];
    teams: Teams;
    /**
     * @itemType integer
     * @itemMinimum 1
     * @minItems 1
     * @uniqueItems
     */
    tops: number[];
};

export type Match = {
    a: string;
    b: string;
    /**
     * @minItems 1
     * @uniqueItems
     */
    possibilities: {
        /**
         * @type integer
         */
        a: number;
        /**
         * @type integer
         */
        b: number;
    }[];
};

/**
 * @uniqueItems
 */
export type Teams = string[];

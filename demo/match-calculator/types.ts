/**
 * @entry groups-schema.json
 * @uniqueItems
 * @minItems 1
 */
export type Groups = Group[];

export type Group = {
    /**
     * @uniqueItems
     * @minItems 1
     */
    matches: Match[];
    teams: Teams;
    /**
     * @itemType integer
     * @itemMinimum 1
     * @uniqueItems
     * @minItems 1
     */
    tops: number[];
};

export type Match = {
    a: string;
    b: string;
    /**
     * @uniqueItems
     * @minItems 1
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
 * @entry teams-schema.json
 * @uniqueItems
 * @minItems 1
 */
export type Teams = string[];

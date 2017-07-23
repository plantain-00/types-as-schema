/**
 * @entry match-schema.json
 */
export type Groups = Group[];

export type Group = {
    matches: Match[];
    teams: string[];
    tops: number[];
};

export type Match = {
    a: string;
    b: string;
    possibilities: {
        a: number;
        b: number;
    }[];
};

export type Teams = string[];

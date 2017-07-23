/**
 * @entry request-protocol
 */
export type RequestProtocol = {
    /**
     * @tag 2
     * @type uint32
     */
    requestId?: number;
    /**
     * @tag 3
     */
    error?: string;
};

export type SearchLogsResult = {
    /**
     * @tag 1
     * @type uint32
     */
    total: number;
    /**
     * @tag 2
     */
    logs: Log[];
};

export type SampleFrame = {
    /**
     * @tag 1
     */
    time: string;
    /**
     * @tag 2
     */
    samples?: Sample[];
};

export type Flow =
    {
        kind: FlowKind.log;
        log: Log;
    } | {
        kind: FlowKind.sample;
        sample: Sample;
    };

export const enum FlowKind {
    log = "log",
    sample = "sample",
}

export type Log = {
    /**
     * @tag 1
     */
    time: string;
    /**
     * @tag 2
     */
    content: string;
    /**
     * @tag 3
     */
    filepath: string;
    /**
     * @tag 4
     */
    hostname: string;
};

export type Sample = {
    /**
     * @tag 1
     */
    hostname: string;
    /**
     * @type uint32
     * @tag 2
     */
    port?: number;
    /**
     * @tag 3
     * @mapValueType uint32
     */
    values: { [name: string]: number };
};

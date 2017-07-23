/**
 * @entry request-protocol
 */
export type RequestProtocol = {
    /**
     * @type uint32
     */
    requestId?: number;
    error?: string;
};

export const enum RequestProtocolKind {
    searchLogs = "search logs",
    searchSamples = "search samples",
    resaveFailedLogs = "resave failed logs",
}

export type SearchLogs = {
    content: string;
    time: string;
    hostname: string;
    /**
     * @type uint32
     */
    from: number;
    /**
     * @type uint32
     */
    size: number;
};

type SearchSamples = {
    from: string;
    to: string;
};

export type SearchLogsResult = {
    /**
     * @type uint32
     */
    total: number;
    logs: Log[];
};

export type SampleFrame = {
    time: string;
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
    time: string;
    content: string;
    filepath: string;
    hostname: string;
};

export type Sample = {
    hostname: string;
    /**
     * @type uint32
     */
    port?: number;
    /**
     * @mapValueType uint32
     */
    values: { [name: string]: number };
};

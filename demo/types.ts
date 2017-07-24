/**
 * @entry request-protocol.json
 */
export type RequestProtocol = {
    /**
     * @type uint32
     */
    requestId: number;
} & (
        {
            kind: RequestProtocolKind.searchLogs,
            searchLogs: SearchLogs;
        } | {
            kind: RequestProtocolKind.searchSamples,
            searchSamples: SearchSamples;
        } | {
            kind: RequestProtocolKind.resaveFailedLogs,
        }
    );

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

/**
 * @entry response-protocol.json
 */
export type ResponseProtocol =
    {
        kind: ProtocolKind.flows,
        flows: Flows,
    } | {
        kind: ProtocolKind.historySamples,
        historySamples?: SampleFrame[];
    } | {
        kind: ProtocolKind.searchLogsResult,
        searchLogsResult: SearchLogsResult;
    } | {
        kind: ProtocolKind.searchSamplesResult,
        searchSamplesResult: SearchSamplesResult;
    } | {
        kind: ProtocolKind.resaveFailedLogsResult,
        resaveFailedLogsResult: ResaveFailedLogsResult;
    };

export const enum ProtocolKind {
    flows = "flows",
    historySamples = "history samples",
    searchLogsResult = "search logs result",
    searchSamplesResult = "search samples result",
    resaveFailedLogsResult = "resave failed logs result",
}

type Flows = {
    serverTime: string;
    flows: Flow[];
};

export type SearchLogsResult = {
    /**
     * @type uint32
     */
    requestId: number;
} & (
        {
            kind: ResultKind.success;
            /**
             * @type uint32
             */
            total: number;
            logs?: Log[];
        } | {
            kind: ResultKind.fail
            error: string;
        }
    );

type SearchSamplesResult = {
    /**
     * @type uint32
     */
    requestId: number;
} & (
        {
            kind: ResultKind.success,
            searchSampleResult?: SampleFrame[];
        } | {
            kind: ResultKind.fail
            error: string;
        }
    );

export type ResaveFailedLogsResult = {
    /**
     * @type uint32
     */
    requestId: number;
} & (
        {
            kind: ResultKind.success;
            /**
             * @type uint32
             */
            savedCount: number;
            /**
             * @type uint32
             */
            totalCount: number;
        } | {
            kind: ResultKind.fail
            error: string;
        }
    );

export const enum ResultKind {
    success = "success",
    fail = "fail",
}

export type SampleFrame = {
    time: string;
    samples?: Sample[];
};

/**
 * @entry flow-protocol.json
 */
export type FlowProtocol = {
    flows: Flow[];
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

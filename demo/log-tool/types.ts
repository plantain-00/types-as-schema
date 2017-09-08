/**
 * @entry request-protocol.json
 */
export type RequestProtocol = {
    requestId: uint32;
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

type uint32 = number;

export const enum RequestProtocolKind {
    searchLogs = "search logs",
    searchSamples = "search samples",
    resaveFailedLogs = "resave failed logs",
}

export type SearchLogs = {
    content: string;
    time: string;
    hostname: string;
    from: uint32;
    size: uint32;
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
    requestId: uint32;
} & (
        {
            kind: ResultKind.success;
            total: uint32;
            logs?: Log[];
        } | {
            kind: ResultKind.fail
            error: string;
        }
    );

type SearchSamplesResult = {
    requestId: uint32;
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
    requestId: uint32;
} & (
        {
            kind: ResultKind.success;
            savedCount: uint32;
            totalCount: uint32;
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
    port?: uint32;
    /**
     * @mapValueType uint32
     */
    values: { [name: string]: number };
};

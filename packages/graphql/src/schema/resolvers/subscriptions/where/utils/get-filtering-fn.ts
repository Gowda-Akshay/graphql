/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import type { AttributeAdapter } from "../../../../../schema-model/attribute/model-adapters/AttributeAdapter";

type ComparatorFn<T> = (received: T, filtered: T, fieldMeta?: AttributeAdapter) => boolean;

const legacyOperatorCheckMap = {
    EQ: (received: string, filtered: string) => received == filtered,

    LT: (received: number | string, filtered: number) => {
        const parsed = typeof received === "string" ? BigInt(received) : received;
        return parsed < filtered;
    },

    LTE: (received: number, filtered: number) => {
        const parsed = typeof received === "string" ? BigInt(received) : received;
        return parsed <= filtered;
    },

    GT: (received: number, filtered: number) => {
        const parsed = typeof received === "string" ? BigInt(received) : received;
        return parsed > filtered;
    },

    GTE: (received: number | string, filtered: number) => {
        const parsed = typeof received === "string" ? BigInt(received) : received;
        return parsed >= filtered;
    },

    STARTS_WITH: (received: string, filtered: string) => received.startsWith(filtered),
    ENDS_WITH: (received: string, filtered: string) => received.endsWith(filtered),
    CONTAINS: (received: string, filtered: string) => received.includes(filtered),

    STARTS_WITH_CASE_INSENSITIVE: (received: string, filtered: string) =>
        received.toLowerCase().startsWith(filtered.toLowerCase()),

    ENDS_WITH_CASE_INSENSITIVE: (received: string, filtered: string) =>
        received.toLowerCase().endsWith(filtered.toLowerCase()),

    CONTAINS_CASE_INSENSITIVE: (received: string, filtered: string) =>
        received.toLowerCase().includes(filtered.toLowerCase()),

    INCLUDES: (received: [string | number], filtered: string | number) => {
        return received.some((v) => v === filtered);
    },

    IN: (received: string | number, filtered: [string | number]) => {
        return filtered.some((v) => v === received);
    },
};

const operatorCheckMap = {
    ...legacyOperatorCheckMap,

    eq: legacyOperatorCheckMap.EQ,
    lt: legacyOperatorCheckMap.LT,
    lte: legacyOperatorCheckMap.LTE,
    gt: legacyOperatorCheckMap.GT,
    gte: legacyOperatorCheckMap.GTE,

    startsWith: legacyOperatorCheckMap.STARTS_WITH,
    endsWith: legacyOperatorCheckMap.ENDS_WITH,
    contains: legacyOperatorCheckMap.CONTAINS,

    startsWithCaseInsensitive: legacyOperatorCheckMap.STARTS_WITH_CASE_INSENSITIVE,
    endsWithCaseInsensitive: legacyOperatorCheckMap.ENDS_WITH_CASE_INSENSITIVE,
    containsCaseInsensitive: legacyOperatorCheckMap.CONTAINS_CASE_INSENSITIVE,

    includes: legacyOperatorCheckMap.INCLUDES,
    in: legacyOperatorCheckMap.IN,
};

export function getFilteringFn<T>(
    operator: string | undefined,
    overrides?: Record<string, (received: any, filtered: any, fieldMeta?: any) => boolean>
): ComparatorFn<T> {
    if (!operator) {
        return (received: T, filtered: T) => received === filtered;
    }

    const operators = { ...operatorCheckMap, ...overrides };

    const comparatorFunction = operators[operator];
    if (!comparatorFunction) {
        throw new Error(`Operator ${operator} not supported`);
    }
    return comparatorFunction;
}

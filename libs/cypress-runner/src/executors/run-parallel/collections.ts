// Function 'toPlainObjectDeep' was tedious and complex to type in a generic way.
// As I could not figure out a way, I finally ignored the 'no-any' rule for simplicity
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    reduce,
    snakeCase,
    forEach,
    map,
} from 'lodash';

export type AnyObject = Record<string, any> | null | undefined;

export const isKeyValueObject = (obj: unknown) =>
    Object.prototype.toString.call(obj) === '[object Object]';

/**
 *
 * @param obj object containing the keys to be converted
 * @param deepConvert will convert deep nested keys to snake case. Defaults to true
 * @returns a new object with every key converted to snake case
 */
export const toSnakeCaseKeys = (
    obj: AnyObject,
    deepConvert = true
): AnyObject =>
    obj &&
    reduce(
        obj,
        (acc, value, key) => {
            return {
                ...acc,
                [snakeCase(key)]:
                    deepConvert && isKeyValueObject(value)
                        ? toSnakeCaseKeys(value as Record<string, unknown>)
                        : value,
            };
        },
        {}
    );

/**
 * Convert any key-value object or class object using a the converter parameter function.
 * Only objects will be converted, any other type of value will be preserved:
 * - Function
 * - Array
 * - Primitives
 * - Null
 * - Undefined
 * @param param
 * @param converter
 * @returns converted object
 */
export const convertObjectsDeep = (
    param: any,
    converter: (o: AnyObject[] | AnyObject) => any
): AnyObject[] | AnyObject => {
    // Check if param is non-object
    if (!param) return param;
    if (Array.isArray(param))
        return map(param, (item) => convertObjectsDeep(item, converter));
    if (typeof param !== 'object') return param;

    const copy = converter(param); // Loose copy of the object

    // At this point, param can be converted again into an array or undefined value,
    // so we have to perform the same checks as in the beginning of the function
    if (!copy) return copy;
    if (Array.isArray(copy))
        return map(copy, (item) => convertObjectsDeep(item, converter));
    if (typeof copy !== 'object') return copy;

    // 'copy' is an object at this point, proceed iterating through its keys and values
    forEach(copy, (value: any, key: string) => {
        if (typeof value === 'object')
            copy[key] = convertObjectsDeep(value, converter);
    });

    return copy;
};
type WeightedItem<T> = T & {
    weight: number;
};

/**
 *
 * Split the 'array' in 'N' chunks in such a way that:
 * - Takes an 'array' of WeightedItem<T>, containing a 'weight' field for each element.
 * IMPORTANT: The array is assumed to be sorted in descending order of weights
 * - Assigns an element of the array to the first chunk found with the lowest sum of weights (greedy)
 * - If there is more than one chunk with the same minimum sum, it assigns the element to the chunk with less items
 */
export function greedySplitIntoChunksWithMinimumWeight<T>(
    array: WeightedItem<T>[],
    N: number
): WeightedItem<T>[][] {
    // Initialize empty chunks and their sums
    const chunks = Array.from({length: N}, () => [] as WeightedItem<T>[]);
    const sums = Array.from({length: N}, () => 0);

    // For each item, add it to the chunk with the smallest current sum or fewer items if sums are equal
    for (const item of array) {
        let minSumIdx = 0;
        let minSum = sums[0];
        let minItemsCount = chunks[0].length;

        for (let i = 1; i < N; i++) {
            // If current sum is less than the smallest found sum, update minSum and minSumIdx
            if (sums[i] < minSum) {
                minSum = sums[i];
                minSumIdx = i;
                minItemsCount = chunks[i].length;
            } else if (sums[i] === minSum) {
                // If current sum is equal to the smallest found sum, check the chunk size
                if (chunks[i].length < minItemsCount) {
                    minSumIdx = i;
                    minItemsCount = chunks[i].length;
                }
            }
        }

        chunks[minSumIdx] = [...chunks[minSumIdx], item];
        sums[minSumIdx] += item.weight;
    }

    return chunks;
}

export function shardArray<T>(
    array: T[],
    numShards: number,
    shardIndex: number
): T[] {
    if (numShards > array.length)
        throw Error('Number of shards cannot be greater than the array size');

    if (shardIndex < 0 || shardIndex >= numShards)
        throw Error(`Illegal shard index. Min: 0 - Max: ${numShards - 1}`);

    const numIterations = Math.ceil(array.length / numShards);
    const result: T[] = [];

    for (let i = 0; i < numIterations; i++) {
        const idx = shardIndex + i * numShards;

        if (idx >= array.length) continue;

        result.push(array[shardIndex + i * numShards]);
    }

    return result;
}

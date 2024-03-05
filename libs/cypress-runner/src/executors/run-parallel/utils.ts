export function parseShardString(s: string) {
    const split = s?.split('/');
    const shardIndex = parseInt(split?.[0], 10);
    const numShards = parseInt(split?.[1], 10);

    if (split?.length > 2 || isNaN(shardIndex) || isNaN(numShards))
        throw Error('Wrong shard string format. Must be "$number/$number"');

    return { shardIndex: shardIndex - 1, numShards };
}

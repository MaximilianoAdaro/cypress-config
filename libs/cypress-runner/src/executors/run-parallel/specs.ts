import {glob} from 'glob';
import {greedySplitIntoChunksWithMinimumWeight, shardArray} from "./collections";

interface GetWeightedSpecsChunksOptions {
    specFiles: string[];
    numChunks: number;
    numShards?: number;
    shardIndex?: number;
}

export async function getSpecFiles({
                                       specPattern,
                                       cwd,
                                       ignorePattern,
                                   }: {
    specPattern: string;
    cwd: string;
    ignorePattern?: string;
}) {
    return glob(specPattern, {
        cwd,
        absolute: true,
        ignore: ignorePattern,
    });
}

export async function getWeightedSpecs({specFiles}: {
    specFiles: string[];
}) {
    return specFiles.map((spec) => ({
        spec,
        weight:
            0,
    }));
}

export async function getWeightedSpecsChunks({
                                                 specFiles,
                                                 numChunks,
                                                 numShards = 1,
                                                 shardIndex = 0,
                                             }: GetWeightedSpecsChunksOptions) {
    const specsWithWeights = await getWeightedSpecs({
        specFiles,
    });
    return greedySplitIntoChunksWithMinimumWeight(
        shardArray(specsWithWeights, numShards, shardIndex),
        numChunks
        // Iterate over the chunks and retrieve only the spec paths
    ).map((chunk) => chunk.map(({spec}) => spec));
}

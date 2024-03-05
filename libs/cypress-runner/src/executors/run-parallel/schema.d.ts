export interface RunParallelExecutorSchema {
  threads?: number;
  runTarget: string;
  specPattern: string;
  ignorePattern?: string;
  failFast?: true;
  updateWeightsFile?: true;
  shard?: string;
}

export interface CypressExecutorSchema {
  cypressConfig: string;
  key: string;
  headless?: boolean;
}

declare module 'jsfive' {
  export class Dataset {
    value: number[] | Float32Array | Float64Array | string[];
    shape: number[];
    attrs: Record<string, unknown>;
  }

  export class Group {
    keys: string[];
    attrs: Record<string, unknown>;
    get(name: string): Dataset | Group | null;
  }

  export class File extends Group {
    constructor(buffer: ArrayBuffer, filename?: string);
  }
}

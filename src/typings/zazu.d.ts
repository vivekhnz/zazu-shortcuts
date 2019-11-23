export type ZazuRootScript<TVariables, TValue> = (context: ZazuContext) => {
    respondsTo: (query: string, env: TVariables) => boolean
    search: (query: string, env: TVariables) => Promise<ZazuResult<TValue>[]>;
};

export type ZazuPrefixScript<TVariables, TValue> = (context: ZazuContext) =>
    (value: TValue) => Promise;

interface ZazuContext { }

interface ZazuResult<TValue> {
    icon?: string;
    title?: string;
    subtitle?: string;
    value?: TValue;
}
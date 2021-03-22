export const RE_HOT = /import\.meta\.hot/;

export const isHot = (code: string) => RE_HOT.test(code);

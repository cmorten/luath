export const RE_QUERYSTRING = /\?.*$/;
export const RE_HASH = /#.*$/;

export const stripUrl = (url: string) =>
  url.replace(RE_QUERYSTRING, "").replace(RE_HASH, "");

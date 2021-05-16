export const isBareImportSpecifier = (address: string) => {
  if (
    address.startsWith("/") || address.startsWith("./") ||
    address.startsWith("../") ||
    address.startsWith("http://") || address.startsWith("https://") ||
    address.startsWith("file://")
  ) {
    return false;
  }

  return true;
};

export type ScriptLibraryConfig = {
  native?: boolean;
  prerelease?: boolean;
  dependencies: {
    [library: string]: string;
  };
};

interface PackOptions {
  directories: {
    source: string;
    build: string;
    development: string;
  };
  generate_contents?: boolean;
}

export interface ResourcePackOptions extends PackOptions {
  textures?: {
    generate_list?: boolean;
  };
}

export interface BehaviorPackOptions extends PackOptions {
  scripts?: {
    entry: string;
    automatic_reload?: boolean | { port: number };
    bundle?: boolean;
    minify?: boolean;
    source_map?: boolean;
    tree_shake?: boolean;
    dependencies: {
      [library: string]: string;
    };
  };
}

export type CreationTarget = "stable" | "preview";

export type AddonCreationConfig = {
  type: "addon" | "editor_extension";
  target: CreationTarget;
  behavior_pack?: BehaviorPackOptions;
  resource_pack?: ResourcePackOptions;
};

export type ScriptLibraryCreationConfig = {
  type: "script_library";
  target: CreationTarget;
  directories: {
    source: string;
    development: string;
    build: string;
  };
  entries: string[];
  bundle?: boolean;
  minify?: boolean;
  source_map?: boolean;
  tree_shake?: boolean;
  dependencies: {
    [library: string]: string;
  };
};

export type CreationConfig = AddonCreationConfig | ScriptLibraryCreationConfig;

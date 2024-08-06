type VersionVector = [number, number, number];

export interface PackManifestMetadata {
  url?: string;
  authors?: string[];
  license?: string;
  generated_with?: Record<string, string[]>;
}
export interface PackManifestHeader {
  name: string;
  description: string;
  uuid: string;
  version: VersionVector | string;
  min_engine_version: VersionVector;
  pack_scope?: "any" | "global" | "world";
  allow_random_seed?: boolean;
  base_game_version?: VersionVector;
  lock_template_options?: boolean;
}
export interface PackManifestModule {
  description?: string;
  type: "resources" | "data" | "script" | "world_template";
  language?: "javascript";
  entry?: string;
  uuid: string;
  version: VersionVector | string;
}
export interface PackManifestDependency {
  module_name?: string;
  uuid?: string;
  version: VersionVector | string;
}
export type PackManifestCapability = "chemistry" | "editorExtension" | "raytaced" | "pbr" | "script_eval";

export type PackManifest = {
  format_version: 2;
  metadata?: PackManifestMetadata;
  header: PackManifestHeader;
  modules: PackManifestModule[];
  dependencies?: PackManifestDependency[];
  capabilities?: PackManifestCapability[];
};

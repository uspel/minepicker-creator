import { AddonCreationConfig } from "../../../types/creation";

import devBehaviorPack from "./behaviorPack";
import devResourcePack from "./resourcePack";

export default function devAddon({ behavior_pack, resource_pack }: AddonCreationConfig) {
  if (behavior_pack) devBehaviorPack(behavior_pack);
  if (resource_pack) devResourcePack(resource_pack);
}

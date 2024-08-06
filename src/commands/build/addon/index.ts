import { AddonCreationConfig } from "../../../types/creation";
import message from "../../../utils/message";

import buildBehaviorPack from "./behaviorPack";
import buildResourcePack from "./resourcePack";

export default async function buildAddon({ behavior_pack, resource_pack, type }: AddonCreationConfig) {
  message(`Building your ${type === "addon" ? "add-on" : "Editor extension"}...\n`);

  if (behavior_pack) buildBehaviorPack(behavior_pack);
  if (resource_pack) buildResourcePack(resource_pack);
}

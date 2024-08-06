import Data from "../../../data";
import { PackManifest } from "../../../types/manifest";

export default async function updateGeneratedWith(manifest: PackManifest) {
  if (!manifest.metadata || typeof manifest.metadata !== "object") {
    manifest.metadata = {};
  }
  if (!manifest.metadata.generated_with || typeof manifest.metadata.generated_with !== "object") {
    manifest.metadata.generated_with = {};
  }

  const generatedWith = manifest.metadata.generated_with;
  const { name, version } = Data.package;

  if (generatedWith[name] && Array.isArray(generatedWith[name])) {
    if (!generatedWith[name].includes(version)) generatedWith[name].push(version);
  } else {
    generatedWith[name] = [version];
  }
}

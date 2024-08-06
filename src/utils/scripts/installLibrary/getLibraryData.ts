import supabase from "../../../apis/supabase";
import message from "../../message";

interface ScriptModuleData {
  repository: string;
  tags: string[];
  native: boolean;
}

export default async function getLibraryData(libraryName: string): Promise<ScriptModuleData | null> {
  let { data: library } = await supabase.from("script_library_data").select("repository, tags, native").eq("id", libraryName).maybeSingle();

  if (library === null) {
    message(
      `Library "${libraryName}" does not exist or you do not have access to it. Check that you are online and have not made any spelling mistakes.`,
      "failure"
    );
    return null;
  }

  if (library.tags.includes("bds-only")) {
    message(`Library "${libraryName}" will only work on Bedrock Dedicated Servers, not regular worlds.`, "warning");
  }

  if (library.tags.includes("editor-only")) {
    message(`Library "${libraryName}" will only work in Minecraft Editor extensions, not regular add-ons.`, "warning");
  }

  if (library.tags.includes("bds-editor-only")) {
    message(`Library "${libraryName}" will only work on Bedrock Dedicated Servers or in Minecraft Editor extensions, not regular add-ons.`, "warning");
  }

  return library;
}

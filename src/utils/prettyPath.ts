import { relative } from "path";

export default function prettyPath(path: string, format?: "relative") {
  if (format === "relative") path = relative(process.cwd(), path);

  return path.replace(/\\+/g, "/").replace(/^\//, "");
}

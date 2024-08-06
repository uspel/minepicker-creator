import { format } from "prettier";

export default async function prettifyJson(json: any, printWidth: number = 80) {
  return await format(JSON.stringify(json), {
    parser: "json",
    printWidth,
    tabWidth: 2,
  });
}

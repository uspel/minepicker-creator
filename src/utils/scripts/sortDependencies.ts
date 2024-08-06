export default function sortScriptDependencies(dependencies: Record<string, string>) {
  const entries = Object.entries(dependencies);

  entries.sort((a, b) => {
    return a[0].localeCompare(b[0]);
  });

  const sortedDependencies: Record<string, string> = {};

  for (const [name, version] of entries) {
    sortedDependencies[name] = version;
  }

  return sortedDependencies;
}

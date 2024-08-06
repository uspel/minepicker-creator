import selectLicense from "../prompts/selectLicense";

export type License = NonNullable<Awaited<ReturnType<typeof selectLicense>>>;

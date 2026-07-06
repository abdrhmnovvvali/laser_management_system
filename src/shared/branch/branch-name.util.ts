export type BranchNameLookup = ReadonlyMap<string, string>;

export function lookupBranchName(
  branchId: string | null | undefined,
  branchNames: BranchNameLookup,
): string | null {
  if (!branchId) {
    return null;
  }

  return branchNames.get(branchId) ?? null;
}

export const ROLE_LABEL: Record<string, string> = {
  builder:     "Visionary",
  contributor: "Builder",
}

export function roleLabel(role: string | null | undefined): string {
  if (!role) return "member"
  return ROLE_LABEL[role] ?? role
}

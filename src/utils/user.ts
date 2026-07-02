export function getUserId(
  user: { id?: string; _id?: string } | string | null | undefined
): string | null {
  if (!user) return null;
  if (typeof user === 'string') return user;
  return user.id ?? user._id ?? null;
}
 
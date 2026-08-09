export const ICON_ALIASES: Record<string, string> = {
  // Your current local icons
  gdg: "GDG_Logo",
  hardhat: "hardhat",
  mongo: "mongodb",
  mongodb: "mongodb",
  nest: "nestjs",
  nestjs: "nestjs",
};

export function resolveIconName(query: string): string {
  const clean = query.trim().toLowerCase();
  // Check exact match or case-insensitive filename match
  return ICON_ALIASES[clean] || query.trim();
}
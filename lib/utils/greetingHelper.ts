import type { ContactRole } from "@/lib/types/database";

/**
 * Derive a proper greeting for the contact based on role.
 * Professors/postdocs: "Dr. LastName"; PhD students / lab managers / research scientists: FirstName.
 */
export function getProperGreeting(
  name: string | null,
  role?: ContactRole | string | null
): string {
  if (!name?.trim()) return "Hello";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? name;
  const lastName = parts[parts.length - 1] ?? name;

  const r = (role ?? "professor").toString().toLowerCase();
  if (r === "professor" || r === "postdoc") {
    return `Dr. ${lastName}`;
  }
  if (r === "phd_student" || r === "lab_manager" || r === "research_scientist") {
    return firstName;
  }
  return firstName;
}

import type { LucideIcon } from "lucide-react";
import {
  Globe,
  Brain,
  Leaf,
  Cpu,
  Wrench,
  Heart,
  Wheat,
  FlaskConical,
  Calculator,
} from "lucide-react";

export const RESEARCH_FIELDS: {
  id: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "all", label: "All Fields", icon: Globe },
  { id: "neuroscience", label: "Neuroscience", icon: Brain },
  { id: "biology", label: "Biology", icon: Leaf },
  { id: "cs", label: "Computer Science", icon: Cpu },
  { id: "engineering", label: "Engineering", icon: Wrench },
  { id: "health", label: "Health Sciences", icon: Heart },
  { id: "agriculture", label: "Agriculture", icon: Wheat },
  { id: "psychology", label: "Psychology", icon: Brain },
  { id: "chemistry", label: "Chemistry", icon: FlaskConical },
  { id: "physics", label: "Physics & Math", icon: Calculator },
];

import type { Cta } from "./types";

export const COLLABORATE = {
  label: "Collaborate",
  heading: "Bring a question the system should not answer alone.",
  body: "Cumulant works with researchers, statisticians, domain experts, nonprofit practitioners, engineers, independent reviewers, and data contributors.",
  types: [
    "Research collaboration",
    "Statistical review",
    "Domain expertise",
    "Nonprofit partnership",
    "Replication",
    "Data contribution",
    "Systems engineering",
    "External criticism",
  ],
  primary: { label: "Write to Aryan", href: "mailto:aryan@cumulant.org", external: true } as Cta,
  contactNote:
    "Cumulant is small and early, so there is no inbox to get lost in. Your message reaches Aryan Patel, the founder, directly.",
  contactEmail: "aryan@cumulant.org",
};

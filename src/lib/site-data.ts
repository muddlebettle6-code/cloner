// Barrel for Cumulant Research content. Components import their copy/data from
// here (or directly from @/content/*). Image maps live in @/lib/site-images.
export * from "@/content/site";
export * from "@/content/methods";
export * from "@/content/approach";
export * from "@/content/research";
export * from "@/content/projects";
// NOTE: papers come from a build-time fs loader (@/content/papers). Import it
// DIRECTLY from server components only — never via this barrel, which client
// components also consume.
export * from "@/content/systems";
export * from "@/content/principles";
export * from "@/content/about";
export * from "@/content/collaborate";
export * from "@/content/policies";

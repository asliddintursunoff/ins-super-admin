export const PROGRAMS = ["BM","BUS","CIE","CSE","EMBA","ICE","IT","LOG","MBA"] as const;
export const YEARS = ["freshman","sophomore","junior","senior"] as const;

export type Program = (typeof PROGRAMS)[number];
export type AcademicYear = (typeof YEARS)[number];

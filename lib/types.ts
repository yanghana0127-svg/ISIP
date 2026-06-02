export type Policy = {
  id: string;
  country: string;
  country_slug: string;
  title: string;
  year: number | null;
  length: number;
  industries: string[];
  filename: string;
  source_type: string;
  text: string;
};

export type PolicyMeta = Omit<Policy, "text">;

export type Country = {
  name: string;
  slug: string;
  policy_count: number;
  year_min: number | null;
  year_max: number | null;
};

export type Industry = {
  slug: string;
  name_zh: string;
  name_en: string;
  color: string;
  keywords: string[];
  policy_count: number;
  country_count: number;
};

export type Stats = {
  country_count: number;
  policy_count: number;
  industry_count: number;
  total_chars: number;
};

// ── PRISM ISM structured data (exported by scripts/build_ism_viz.py) ──
export type ISMYearly = {
  country: string;
  slug: string;
  year: number;
  newLaw: number;
  newAmendment: number;
  newEO: number;
  newReg: number;
  totalNew: number;
};

export type ISMPanel = {
  slug: string;
  country: string;
  iso3n: number | null;
  year: number;
  mechanisms: number;
  totalSectors: number;
  coverage: string | null;
  notification: string | null;
  threshold: string | null;
  timeframe: string | null;
  leadAuthority: string | null;
  oecd: number;
  eu: number;
  fiveEyes: number;
  established: number | null;
  groups: Record<string, number>;
  sectors: string[];
  strictness: number;
};

export type ISMCountry = {
  slug: string;
  country: string;
  iso3n: number | null;
  isoA3: string | null;
  latestYear: number;
  established: number | null;
  mechanisms: number;
  totalSectors: number;
  leadAuthority: string | null;
  coverage: string | null;
  notification: string | null;
  threshold: string | null;
  timeframe: string | null;
  oecd: number;
  eu: number;
  fiveEyes: number;
  groups: Record<string, number>;
  sectors: string[];
  strictness: number;
  strictnessRank: number;
};

export type ISMMeta = {
  yearRange: [number, number];
  yearlyRange: [number, number];
  sectorGroups: string[];
  countryCount: number;
  strictness: { weights: Record<string, number>; max: number; note: string };
};

// merged view used by the Countries pages
export type CountryProfile = {
  slug: string;
  name: string;
  policyCount: number;
  yearMin: number | null;
  yearMax: number | null;
  policies: PolicyMeta[];
  industryMix: { slug: string; name: string; color: string; count: number }[];
  ism: ISMCountry | null;
  panel: ISMPanel[];
  yearly: ISMYearly[];
};

export type CountryListItem = {
  slug: string;
  name: string;
  policyCount: number;
  strictness: number | null;
  strictnessRank: number | null;
  mechanisms: number | null;
  totalSectors: number | null;
  oecd: boolean;
  eu: boolean;
  fiveEyes: boolean;
  hasISM: boolean;
};

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

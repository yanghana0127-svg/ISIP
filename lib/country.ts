import "server-only";
import {
  getCountries,
  getIndustries,
  getAllPoliciesMeta,
  getISMCountries,
  getISMPanel,
  getISMYearly,
} from "./data";
import type { CountryListItem, CountryProfile } from "./types";

/** Union of policy-side countries and ISM-side countries, keyed by slug. */
export async function getCountryList(): Promise<CountryListItem[]> {
  const [countries, ism, policies] = await Promise.all([
    getCountries(),
    getISMCountries(),
    getAllPoliciesMeta(),
  ]);
  const ismBySlug = new Map(ism.map((c) => [c.slug, c]));
  const polCount = new Map<string, number>();
  for (const p of policies) {
    polCount.set(p.country_slug, (polCount.get(p.country_slug) ?? 0) + 1);
  }

  const slugs = new Set<string>([
    ...countries.map((c) => c.slug),
    ...ism.map((c) => c.slug),
  ]);
  const nameBySlug = new Map<string, string>();
  for (const c of countries) nameBySlug.set(c.slug, c.name);
  for (const c of ism) if (!nameBySlug.has(c.slug)) nameBySlug.set(c.slug, c.country);

  const list: CountryListItem[] = [];
  for (const slug of Array.from(slugs)) {
    const i = ismBySlug.get(slug);
    list.push({
      slug,
      name: nameBySlug.get(slug) ?? slug,
      policyCount: polCount.get(slug) ?? 0,
      strictness: i?.strictness ?? null,
      strictnessRank: i?.strictnessRank ?? null,
      mechanisms: i?.mechanisms ?? null,
      totalSectors: i?.totalSectors ?? null,
      oecd: i ? i.oecd === 1 : false,
      eu: i ? i.eu === 1 : false,
      fiveEyes: i ? i.fiveEyes === 1 : false,
      hasISM: !!i,
    });
  }
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCountrySlugs(): Promise<string[]> {
  const list = await getCountryList();
  return list.map((c) => c.slug);
}

export async function getCountryProfile(
  slug: string,
): Promise<CountryProfile | null> {
  const [countries, industries, policiesAll, ism, panelAll, yearlyAll] =
    await Promise.all([
      getCountries(),
      getIndustries(),
      getAllPoliciesMeta(),
      getISMCountries(),
      getISMPanel(),
      getISMYearly(),
    ]);

  const ismRec = ism.find((c) => c.slug === slug) ?? null;
  const countryMeta = countries.find((c) => c.slug === slug) ?? null;
  if (!ismRec && !countryMeta) return null;

  const name = countryMeta?.name ?? ismRec?.country ?? slug;
  const policies = policiesAll.filter((p) => p.country_slug === slug);

  // industry mix across the 7 ISIP sectors
  const counts = new Map<string, number>();
  for (const p of policies) {
    for (const ind of p.industries) counts.set(ind, (counts.get(ind) ?? 0) + 1);
  }
  const industryMix = industries
    .map((ind) => ({
      slug: ind.slug,
      name: ind.name_en,
      color: ind.color,
      count: counts.get(ind.slug) ?? 0,
    }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  const years = policies.map((p) => p.year).filter((y): y is number => !!y);

  return {
    slug,
    name,
    policyCount: policies.length,
    yearMin: years.length ? Math.min(...years) : null,
    yearMax: years.length ? Math.max(...years) : null,
    policies,
    industryMix,
    ism: ismRec,
    panel: panelAll
      .filter((p) => p.slug === slug)
      .sort((a, b) => a.year - b.year),
    yearly: yearlyAll
      .filter((y) => y.slug === slug)
      .sort((a, b) => a.year - b.year),
  };
}

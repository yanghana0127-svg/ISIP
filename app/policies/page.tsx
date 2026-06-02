import { getAllPoliciesMeta, getCountries, getIndustries } from "@/lib/data";
import { SearchBar } from "@/components/search-bar";
import { Search } from "lucide-react";

export default async function PoliciesPage() {
  const [policies, countries, industries] = await Promise.all([
    getAllPoliciesMeta(),
    getCountries(),
    getIndustries(),
  ]);

  const sorted = [...policies].sort((a, b) => {
    if (a.country !== b.country) return a.country.localeCompare(b.country);
    return (b.year ?? 0) - (a.year ?? 0);
  });

  return (
    <div className="space-y-6">
      <header className="glass-dark relative overflow-hidden rounded-3xl p-7 text-white">
        <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-[#5ad7e8] to-[#7c5cff] opacity-40 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-white/70">
            <Search className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Policy search
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">
            Search the full corpus of FDI screening laws
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {policies.length} policies across {countries.length} countries.
            Type any keyword for instant search, filter by country or sector.
          </p>
        </div>
      </header>
      <SearchBar
        countries={countries}
        industries={industries}
        initialResults={sorted.slice(0, 60)}
      />
    </div>
  );
}

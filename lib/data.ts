import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Policy, PolicyMeta, Country, Industry, Stats } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

let _policies: Policy[] | null = null;
let _countries: Country[] | null = null;
let _industries: Industry[] | null = null;
let _stats: Stats | null = null;

async function readJson<T>(name: string): Promise<T> {
  const raw = await fs.readFile(path.join(DATA_DIR, name), "utf-8");
  return JSON.parse(raw) as T;
}

export async function getAllPolicies(): Promise<Policy[]> {
  if (!_policies) _policies = await readJson<Policy[]>("policies.json");
  return _policies;
}

export async function getAllPoliciesMeta(): Promise<PolicyMeta[]> {
  const all = await getAllPolicies();
  return all.map((p) => {
    const { text: _t, ...rest } = p;
    void _t;
    return rest;
  });
}

export async function getPolicyById(id: string): Promise<Policy | null> {
  const all = await getAllPolicies();
  return all.find((p) => p.id === id) ?? null;
}

export async function getCountries(): Promise<Country[]> {
  if (!_countries) _countries = await readJson<Country[]>("countries.json");
  return _countries;
}

export async function getIndustries(): Promise<Industry[]> {
  if (!_industries) _industries = await readJson<Industry[]>("industries.json");
  return _industries;
}

export async function getIndustry(slug: string): Promise<Industry | null> {
  const all = await getIndustries();
  return all.find((i) => i.slug === slug) ?? null;
}

export async function getStats(): Promise<Stats> {
  if (!_stats) _stats = await readJson<Stats>("stats.json");
  return _stats;
}

export async function getPoliciesByIndustry(slug: string): Promise<PolicyMeta[]> {
  const all = await getAllPoliciesMeta();
  return all.filter((p) => p.industries.includes(slug));
}

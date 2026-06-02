"use client";

import { useMemo } from "react";
import { ResponsiveNetwork } from "@nivo/network";
import type { ISMCountry } from "@/lib/types";
import { useMounted } from "./nivo-shared";

type Node = { id: string; count: number };
type Link = { source: string; target: string; weight: number; distance: number };

// Sector co-occurrence: which sector groups tend to be screened together.
export function SectorNetwork({
  countries,
  groups,
}: {
  countries: ISMCountry[];
  groups: string[];
}) {
  const mounted = useMounted();

  const { nodes, links } = useMemo(() => {
    const covers = (c: ISMCountry, g: string) => (c.groups?.[g] ?? 0) > 0;
    const count: Record<string, number> = {};
    for (const g of groups) count[g] = countries.filter((c) => covers(c, g)).length;

    const pair: Record<string, number> = {};
    for (const c of countries) {
      const active = groups.filter((g) => covers(c, g));
      for (let i = 0; i < active.length; i++)
        for (let j = i + 1; j < active.length; j++) {
          const k = `${active[i]}|||${active[j]}`;
          pair[k] = (pair[k] ?? 0) + 1;
        }
    }
    const maxPair = Math.max(1, ...Object.values(pair));
    const nodes: Node[] = groups
      .filter((g) => count[g] > 0)
      .map((g) => ({ id: g, count: count[g] }));
    const links: Link[] = Object.entries(pair)
      .filter(([, w]) => w >= 3)
      .map(([k, w]) => {
        const [source, target] = k.split("|||");
        return { source, target, weight: w, distance: 30 + (1 - w / maxPair) * 90 };
      });
    return { nodes, links };
  }, [countries, groups]);

  return (
    <div className="glass-dark rounded-2xl p-5 text-white">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-white">
          Sectors screened together
        </h3>
        <p className="text-xs text-white/65">
          Node size = countries that screen the group · link thickness = how
          often two groups are screened by the same country
        </p>
      </div>
      <div className="h-[440px] w-full">
        {mounted && nodes.length > 0 ? (
          <ResponsiveNetwork
            data={{ nodes, links }}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            linkDistance={(l) => (l as unknown as Link).distance}
            centeringStrength={0.4}
            repulsivity={28}
            nodeSize={(n) => 8 + Math.sqrt((n as unknown as Node).count) * 5}
            activeNodeSize={(n) => 14 + Math.sqrt((n as unknown as Node).count) * 6}
            nodeColor="#5ad7e8"
            nodeBorderWidth={1}
            nodeBorderColor="rgba(255,255,255,0.6)"
            linkThickness={(l) =>
              1 + Math.sqrt((l.data as unknown as Link).weight) * 1.1
            }
            linkColor="rgba(124,145,214,0.4)"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nodeTooltip={({ node }: any) => (
              <div className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-navy-dark shadow-lg">
                {node.id}: {node.data.count} countries
              </div>
            )}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-white/50">
            Loading…
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { NAVY_CATEGORY, RECHARTS_TOOLTIP } from "./nivo-shared";

// Within one sector, how many countries screen each sub-sector/technology.
// Answers "what inside this industry actually draws screening" — the substance
// the policy-count charts miss.
export function SubsectorScreening({
  data,
  total,
}: {
  data: { label: string; count: number }[];
  total: number;
}) {
  const colors = data.map(
    (_, i) => NAVY_CATEGORY[i % NAVY_CATEGORY.length],
  );
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-navy-dark">
          Most-screened sub-sectors
        </h3>
        <p className="text-xs text-navy-mid/70">
          Of {total} countries with ISM data, how many explicitly screen each
          part of this sector
        </p>
      </div>

      {data.length === 0 ? (
        <div className="grid h-[260px] place-items-center text-sm text-navy-mid/50">
          No sub-sector coverage recorded for this sector
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="h-[200px] w-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={92}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="label"
                >
                  {data.map((d, i) => (
                    <Cell
                      key={d.label}
                      fill={colors[i]}
                      stroke="rgba(255,255,255,0.6)"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={RECHARTS_TOOLTIP}
                  formatter={(v) => `${v} countries`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="grid w-full flex-1 grid-cols-1 gap-1.5">
            {data.map((d, i) => (
              <li
                key={d.label}
                className="flex items-center gap-2 text-xs text-navy-mid"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ background: colors[i] }}
                />
                <span className="flex-1 truncate" title={d.label}>
                  {d.label}
                </span>
                <span className="font-mono font-semibold text-navy-dark">
                  {d.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

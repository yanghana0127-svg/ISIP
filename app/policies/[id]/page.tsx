import Link from "next/link";
import { notFound } from "next/navigation";
import { getPolicyById, getIndustries } from "@/lib/data";
import { PolicyText } from "@/components/policy-text";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  ExternalLink,
  Hash,
} from "lucide-react";

export default async function PolicyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const policy = await getPolicyById(params.id);
  if (!policy) notFound();

  const allInd = await getIndustries();
  const indMap = Object.fromEntries(allInd.map((i) => [i.slug, i]));

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* sidebar */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Link
          href="/policies"
          className="inline-flex items-center gap-1 text-sm text-navy-mid hover:text-navy-dark"
        >
          <ArrowLeft className="h-4 w-4" /> 返回政策库
        </Link>

        <div className="glass space-y-3 rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-navy-soft">
            Policy Metadata
          </div>
          <MetaRow icon={<MapPin className="h-3.5 w-3.5" />} label="国家">
            <Link
              href={`/policies?country=${policy.country_slug}`}
              className="font-semibold text-navy-dark hover:text-navy-mid"
            >
              {policy.country}
            </Link>
          </MetaRow>
          {policy.year && (
            <MetaRow icon={<Calendar className="h-3.5 w-3.5" />} label="年份">
              <span className="font-mono font-semibold text-navy-dark">
                {policy.year}
              </span>
            </MetaRow>
          )}
          <MetaRow icon={<FileText className="h-3.5 w-3.5" />} label="字符数">
            <span className="font-mono text-navy-dark">
              {policy.length.toLocaleString()}
            </span>
          </MetaRow>
          <MetaRow icon={<Hash className="h-3.5 w-3.5" />} label="格式">
            <span className="rounded bg-white/55 px-2 py-0.5 text-xs font-semibold uppercase text-navy-dark backdrop-blur-sm">
              {policy.source_type}
            </span>
          </MetaRow>
          {policy.industries.length > 0 && (
            <div className="pt-2">
              <div className="mb-1.5 text-xs text-navy-mid/70">行业标签</div>
              <div className="flex flex-wrap gap-1">
                {policy.industries.map((s) => (
                  <Link
                    key={s}
                    href={`/industry/${s}`}
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                    style={{
                      background: `linear-gradient(135deg, ${indMap[s]?.color ?? "#19376D"}, #19376D)`,
                    }}
                  >
                    {indMap[s]?.name_zh ?? s}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <Link
          href={`/chat?policy=${policy.id}`}
          className="glass-primary flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
        >
          <ExternalLink className="h-4 w-4" /> 就此政策提问 AI
        </Link>
      </aside>

      {/* main */}
      <article className="min-w-0 space-y-4">
        <div className="glass rounded-2xl p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-navy-soft">
            {policy.country} · Policy
          </div>
          <h1 className="mt-1 text-2xl font-bold text-navy-dark md:text-3xl">
            {policy.title}
          </h1>
          <div className="mt-1 text-xs text-navy-mid/70">
            源文件：{policy.filename}
          </div>
        </div>
        <PolicyText text={policy.text} />
      </article>
    </div>
  );
}

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="inline-flex items-center gap-1.5 text-navy-mid/70">
        {icon} {label}
      </span>
      <span>{children}</span>
    </div>
  );
}

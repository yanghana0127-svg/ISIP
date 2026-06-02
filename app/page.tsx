import Link from "next/link";
import { getIndustries, getStats, getCountries } from "@/lib/data";
import { IndustryCard } from "@/components/industry-card";
import { GlobalOverview } from "@/components/charts/global-overview";
import {
  Search,
  MessageSquare,
  Layers,
  FileSearch,
  GitCompare,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";

export default async function HomePage() {
  const [industries, stats, countries] = await Promise.all([
    getIndustries(),
    getStats(),
    getCountries(),
  ]);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="glass-dark relative overflow-hidden rounded-3xl px-8 py-14 text-white">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#576cbc] opacity-50 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-gradient-to-br from-[#5ad7e8] to-[#19376d] opacity-40 blur-3xl" />

        <div className="relative max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5ad7e8]" />
            投资审查智能平台 ISIP
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            一站读懂全球
            <span className="block bg-gradient-to-r from-white via-[#a5d7e8] to-[#7c5cff] bg-clip-text text-transparent">
              投资审查政策与案例
            </span>
          </h1>
          <p className="max-w-2xl text-sm text-white/75 md:text-base">
            汇集 {stats.country_count} 个国家、{stats.policy_count}
            {" "}份外商投资审查法规与 PRISM 历史案例数据，让企业出海、跨境并购前的合规研究从几周缩短到几分钟。
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <StatBadge label="份政策原文" value={stats.policy_count} />
            <StatBadge label="个覆盖国家" value={stats.country_count} />
            <StatBadge label="个行业板块" value={stats.industry_count} />
            <StatBadge
              label="万字语料"
              value={`${(stats.total_chars / 10000).toFixed(0)}`}
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              href="/policies"
              className="glass-button inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-navy-dark"
            >
              <Search className="h-4 w-4" /> 开始检索政策
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <MessageSquare className="h-4 w-4" /> 找 AI 顾问聊聊
            </Link>
          </div>
        </div>
      </section>

      {/* Global overview charts */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-navy-soft" />
          <h2 className="text-xl font-bold text-gradient-navy">
            全球一览
          </h2>
          <span className="text-xs text-navy-mid/60">
            谁立法最多，哪个行业最受关注
          </span>
        </div>
        <GlobalOverview countries={countries} industries={industries} />
      </section>

      {/* Industries */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-navy-mid">
              <Layers className="h-4 w-4" />
              <span className="text-sm font-semibold">按行业看政策</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-gradient-navy">
              选一个你关心的行业，看全球都怎么管
            </h2>
          </div>
          <span className="text-xs text-navy-mid/70">
            共 {industries.length} 个大类
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {industries.map((ind) => (
            <IndustryCard key={ind.slug} ind={ind} />
          ))}
        </div>
      </section>

      {/* Three use cases — user-friendly perspective */}
      <section className="glass rounded-3xl p-7">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gradient-navy">
              AI 顾问能帮你做什么
            </h2>
            <p className="mt-1 text-sm text-navy-mid/80">
              三种使用方式，从查一条政策到出一份完整投资建议
            </p>
          </div>
          <Link
            href="/chat"
            className="hidden text-sm font-semibold text-navy-mid hover:text-navy-dark md:inline-flex md:items-center md:gap-1"
          >
            去对话 <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <UseCaseCard
            icon={<FileSearch className="h-5 w-5" />}
            tag="找一条政策"
            title="问一句话，定位到原文"
            desc="比如「德国半导体并购的申报门槛多少？」 — 系统会从相关国家的法规里找出原条款，附中文解读和原文位置。"
            gradient="from-[#5ad7e8] to-[#576cbc]"
          />
          <UseCaseCard
            icon={<GitCompare className="h-5 w-5" />}
            tag="跨国对比"
            title="连续追问，看多国差异"
            desc="可以接着问「美国和欧盟对中国买家有什么不同？」 — AI 会自动比较多个国家的审查范围、申报门槛、特别条款。"
            gradient="from-[#576cbc] to-[#7c5cff]"
          />
          <UseCaseCard
            icon={<ClipboardCheck className="h-5 w-5" />}
            tag="出投资建议"
            title="一句需求，一份完整报告"
            desc="告诉 AI 你要做的并购（行业、买方、目标国家），它会综合法规、历史案例、最新动态，生成包含风险评估和合规建议的报告。"
            gradient="from-[#7c5cff] to-[#19376d]"
          />
        </div>
      </section>
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs backdrop-blur-md">
      <span className="font-mono text-base font-bold text-white">{value}</span>
      <span className="ml-1.5 text-white/70">{label}</span>
    </div>
  );
}

function UseCaseCard({
  icon,
  tag,
  title,
  desc,
  gradient,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  desc: string;
  gradient: string;
}) {
  return (
    <div className="glass-soft group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 transition hover:-translate-y-0.5">
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-40 blur-2xl transition group-hover:opacity-70`}
      />
      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <span
            className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}
          >
            {icon}
          </span>
          <span
            className={`bg-gradient-to-r ${gradient} bg-clip-text text-xs font-semibold uppercase tracking-wider text-transparent`}
          >
            {tag}
          </span>
        </div>
        <div className="text-lg font-bold text-navy-dark">{title}</div>
        <div className="text-sm leading-relaxed text-navy-mid/85">{desc}</div>
      </div>
    </div>
  );
}

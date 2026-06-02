import Link from "next/link";
import {
  MessageSquare,
  ArrowLeft,
  Sparkles,
  Clock,
  FileSearch,
  GitCompare,
  ClipboardCheck,
} from "lucide-react";

export default function ChatPagePlaceholder() {
  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-navy-mid hover:text-navy-dark"
      >
        <ArrowLeft className="h-4 w-4" /> 返回首页
      </Link>

      <header className="glass-dark relative overflow-hidden rounded-3xl p-8 text-white">
        <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#5ad7e8] opacity-50 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-white/70">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              AI 顾问
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            想问什么，直接说
          </h1>
          <p className="mt-2 text-sm text-white/70">
            从一条法规到一份并购建议，三种使用方式逐层递进
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <UseCase
          icon={<FileSearch className="h-5 w-5" />}
          tag="找一条政策"
          gradient="from-[#5ad7e8] to-[#576cbc]"
          example="德国半导体并购的申报门槛是多少"
          desc="把问题说出来，系统会找到原文段落并附上中文解读。"
        />
        <UseCase
          icon={<GitCompare className="h-5 w-5" />}
          tag="跨国对比"
          gradient="from-[#576cbc] to-[#7c5cff]"
          example="美国和欧盟对中国买家有什么不同"
          desc="接着追问就能看到多国法规的对比分析。"
        />
        <UseCase
          icon={<ClipboardCheck className="h-5 w-5" />}
          tag="出投资建议"
          gradient="from-[#7c5cff] to-[#19376d]"
          example="我要收购德国一家半导体公司，给整套合规建议"
          desc="综合法规、历史案例、最新动态，生成完整报告。"
        />
      </div>

      <div className="glass-soft flex items-start gap-3 rounded-2xl p-6">
        <Clock className="h-5 w-5 shrink-0 text-navy-soft" />
        <div className="space-y-1">
          <h2 className="font-semibold text-navy-dark">对话功能即将上线</h2>
          <p className="text-sm text-navy-mid">
            正在接入向量检索和大模型生成。当前版本可以先在政策检索里用关键词搜索原文。
          </p>
          <Link
            href="/policies"
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-navy-mid hover:text-navy-dark"
          >
            <Sparkles className="h-4 w-4" /> 去政策检索看看
          </Link>
        </div>
      </div>
    </div>
  );
}

function UseCase({
  icon,
  tag,
  gradient,
  example,
  desc,
}: {
  icon: React.ReactNode;
  tag: string;
  gradient: string;
  example: string;
  desc: string;
}) {
  return (
    <div className="glass group relative overflow-hidden rounded-2xl p-5">
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-40 blur-2xl`}
      />
      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <span
            className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}
          >
            {icon}
          </span>
          <span
            className={`bg-gradient-to-r ${gradient} bg-clip-text text-xs font-bold uppercase tracking-wider text-transparent`}
          >
            {tag}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-navy-mid/85">{desc}</p>
        <div className="rounded-xl border border-white/60 bg-white/40 px-3 py-2 text-xs italic text-navy-mid backdrop-blur">
          例：{example}
        </div>
      </div>
    </div>
  );
}

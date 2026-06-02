import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell, PieChart, Pie, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

// ─── Multi-Platform Sample Data ──────────────────────
const PLATFORMS = {
  claude: { label: "Claude", color: "#d4a27a", icon: "🟤" },
  chatgpt: { label: "ChatGPT", color: "#74aa9c", icon: "🟢" },
  gemini: { label: "Gemini", color: "#4285f4", icon: "🔵" },
  perplexity: { label: "Perplexity", color: "#22d3ee", icon: "🩵" },
};

const SAMPLE = {
  brand: "vocus",
  scan_date: "2026-06-03",
  platforms: {
    claude: {
      model: "claude-sonnet-4",
      mention_rate: 72.2,
      avg_position: 2.1,
      sentiment: { positive: 18, neutral: 7, negative: 1 },
      share_of_voice: [
        { name: "Medium", mentions: 30, share: 0.83 },
        { name: "vocus", mentions: 26, share: 0.72, is_target: true },
        { name: "Matters", mentions: 20, share: 0.56 },
        { name: "WordPress", mentions: 18, share: 0.50 },
        { name: "Substack", mentions: 15, share: 0.42 },
        { name: "痞客邦", mentions: 8, share: 0.22 },
        { name: "Blogger", mentions: 4, share: 0.11 },
      ],
      by_category: {
        "品類探索": { rate: 89 },
        "品牌比較": { rate: 100 },
        "推薦請求": { rate: 67 },
        "品牌聲譽": { rate: 100 },
        "品牌認知": { rate: 0 },
      },
    },
    chatgpt: {
      model: "gpt-4o",
      mention_rate: 58.3,
      avg_position: 3.2,
      sentiment: { positive: 12, neutral: 8, negative: 1 },
      share_of_voice: [
        { name: "Medium", mentions: 32, share: 0.89 },
        { name: "WordPress", mentions: 24, share: 0.67 },
        { name: "vocus", mentions: 21, share: 0.58, is_target: true },
        { name: "Substack", mentions: 19, share: 0.53 },
        { name: "Matters", mentions: 14, share: 0.39 },
        { name: "痞客邦", mentions: 10, share: 0.28 },
        { name: "Blogger", mentions: 6, share: 0.17 },
      ],
      by_category: {
        "品類探索": { rate: 67 },
        "品牌比較": { rate: 100 },
        "推薦請求": { rate: 44 },
        "品牌聲譽": { rate: 83 },
        "品牌認知": { rate: 0 },
      },
    },
    gemini: {
      model: "gemini-2.5-flash",
      mention_rate: 44.4,
      avg_position: 3.8,
      sentiment: { positive: 8, neutral: 7, negative: 1 },
      share_of_voice: [
        { name: "Medium", mentions: 33, share: 0.92 },
        { name: "WordPress", mentions: 28, share: 0.78 },
        { name: "Substack", mentions: 22, share: 0.61 },
        { name: "vocus", mentions: 16, share: 0.44, is_target: true },
        { name: "痞客邦", mentions: 14, share: 0.39 },
        { name: "Matters", mentions: 12, share: 0.33 },
        { name: "Blogger", mentions: 8, share: 0.22 },
      ],
      by_category: {
        "品類探索": { rate: 56 },
        "品牌比較": { rate: 89 },
        "推薦請求": { rate: 22 },
        "品牌聲譽": { rate: 67 },
        "品牌認知": { rate: 0 },
      },
    },
    perplexity: {
      model: "perplexity-sonar",
      mention_rate: 83.3,
      avg_position: 1.8,
      sentiment: { positive: 22, neutral: 7, negative: 1 },
      share_of_voice: [
        { name: "vocus", mentions: 30, share: 0.83, is_target: true },
        { name: "Medium", mentions: 28, share: 0.78 },
        { name: "Matters", mentions: 22, share: 0.61 },
        { name: "Substack", mentions: 18, share: 0.50 },
        { name: "WordPress", mentions: 16, share: 0.44 },
        { name: "痞客邦", mentions: 6, share: 0.17 },
        { name: "Blogger", mentions: 3, share: 0.08 },
      ],
      by_category: {
        "品類探索": { rate: 100 },
        "品牌比較": { rate: 100 },
        "推薦請求": { rate: 78 },
        "品牌聲譽": { rate: 100 },
        "品牌認知": { rate: 33 },
      },
    },
  },
  historical: [
    { date: "05-15", claude: 58.3, chatgpt: 50.0, gemini: 36.1, perplexity: 75.0 },
    { date: "05-22", claude: 63.9, chatgpt: 52.8, gemini: 38.9, perplexity: 77.8 },
    { date: "05-29", claude: 69.4, chatgpt: 55.6, gemini: 41.7, perplexity: 80.6 },
    { date: "06-03", claude: 72.2, chatgpt: 58.3, gemini: 44.4, perplexity: 83.3 },
  ],
  prompt_details: [
    { id: "cat-01", text: "台灣有哪些好用的內容創作平台？", category: "品類探索", results: { claude: { mentioned: true, position: 2, sentiment: "positive" }, chatgpt: { mentioned: true, position: 3, sentiment: "positive" }, gemini: { mentioned: true, position: 4, sentiment: "neutral" }, perplexity: { mentioned: true, position: 1, sentiment: "positive" } } },
    { id: "cat-02", text: "我想開始寫部落格，在台灣有什麼平台？", category: "品類探索", results: { claude: { mentioned: true, position: 3, sentiment: "positive" }, chatgpt: { mentioned: true, position: 4, sentiment: "neutral" }, gemini: { mentioned: false, position: null, sentiment: null }, perplexity: { mentioned: true, position: 2, sentiment: "positive" } } },
    { id: "comp-01", text: "vocus 跟 Medium 比較，哪個適合台灣創作者？", category: "品牌比較", results: { claude: { mentioned: true, position: 1, sentiment: "positive" }, chatgpt: { mentioned: true, position: 1, sentiment: "positive" }, gemini: { mentioned: true, position: 1, sentiment: "neutral" }, perplexity: { mentioned: true, position: 1, sentiment: "positive" } } },
    { id: "comp-02", text: "方格子和 Matters 有什麼不同？優缺點？", category: "品牌比較", results: { claude: { mentioned: true, position: 1, sentiment: "neutral" }, chatgpt: { mentioned: true, position: 1, sentiment: "neutral" }, gemini: { mentioned: true, position: 1, sentiment: "neutral" }, perplexity: { mentioned: true, position: 1, sentiment: "positive" } } },
    { id: "rec-01", text: "專寫科技評論想靠寫作賺錢，推薦什麼平台？", category: "推薦請求", results: { claude: { mentioned: true, position: 3, sentiment: "positive" }, chatgpt: { mentioned: false, position: null, sentiment: null }, gemini: { mentioned: false, position: null, sentiment: null }, perplexity: { mentioned: true, position: 2, sentiment: "positive" } } },
    { id: "rec-02", text: "台灣做知識型內容訂閱，哪個平台最適合？", category: "推薦請求", results: { claude: { mentioned: true, position: 1, sentiment: "positive" }, chatgpt: { mentioned: true, position: 2, sentiment: "positive" }, gemini: { mentioned: true, position: 3, sentiment: "neutral" }, perplexity: { mentioned: true, position: 1, sentiment: "positive" } } },
    { id: "rep-01", text: "vocus 方格子這個平台怎麼樣？值得使用嗎？", category: "品牌聲譽", results: { claude: { mentioned: true, position: 1, sentiment: "positive" }, chatgpt: { mentioned: true, position: 1, sentiment: "positive" }, gemini: { mentioned: true, position: 1, sentiment: "neutral" }, perplexity: { mentioned: true, position: 1, sentiment: "positive" } } },
    { id: "brand-01", text: "台灣數位媒體產業現在發展如何？", category: "品牌認知", results: { claude: { mentioned: false, position: null, sentiment: null }, chatgpt: { mentioned: false, position: null, sentiment: null }, gemini: { mentioned: false, position: null, sentiment: null }, perplexity: { mentioned: true, position: 5, sentiment: "neutral" } } },
  ],
  // ─── 情境1：vocus 站內 AI 成效數據 ───
  site_ai: {
    period: "2026-05-01 ~ 2026-06-03",
    total_pv: 8420000,
    ai_referral_pv: 168400,
    ai_referral_pct: 2.0,
    ai_sources: [
      { source: "ChatGPT", pv: 72012, pct: 42.8, trend: "+18%", color: "#74aa9c" },
      { source: "Perplexity", pv: 40416, pct: 24.0, trend: "+35%", color: "#22d3ee" },
      { source: "Google AI Overview", pv: 30312, pct: 18.0, trend: "+52%", color: "#4285f4" },
      { source: "Gemini", pv: 13472, pct: 8.0, trend: "+12%", color: "#8ab4f8" },
      { source: "Claude", pv: 6736, pct: 4.0, trend: "+8%", color: "#d4a27a" },
      { source: "Others", pv: 5452, pct: 3.2, trend: "+5%", color: "#64748b" },
    ],
    ai_referral_trend: [
      { month: "2026-01", pv: 68000, pct: 0.9 },
      { month: "2026-02", pv: 89000, pct: 1.1 },
      { month: "2026-03", pv: 112000, pct: 1.4 },
      { month: "2026-04", pv: 138000, pct: 1.7 },
      { month: "2026-05", pv: 168400, pct: 2.0 },
    ],
    top_cited_articles: [
      { title: "2026 台灣內容創作者生態報告", url: "/p/creator-ecosystem-2026", author: "vocus 編輯部", pv_from_ai: 8420, sources: ["Perplexity", "ChatGPT"], campaign: null },
      { title: "訂閱制經營完全指南：從 0 到 1000 位付費讀者", url: "/p/subscription-guide", author: "李明哲", pv_from_ai: 6230, sources: ["Perplexity", "Google AI Overview"], campaign: null },
      { title: "【合作】ASUS ZenBook 深度評測：創作者的日常夥伴", url: "/p/asus-zenbook-review", author: "科技島讀", pv_from_ai: 4150, sources: ["ChatGPT", "Perplexity"], campaign: "ASUS Q2 Campaign" },
      { title: "台灣精品咖啡地圖：北中南 30 家必訪", url: "/p/taiwan-coffee-map", author: "咖啡因的地圖", pv_from_ai: 3820, sources: ["Perplexity", "Google AI Overview", "ChatGPT"], campaign: null },
      { title: "【合作】理膚寶水敏感肌保養實測 30 天", url: "/p/laroche-posay-review", author: "美肌日記", pv_from_ai: 2940, sources: ["ChatGPT"], campaign: "La Roche-Posay Spring" },
      { title: "遠距工作者的生產力工具箱 2026", url: "/p/remote-work-tools", author: "數位游牧筆記", pv_from_ai: 2680, sources: ["Perplexity", "ChatGPT", "Claude"], campaign: null },
      { title: "【合作】MUJI 無印良品收納術：小坪數的空間魔法", url: "/p/muji-storage-tips", author: "居家改造王", pv_from_ai: 1950, sources: ["Google AI Overview"], campaign: "MUJI Living Campaign" },
    ],
    campaign_performance: [
      { campaign: "ASUS Q2 Campaign", brand: "ASUS", articles: 3, total_pv: 12800, ai_pv: 4150, ai_pct: 32.4, ai_sources: ["ChatGPT", "Perplexity"], status: "active" },
      { campaign: "La Roche-Posay Spring", brand: "理膚寶水", articles: 2, total_pv: 8600, ai_pv: 2940, ai_pct: 34.2, ai_sources: ["ChatGPT"], status: "active" },
      { campaign: "MUJI Living Campaign", brand: "MUJI", articles: 2, total_pv: 6200, ai_pv: 1950, ai_pct: 31.5, ai_sources: ["Google AI Overview"], status: "completed" },
    ],
  },
};

// ─── Colors ──────────────────────────────────────────
const C = {
  bg: "#0a0e17", surface: "#111827", border: "#1e293b",
  text: "#e2e8f0", textMuted: "#94a3b8", textDim: "#64748b",
  brand: "#22d3ee", brandDim: "rgba(34,211,238,0.15)",
  green: "#34d399", greenDim: "rgba(52,211,153,0.15)",
  amber: "#fbbf24", amberDim: "rgba(251,191,36,0.15)",
  red: "#f87171", redDim: "rgba(248,113,113,0.15)",
  purple: "#a78bfa",
};

// ─── Helpers ─────────────────────────────────────────
function KPI({ label, value, sub, color = C.brand, icon }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>{icon} {label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1.1, fontFamily: "monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Section({ children, title }) {
  return (
    <div style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 12 }}>{title}</h2>
      {children}
    </div>
  );
}

function Badge({ children, color = C.brand }) {
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, color, background: `${color}22` }}>{children}</span>;
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e293b", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: C.textMuted, marginBottom: 3 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === "number" ? Math.round(p.value * 10) / 10 : p.value}%</strong></div>
      ))}
    </div>
  );
};

// ─── Main ────────────────────────────────────────────
export default function AIODashboard() {
  const [tab, setTab] = useState("overview");
  const d = SAMPLE;
  const platformKeys = Object.keys(d.platforms);

  const crossPlatform = platformKeys.map((k) => ({
    platform: PLATFORMS[k].label,
    key: k,
    color: PLATFORMS[k].color,
    mention_rate: d.platforms[k].mention_rate,
    avg_position: d.platforms[k].avg_position,
    sov_rank: d.platforms[k].share_of_voice.findIndex((s) => s.is_target) + 1,
    positive_pct: Math.round(d.platforms[k].sentiment.positive / (d.platforms[k].sentiment.positive + d.platforms[k].sentiment.neutral + d.platforms[k].sentiment.negative) * 100),
  }));

  const avgMention = Math.round(crossPlatform.reduce((s, p) => s + p.mention_rate, 0) / crossPlatform.length * 10) / 10;
  const bestPlatform = crossPlatform.reduce((a, b) => a.mention_rate > b.mention_rate ? a : b);
  const worstPlatform = crossPlatform.reduce((a, b) => a.mention_rate < b.mention_rate ? a : b);

  const tabs = [
    { id: "overview", label: "跨平台總覽" },
    { id: "site_ai", label: "📊 站內 AI 成效" },
    { id: "platform", label: "各平台詳情" },
    { id: "prompts", label: "Prompt 明細" },
    { id: "actions", label: "🎯 行動建議" },
    { id: "method", label: "方法論" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter','Noto Sans TC',sans-serif" }}>
      <div style={{ padding: "16px 16px 0", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 20, fontWeight: 700 }}>AIO Tracker</span>
          <Badge color={C.green}>MVP</Badge>
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>
          <span style={{ color: C.brand, fontWeight: 600 }}>{d.brand}</span> 在 {platformKeys.length} 個 AI 平台的品牌能見度 · {d.scan_date}
        </div>
        <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "8px 14px", fontSize: 12, fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? C.brand : C.textMuted, background: "none", border: "none",
              borderBottom: tab === t.id ? `2px solid ${C.brand}` : "2px solid transparent", cursor: "pointer",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 48px" }}>
        {tab === "overview" && <OverviewTab d={d} crossPlatform={crossPlatform} avgMention={avgMention} bestPlatform={bestPlatform} worstPlatform={worstPlatform} />}
        {tab === "site_ai" && <SiteAITab d={d} />}
        {tab === "platform" && <PlatformTab d={d} />}
        {tab === "prompts" && <PromptsTab d={d} />}
        {tab === "actions" && <ActionsTab d={d} crossPlatform={crossPlatform} />}
        {tab === "method" && <MethodTab d={d} />}
      </div>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────
function OverviewTab({ d, crossPlatform, avgMention, bestPlatform, worstPlatform }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <KPI icon="📡" label="平均提及率" value={`${avgMention}%`} sub={`跨 ${crossPlatform.length} 個平台`} color={avgMention > 60 ? C.green : C.amber} />
        <KPI icon="🏆" label="最佳平台" value={bestPlatform.platform} sub={`提及率 ${bestPlatform.mention_rate}%`} color={C.green} />
        <KPI icon="⚠️" label="最弱平台" value={worstPlatform.platform} sub={`提及率 ${worstPlatform.mention_rate}%`} color={C.red} />
        <KPI icon="📊" label="平台差距" value={`${Math.round(bestPlatform.mention_rate - worstPlatform.mention_rate)}%`} sub="最高 vs 最低" color={C.amber} />
      </div>

      <Section title="📡 各平台提及率">
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 12px 8px" }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={crossPlatform}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="platform" tick={{ fill: C.textMuted, fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: C.textDim, fontSize: 10 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="mention_rate" name="提及率" radius={[6, 6, 0, 0]} barSize={32}>
                {crossPlatform.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title="🔎 各平台快照">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {crossPlatform.sort((a, b) => b.mention_rate - a.mention_rate).map((p) => (
            <div key={p.platform} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 4, height: 40, borderRadius: 2, background: p.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{p.platform}</div>
                <div style={{ fontSize: 11, color: C.textDim }}>排名 #{p.sov_rank} · 正面 {p.positive_pct}%</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace", color: p.mention_rate >= 70 ? C.green : p.mention_rate >= 50 ? C.amber : C.red }}>{p.mention_rate}%</div>
                <div style={{ fontSize: 10, color: C.textDim }}>avg #{p.avg_position}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="📈 提及率趨勢（跨平台）">
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 12px 4px" }}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={d.historical}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="date" tick={{ fill: C.textDim, fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: C.textDim, fontSize: 10 }} />
              <Tooltip content={<Tip />} />
              {Object.entries(PLATFORMS).map(([key, p]) => (
                <Line key={key} type="monotone" dataKey={key} name={p.label} stroke={p.color} strokeWidth={2} dot={{ fill: p.color, r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, padding: "8px 0 4px", flexWrap: "wrap" }}>
            {Object.entries(PLATFORMS).map(([key, p]) => (
              <span key={key} style={{ fontSize: 11, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: p.color, display: "inline-block" }} />
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

// ─── Site AI Performance Tab ─────────────────────────
function SiteAITab({ d }) {
  const s = d.site_ai;
  const [view, setView] = useState("overview"); // overview | articles | campaigns

  const TipPV = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "#1e293b", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
        <div style={{ color: C.textMuted, marginBottom: 3 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color || C.brand }}>{p.name}: <strong>{p.value?.toLocaleString()}</strong></div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <KPI icon="🌐" label="AI Referral 流量" value={s.ai_referral_pv.toLocaleString()} sub={`佔總流量 ${s.ai_referral_pct}%`} color={C.brand} />
        <KPI icon="📈" label="月增長率" value="+18%" sub="vs 上月" color={C.green} />
        <KPI icon="📄" label="被 AI 引用文章" value={`${s.top_cited_articles.length} 篇`} sub="有 AI referral 流量" color={C.purple} />
        <KPI icon="🏷️" label="品牌合作案 AI 成效" value={`${s.campaign_performance.length} 檔`} sub={`avg ${Math.round(s.campaign_performance.reduce((a, c) => a + c.ai_pct, 0) / s.campaign_performance.length)}% AI 流量佔比`} color={C.amber} />
      </div>

      {/* Sub-navigation */}
      <div style={{ display: "flex", gap: 6, marginTop: 20, marginBottom: 4 }}>
        {[["overview", "流量概覽"], ["articles", "被引用文章"], ["campaigns", "品牌合作案"]].map(([k, label]) => (
          <button key={k} onClick={() => setView(k)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
            background: view === k ? C.brandDim : C.surface,
            color: view === k ? C.brand : C.textMuted,
            border: `1px solid ${view === k ? C.brand + "44" : C.border}`,
            fontWeight: view === k ? 600 : 400,
          }}>{label}</button>
        ))}
      </div>

      {view === "overview" && (
        <>
          {/* AI Source Breakdown */}
          <Section title="🔗 AI 流量來源分佈">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {s.ai_sources.map((src) => (
                <div key={src.source} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 32, borderRadius: 2, background: src.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{src.source}</div>
                    <div style={{ fontSize: 11, color: C.textDim }}>{src.pv.toLocaleString()} PV</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: src.color }}>{src.pct}%</div>
                    <div style={{ fontSize: 10, color: C.green }}>{src.trend}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Trend chart */}
          <Section title="📈 AI Referral 流量趨勢">
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 12px 4px" }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={s.ai_referral_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="month" tick={{ fill: C.textDim, fontSize: 10 }} tickFormatter={(m) => m.slice(5)} />
                  <YAxis tick={{ fill: C.textDim, fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                  <Tooltip content={<TipPV />} />
                  <Bar dataKey="pv" name="AI Referral PV" fill={C.brand} radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* Context box */}
          <Section title="💡 數據來源說明">
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>
              本頁數據來自 Google Search Console 和 GA4 中的 AI referral 識別。
              GSC 可辨識 Google AI Overview 的引用；GA4 透過 referrer 分析識別來自 ChatGPT（chat.openai.com）、Perplexity（perplexity.ai）、Claude（claude.ai）等平台的流量。
              此為 vocus 全站數據，下方「品牌合作案」分頁可看到個別 campaign 的 AI 成效歸因。
            </div>
          </Section>
        </>
      )}

      {view === "articles" && (
        <Section title="📄 被 AI 引用的熱門文章">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {s.top_cited_articles.map((article, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{article.title}</div>
                    <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>by {article.author}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: C.brand }}>{article.pv_from_ai.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: C.textDim }}>AI PV</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {article.sources.map((src) => (
                    <span key={src} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, color: C.textMuted, background: `${C.textDim}15`, border: `1px solid ${C.border}` }}>{src}</span>
                  ))}
                  {article.campaign && (
                    <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, color: C.amber, background: C.amberDim }}>🏷️ {article.campaign}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {view === "campaigns" && (
        <>
          <Section title="🏷️ 品牌合作案 AI 成效">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {s.campaign_performance.map((camp, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 0, overflow: "hidden" }}>
                  {/* Campaign header */}
                  <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{camp.campaign}</span>
                      <span style={{ margin: "0 8px", color: C.border }}>·</span>
                      <span style={{ fontSize: 12, color: C.textMuted }}>{camp.brand}</span>
                    </div>
                    <Badge color={camp.status === "active" ? C.green : C.textDim}>
                      {camp.status === "active" ? "進行中" : "已結案"}
                    </Badge>
                  </div>
                  {/* Campaign metrics */}
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: C.text }}>{camp.total_pv.toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: C.textDim }}>總 PV</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: C.brand }}>{camp.ai_pv.toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: C.textDim }}>AI PV</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: C.green }}>{camp.ai_pct}%</div>
                        <div style={{ fontSize: 10, color: C.textDim }}>AI 佔比</div>
                      </div>
                    </div>
                    {/* AI source pills */}
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: C.textDim }}>引用來源：</span>
                      {camp.ai_sources.map((src) => (
                        <span key={src} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, color: C.textMuted, background: `${C.textDim}15` }}>{src}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Insight box for campaigns */}
          <Section title="💡 品牌主報告亮點">
            <div style={{ background: C.amberDim, border: `1px solid ${C.amber}33`, borderRadius: 10, padding: "14px 16px", fontSize: 13, lineHeight: 1.7 }}>
              <div style={{ color: C.text, fontWeight: 600, marginBottom: 6 }}>這些數字可以直接放入品牌主報告：</div>
              <div style={{ color: C.textMuted }}>
                「您在 vocus 上的合作內容，除了獲得站內自然流量外，額外有 <span style={{ color: C.amber, fontWeight: 600 }}>{Math.round(s.campaign_performance.reduce((a, c) => a + c.ai_pct, 0) / s.campaign_performance.length)}%</span> 的流量來自 AI 搜尋引擎的主動引用。
                這代表 AI 工具在回答使用者問題時，直接推薦了您的品牌合作文章——這是傳統廣告無法達到的『被 AI 推薦』效果。」
              </div>
            </div>
          </Section>
        </>
      )}
    </>
  );
}

// ─── Platform Detail Tab ─────────────────────────────
function PlatformTab({ d }) {
  const [selected, setSelected] = useState("claude");
  const p = d.platforms[selected];
  const pInfo = PLATFORMS[selected];

  const sovData = p.share_of_voice.map((s) => ({
    name: s.name,
    share: Math.round(s.share * 100),
  }));

  const catData = Object.entries(p.by_category).map(([name, val]) => ({ name, rate: val.rate }));

  const sentData = [
    { name: "正面", value: p.sentiment.positive, fill: C.green },
    { name: "中性", value: p.sentiment.neutral, fill: C.amber },
    { name: "負面", value: p.sentiment.negative, fill: C.red },
  ];

  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(PLATFORMS).map(([key, info]) => (
          <button key={key} onClick={() => setSelected(key)} style={{
            padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
            background: selected === key ? info.color + "22" : C.surface,
            color: selected === key ? info.color : C.textMuted,
            border: `1px solid ${selected === key ? info.color + "66" : C.border}`,
          }}>
            {info.icon} {info.label}
            <span style={{ marginLeft: 6, fontFamily: "monospace", fontWeight: 700 }}>{d.platforms[key].mention_rate}%</span>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 4 }}>
        <KPI icon="📡" label="提及率" value={`${p.mention_rate}%`} color={p.mention_rate >= 70 ? C.green : p.mention_rate >= 50 ? C.amber : C.red} />
        <KPI icon="🏅" label="平均排名" value={`#${p.avg_position}`} color={pInfo.color} />
        <KPI icon="⚔️" label="聲量排名" value={`#${p.share_of_voice.findIndex((s) => s.is_target) + 1}`} sub={`/ ${p.share_of_voice.length} 品牌`} color={C.purple} />
      </div>

      <Section title={`⚔️ ${pInfo.label} 聲量佔比`}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 12px 4px" }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sovData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: C.textDim, fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={65} tick={{ fill: C.textMuted, fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="share" name="Share" radius={[0, 6, 6, 0]} barSize={16}>
                {sovData.map((entry, i) => {
                  const isTarget = p.share_of_voice[i]?.is_target;
                  return <Cell key={i} fill={isTarget ? pInfo.color : C.textDim} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title="📂 分類提及率">
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px" }}>
          {catData.map((c) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ width: 65, fontSize: 12, color: C.textMuted, flexShrink: 0 }}>{c.name}</span>
              <div style={{ flex: 1, height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${c.rate}%`, height: "100%", background: c.rate >= 80 ? C.green : c.rate >= 50 ? C.amber : c.rate > 0 ? C.red : C.border, borderRadius: 4, transition: "width 0.4s" }} />
              </div>
              <span style={{ fontSize: 12, fontFamily: "monospace", color: C.text, width: 35, textAlign: "right" }}>{c.rate}%</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="💬 情感分佈">
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 0" }}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={sentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} strokeWidth={0}>
                {sentData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: C.textMuted }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Section>
    </>
  );
}

// ─── Prompts Tab ─────────────────────────────────────
function PromptsTab({ d }) {
  const [filter, setFilter] = useState("all");
  const categories = [...new Set(d.prompt_details.map((p) => p.category))];
  const filtered = filter === "all" ? d.prompt_details : d.prompt_details.filter((p) => p.category === filter);

  return (
    <>
      <Section title="🔍 跨平台 Prompt 明細">
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {[["all", "全部"], ...categories.map((c) => [c, c])].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: "5px 12px", borderRadius: 99, fontSize: 11, cursor: "pointer",
              background: filter === key ? C.brand : C.surface, color: filter === key ? C.bg : C.textMuted,
              border: `1px solid ${filter === key ? C.brand : C.border}`,
            }}>{label}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((p) => (
            <div key={p.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 10, color: C.textDim, fontFamily: "monospace" }}>{p.id}</span>
                  <span style={{ margin: "0 6px", color: C.border }}>·</span>
                  <Badge color={C.purple}>{p.category}</Badge>
                </div>
              </div>
              <div style={{ fontSize: 13, color: C.text, marginBottom: 10, lineHeight: 1.5 }}>「{p.text}」</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {Object.entries(PLATFORMS).map(([key, info]) => {
                  const r = p.results[key];
                  if (!r) return null;
                  return (
                    <div key={key} style={{
                      padding: "6px 8px", borderRadius: 6, textAlign: "center", fontSize: 11,
                      background: r.mentioned ? C.greenDim : C.redDim,
                      borderTop: `2px solid ${r.mentioned ? info.color : C.red + "44"}`,
                    }}>
                      <div style={{ fontSize: 10, color: C.textDim, marginBottom: 2 }}>{info.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: r.mentioned ? info.color : C.red, fontFamily: "monospace" }}>
                        {r.mentioned ? `#${r.position}` : "—"}
                      </div>
                      {r.sentiment && r.mentioned && (
                        <div style={{ fontSize: 10, marginTop: 1 }}>
                          {r.sentiment === "positive" ? "👍" : r.sentiment === "neutral" ? "➖" : "👎"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

// ─── Actions Tab ─────────────────────────────────────
function ActionsTab({ d, crossPlatform }) {
  // Generate recommendations from data
  const recommendations = useMemo(() => {
    const recs = [];

    // 1. Platform-level gaps
    const sorted = [...crossPlatform].sort((a, b) => a.mention_rate - b.mention_rate);
    sorted.forEach((p, i) => {
      if (p.mention_rate < 50) {
        recs.push({
          priority: "P0",
          type: "platform_gap",
          title: `${p.platform} 提及率僅 ${p.mention_rate}%`,
          detail: `在 ${p.platform} 上，品牌在超過一半的相關提問中未被提及。相比最佳平台（${crossPlatform.reduce((a, b) => a.mention_rate > b.mention_rate ? a : b).platform} ${crossPlatform.reduce((a, b) => a.mention_rate > b.mention_rate ? a : b).mention_rate}%），落差達 ${Math.round(crossPlatform.reduce((a, b) => a.mention_rate > b.mention_rate ? a : b).mention_rate - p.mention_rate)}%。`,
          actions: [
            `研究 ${p.platform} 的訓練資料來源偏好，針對性產出內容`,
            `確認品牌網站是否被 ${p.platform} 的 crawler 正確索引`,
            `增加在該平台偏好的內容源（如 Google 生態系）上的品牌露出`,
          ],
          color: C.red,
          platform: p.key,
        });
      } else if (p.mention_rate < 65) {
        recs.push({
          priority: "P1",
          type: "platform_gap",
          title: `${p.platform} 提及率偏低（${p.mention_rate}%）`,
          detail: `尚有提升空間。目前排名 #${p.sov_rank}，正面提及佔 ${p.positive_pct}%。`,
          actions: [
            `強化品牌相關的結構化資料（Schema.org、FAQ）`,
            `產出更多該平台偏好格式的權威內容`,
          ],
          color: C.amber,
          platform: p.key,
        });
      }
    });

    // 2. Category-level gaps
    const allCategories = {};
    Object.entries(d.platforms).forEach(([pk, pv]) => {
      Object.entries(pv.by_category).forEach(([cat, val]) => {
        if (!allCategories[cat]) allCategories[cat] = {};
        allCategories[cat][pk] = val.rate;
      });
    });

    Object.entries(allCategories).forEach(([cat, platforms]) => {
      const avg = Object.values(platforms).reduce((s, v) => s + v, 0) / Object.values(platforms).length;
      if (avg < 20) {
        recs.push({
          priority: "P0",
          type: "category_gap",
          title: `「${cat}」類提問幾乎無曝光（平均 ${Math.round(avg)}%）`,
          detail: `當使用者以此類意圖提問時，AI 幾乎不會提及品牌。這代表品牌在「泛產業認知」層面的存在感不足。`,
          actions: [
            `產出產業觀點、趨勢分析等內容，建立品牌的產業級能見度`,
            `爭取在產業媒體、研究報告中被引用或提及`,
            `建立 llms.txt 和結構化品牌資訊頁，幫助 AI 理解品牌定位`,
          ],
          color: C.red,
        });
      } else if (avg < 50) {
        const weakPlatforms = Object.entries(platforms)
          .filter(([_, v]) => v < 40)
          .map(([pk]) => PLATFORMS[pk]?.label)
          .join("、");
        recs.push({
          priority: "P1",
          type: "category_gap",
          title: `「${cat}」類提問表現偏弱（平均 ${Math.round(avg)}%）`,
          detail: weakPlatforms ? `特別弱的平台：${weakPlatforms}` : `各平台表現均未達理想水準。`,
          actions: [
            `針對此類意圖的常見提問，產出直接對應的內容頁面`,
            `在現有內容中加入更多與此意圖匹配的關鍵字和描述`,
          ],
          color: C.amber,
        });
      }
    });

    // 3. Competitor dominance alerts
    Object.entries(d.platforms).forEach(([pk, pv]) => {
      const target = pv.share_of_voice.find((s) => s.is_target);
      const leader = pv.share_of_voice[0];
      if (target && leader && !leader.is_target && leader.share - target.share > 0.25) {
        recs.push({
          priority: "P1",
          type: "competitor",
          title: `${PLATFORMS[pk].label} 上被 ${leader.name} 大幅領先`,
          detail: `${leader.name} 的聲量佔比（${Math.round(leader.share * 100)}%）領先品牌（${Math.round(target.share * 100)}%）達 ${Math.round((leader.share - target.share) * 100)}%。`,
          actions: [
            `分析 ${leader.name} 被 AI 引用的內容特徵，找出可模仿的結構`,
            `針對 ${leader.name} 的弱項主題產出差異化內容`,
          ],
          color: C.amber,
          platform: pk,
        });
      }
    });

    // 4. Quick wins
    const promptsWithMixedResults = d.prompt_details.filter((p) => {
      const results = Object.values(p.results);
      const mentioned = results.filter((r) => r.mentioned).length;
      return mentioned > 0 && mentioned < results.length;
    });

    if (promptsWithMixedResults.length > 0) {
      const examples = promptsWithMixedResults.slice(0, 2);
      recs.push({
        priority: "P2",
        type: "quick_win",
        title: `${promptsWithMixedResults.length} 組 prompt 有「部分平台提及」的機會`,
        detail: `這些 prompt 在某些平台已有曝光，但在其他平台缺失。例如：「${examples[0].text}」。已有基礎，補齊成本最低。`,
        actions: [
          `優先處理這些「半成功」的 prompt 對應的內容`,
          `分析有被提及的平台引用了什麼內容，複製到其他管道`,
        ],
        color: C.green,
      });
    }

    // Sort by priority
    return recs.sort((a, b) => {
      const order = { P0: 0, P1: 1, P2: 2 };
      return order[a.priority] - order[b.priority];
    });
  }, [d, crossPlatform]);

  const priorityCounts = {
    P0: recommendations.filter((r) => r.priority === "P0").length,
    P1: recommendations.filter((r) => r.priority === "P1").length,
    P2: recommendations.filter((r) => r.priority === "P2").length,
  };

  return (
    <>
      {/* Priority summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 4 }}>
        <div style={{ background: C.redDim, border: `1px solid ${C.red}33`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.red, fontFamily: "monospace" }}>{priorityCounts.P0}</div>
          <div style={{ fontSize: 11, color: C.red, marginTop: 2 }}>P0 — 急迫</div>
        </div>
        <div style={{ background: C.amberDim, border: `1px solid ${C.amber}33`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.amber, fontFamily: "monospace" }}>{priorityCounts.P1}</div>
          <div style={{ fontSize: 11, color: C.amber, marginTop: 2 }}>P1 — 重要</div>
        </div>
        <div style={{ background: C.greenDim, border: `1px solid ${C.green}33`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.green, fontFamily: "monospace" }}>{priorityCounts.P2}</div>
          <div style={{ fontSize: 11, color: C.green, marginTop: 2 }}>P2 — 快速贏</div>
        </div>
      </div>

      <Section title="🎯 優先行動清單">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {recommendations.map((rec, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 0, overflow: "hidden" }}>
              {/* Header bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `${rec.color}08` }}>
                <span style={{
                  padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                  color: rec.color, background: `${rec.color}22`,
                }}>{rec.priority}</span>
                <span style={{
                  padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 500,
                  color: C.textDim, background: `${C.textDim}15`,
                }}>
                  {rec.type === "platform_gap" ? "平台缺口" : rec.type === "category_gap" ? "意圖盲區" : rec.type === "competitor" ? "競爭者威脅" : "快速機會"}
                </span>
                {rec.platform && (
                  <span style={{ marginLeft: "auto", fontSize: 11, color: PLATFORMS[rec.platform]?.color }}>
                    {PLATFORMS[rec.platform]?.icon} {PLATFORMS[rec.platform]?.label}
                  </span>
                )}
              </div>

              {/* Body */}
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>{rec.title}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12, lineHeight: 1.6 }}>{rec.detail}</div>

                {/* Action items */}
                <div style={{ fontSize: 12, color: C.textDim, marginBottom: 6, fontWeight: 500 }}>建議行動：</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {rec.actions.map((action, j) => (
                    <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>
                      <span style={{ color: rec.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Summary insight box */}
      <Section title="💡 整體洞察">
        <div style={{ background: C.brandDim, border: `1px solid ${C.brand}33`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
            <span style={{ fontWeight: 600 }}>{d.brand}</span> 在 AI 生態系中的能見度呈現<span style={{ fontWeight: 600, color: C.amber }}>明顯的平台落差</span>。
            在 {crossPlatform.reduce((a, b) => a.mention_rate > b.mention_rate ? a : b).platform} 上表現優異（{crossPlatform.reduce((a, b) => a.mention_rate > b.mention_rate ? a : b).mention_rate}%），
            但在 {crossPlatform.reduce((a, b) => a.mention_rate < b.mention_rate ? a : b).platform} 上存在顯著盲區（{crossPlatform.reduce((a, b) => a.mention_rate < b.mention_rate ? a : b).mention_rate}%）。
          </div>
          <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7, marginTop: 8 }}>
            建議的優先順序：先處理 P0 級的平台缺口和意圖盲區（這些代表「使用者在問，但 AI 不推薦你」），
            再利用 P2 快速贏（「某些平台已經提到你，只需補齊其他平台」）取得短期成效，
            最後系統性處理 P1 級的競爭者追趕和中等強度的改善項目。
          </div>
        </div>
      </Section>
    </>
  );
}

// ─── Method Tab ──────────────────────────────────────
function MethodTab({ d }) {
  return (
    <Section title="📖 方法論">
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 16px", fontSize: 13, lineHeight: 1.8, color: C.textMuted }}>
        <h3 style={{ color: C.text, fontSize: 15, marginBottom: 8, fontWeight: 600 }}>什麼是 AIO（AI Optimization）？</h3>
        <p style={{ marginBottom: 14 }}>
          當使用者透過 AI 工具搜尋產品或服務時，AI 回覆中是否提及您的品牌、排在第幾位、以什麼語氣描述——這就是 AI 品牌能見度。
        </p>

        <h3 style={{ color: C.text, fontSize: 15, marginBottom: 8, fontWeight: 600 }}>追蹤方法</h3>
        <p style={{ marginBottom: 14 }}>
          我們對 {Object.keys(d.platforms).length} 個 AI 平台（{Object.entries(PLATFORMS).map(([_, p]) => p.label).join("、")}）發送相同的模擬使用者 prompt，
          每組 prompt 重複執行多次以衡量回覆穩定性。再以 AI 分析每則回覆中的品牌提及狀況、排名、情感、競爭者對比。
        </p>

        <h3 style={{ color: C.text, fontSize: 15, marginBottom: 8, fontWeight: 600 }}>核心指標</h3>
        {[
          ["提及率", "品牌在 AI 回覆中被提到的比例"],
          ["平均排名", "被提及時通常排第幾位（#1 = 最先推薦）"],
          ["聲量佔比", "相對於所有競爭品牌的提及頻率"],
          ["平台差距", "表現最好 vs 最差平台的落差——差距越大代表有優化空間"],
        ].map(([t, desc]) => (
          <div key={t} style={{ padding: "10px 12px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 6 }}>
            <span style={{ color: C.brand, fontWeight: 600, fontSize: 12 }}>{t}</span>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{desc}</div>
          </div>
        ))}

        <h3 style={{ color: C.text, fontSize: 15, margin: "14px 0 8px", fontWeight: 600 }}>重要限制</h3>
        <p style={{ fontSize: 12 }}>
          LLM 回覆具有非確定性——相同問題每次可能得到不同答案。本報告透過多次重複執行降低隨機性影響，但結果仍應視為趨勢觀察而非精確數字。
          各平台追蹤方式不同（API 呼叫 vs 瀏覽器自動化），可能影響結果的可比性。
        </p>
      </div>
    </Section>
  );
}

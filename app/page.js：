"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const T = {
  bg: "#FAF7F2", card: "#FFFFFF", cardBorder: "#E8E0D4",
  primary: "#5B7553", primaryDark: "#3E5438",
  accent: "#8B6F47", text: "#3D3327", textLight: "#7A6F63",
  textMuted: "#B0A699", warm: "#F5EDE0", highlight: "#FFF8E7",
  danger: "#C0392B",
};

const today = () => new Date().toISOString().slice(0, 10);

// ─── API helpers ───
async function generateArticleAPI() {
  const res = await fetch("/api/generate-article", { method: "POST" });
  if (!res.ok) throw new Error("Failed to generate article");
  return res.json();
}

async function generateQuestionsAPI(scriptureInput) {
  const res = await fetch("/api/generate-questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scriptureInput }),
  });
  if (!res.ok) throw new Error("Failed to generate questions");
  return res.json();
}

// ─── Components ───
function Tabs({ active, onChange }) {
  return (
    <div style={{ display: "flex", borderBottom: `2px solid ${T.cardBorder}`, marginBottom: 20 }}>
      {[{ key: "read", icon: "📖", label: "Morning Read" }, { key: "devote", icon: "🕊️", label: "Daily Devotion" }].map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          flex: 1, padding: "14px 0", border: "none", cursor: "pointer",
          background: active === t.key ? T.card : "transparent",
          borderBottom: active === t.key ? `3px solid ${T.primary}` : "3px solid transparent",
          color: active === t.key ? T.primary : T.textLight,
          fontWeight: active === t.key ? 700 : 500, fontSize: 15,
        }}>{t.icon} {t.label}</button>
      ))}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 14,
      padding: 20, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", ...style,
    }}>{children}</div>
  );
}

function Badge({ children, color = T.primary }) {
  return (
    <span style={{
      display: "inline-block", background: color + "18", color,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
    }}>{children}</span>
  );
}

// ─── Morning Read ───
function MorningRead() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("today");
  const [selectedDate, setSelectedDate] = useState(today());
  const [confirmClear, setConfirmClear] = useState(false);

  const loadArticles = useCallback(async () => {
    const { data } = await supabase.from("articles").select("*").order("date", { ascending: false });
    if (data) setArticles(data);
  }, []);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  const cur = articles.find(a => a.date === selectedDate);

  const generateArticle = async () => {
    setLoading(true);
    try {
      await generateArticleAPI();
      await loadArticles();
    } catch (e) { console.error(e); alert("生成失败，请重试"); }
    setLoading(false);
  };

  const markRead = async (date) => {
    await supabase.from("articles").update({ is_read: true }).eq("date", date);
    await loadArticles();
  };

  const clearAll = async () => {
    await supabase.from("articles").delete().neq("id", 0);
    setArticles([]); setSelectedDate(today()); setConfirmClear(false);
  };

  if (view === "archive") {
    return (
      <div>
        <button onClick={() => { setView("today"); setSelectedDate(today()); }}
          style={{ background: "none", border: "none", color: T.primary, cursor: "pointer", fontSize: 14, marginBottom: 12, fontWeight: 600 }}>
          ← Back to Today
        </button>
        <h3 style={{ color: T.text, margin: "0 0 16px", fontSize: 18 }}>Article Archive</h3>
        {articles.length === 0 ? (
          <p style={{ color: T.textMuted, textAlign: "center", padding: 40 }}>No articles yet.</p>
        ) : articles.map(a => (
          <Card key={a.date} style={{ cursor: "pointer" }}>
            <div onClick={() => { setSelectedDate(a.date); setView("today"); }}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 4 }}>{a.date}</div>
                <div style={{ fontWeight: 600, color: T.text }}>{a.title}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge color={a.style === "Daily Conversation" ? T.primary : T.accent}>{a.style}</Badge>
                {a.is_read && <span style={{ color: T.primary, fontSize: 18 }}>✓</span>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ color: T.text, margin: 0, fontSize: 18 }}>
          {selectedDate === today() ? "Today's Article" : selectedDate}
        </h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {confirmClear ? (
            <>
              <span style={{ fontSize: 12, color: T.danger }}>确定清除？</span>
              <button onClick={clearAll} style={{
                background: "#FDECEA", color: T.danger, border: `1px solid ${T.danger}`, borderRadius: 6,
                padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>确定</button>
              <button onClick={() => setConfirmClear(false)} style={{
                background: T.warm, color: T.textLight, border: "none", borderRadius: 6,
                padding: "4px 12px", fontSize: 12, cursor: "pointer",
              }}>取消</button>
            </>
          ) : (
            <button onClick={() => setConfirmClear(true)} style={{
              background: "none", border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "6px 10px",
              color: T.textMuted, cursor: "pointer", fontSize: 13,
            }}>🗑️</button>
          )}
          <button onClick={() => setView("archive")} style={{
            background: T.warm, border: "none", borderRadius: 8, padding: "6px 14px",
            color: T.accent, cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>📚 Archive</button>
        </div>
      </div>

      {!cur ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
          <p style={{ color: T.textLight, marginBottom: 20 }}>
            {selectedDate === today() ? "Generate today's reading article" : "No article for this date"}
          </p>
          {selectedDate === today() && (
            <button onClick={generateArticle} disabled={loading} style={{
              background: T.primary, color: "#fff", border: "none", borderRadius: 10,
              padding: "12px 32px", fontSize: 15, fontWeight: 600,
              cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1,
            }}>{loading ? "Generating..." : "✨ Generate Article"}</button>
          )}
        </Card>
      ) : (
        <>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Badge color={cur.style === "Daily Conversation" ? T.primary : T.accent}>{cur.style}</Badge>
              {cur.is_read ? (
                <span style={{ color: T.primary, fontSize: 13, fontWeight: 600 }}>✓ Read</span>
              ) : (
                <button onClick={() => markRead(selectedDate)} style={{
                  background: T.primary + "15", color: T.primary, border: "none",
                  borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600,
                }}>Mark as Read</button>
              )}
            </div>
            <h2 style={{ color: T.text, margin: "0 0 14px", fontSize: 20 }}>{cur.title}</h2>
            <div style={{ color: T.text, lineHeight: 1.85, fontSize: 15, whiteSpace: "pre-wrap" }}>{cur.content}</div>
          </Card>

          {cur.takeaways && cur.takeaways.length > 0 && (
            <Card>
              <h4 style={{ color: T.accent, margin: "0 0 14px", fontSize: 15 }}>🗣️ 地道表达 · 拿来就用</h4>
              {cur.takeaways.map((t, i) => (
                <div key={i} style={{
                  padding: "12px 14px", background: i % 2 === 0 ? T.warm : T.highlight,
                  borderRadius: 8, marginBottom: 8, borderLeft: `3px solid ${T.accent}`,
                }}>
                  <div style={{ color: T.text, fontSize: 15, fontWeight: 600, lineHeight: 1.7, marginBottom: 4 }}>
                    {t.sentence}
                  </div>
                  <div style={{ color: T.textLight, fontSize: 13, lineHeight: 1.5 }}>{t.chinese}</div>
                </div>
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ─── Daily Devotion ───
function DailyDevotion() {
  const [devotions, setDevotions] = useState([]);
  const [view, setView] = useState("today");
  const [selectedDate, setSelectedDate] = useState(today());
  const [scriptureInput, setScriptureInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const loadDevotions = useCallback(async () => {
    const { data } = await supabase.from("devotions").select("*").order("date", { ascending: false });
    if (data) setDevotions(data);
  }, []);

  useEffect(() => { loadDevotions(); }, [loadDevotions]);

  useEffect(() => {
    const dev = devotions.find(d => d.date === selectedDate);
    setNotes(dev?.notes || "");
  }, [selectedDate, devotions]);

  const cur = devotions.find(d => d.date === selectedDate);
  const hasToday = devotions.some(d => d.date === today());

  const generateQuestions = async () => {
    if (!scriptureInput.trim()) return;
    setLoading(true);
    try {
      await generateQuestionsAPI(scriptureInput);
      await loadDevotions();
      setSelectedDate(today());
    } catch (e) { console.error(e); alert("生成失败，请重试"); }
    setLoading(false);
  };

  const saveNotes = async () => {
    if (!cur) return;
    setSaving(true);
    await supabase.from("devotions").update({ notes }).eq("date", selectedDate);
    await loadDevotions();
    setTimeout(() => setSaving(false), 800);
  };

  const clearAll = async () => {
    await supabase.from("devotions").delete().neq("id", 0);
    setDevotions([]); setSelectedDate(today()); setConfirmClear(false); setNotes("");
  };

  if (view === "archive") {
    return (
      <div>
        <button onClick={() => { setView("today"); setSelectedDate(today()); }}
          style={{ background: "none", border: "none", color: T.primary, cursor: "pointer", fontSize: 14, marginBottom: 12, fontWeight: 600 }}>
          ← Back to Today
        </button>
        <h3 style={{ color: T.text, margin: "0 0 16px", fontSize: 18 }}>Devotion Archive</h3>
        {devotions.length === 0 ? (
          <p style={{ color: T.textMuted, textAlign: "center", padding: 40 }}>No devotions yet.</p>
        ) : devotions.map(d => (
          <Card key={d.date} style={{ cursor: "pointer" }}>
            <div onClick={() => { setSelectedDate(d.date); setView("today"); }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: T.textMuted }}>{d.date}</div>
                {d.notes ? <span style={{ color: T.primary, fontSize: 13 }}>✍️ Has notes</span> : null}
              </div>
              <div style={{ fontWeight: 600, color: T.text, marginTop: 4 }}>
                {d.scripture_ref || d.scripture_input}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ color: T.text, margin: 0, fontSize: 18 }}>
          {selectedDate === today() ? "Today's Devotion" : selectedDate}
        </h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {confirmClear ? (
            <>
              <span style={{ fontSize: 12, color: T.danger }}>确定清除？</span>
              <button onClick={clearAll} style={{
                background: "#FDECEA", color: T.danger, border: `1px solid ${T.danger}`, borderRadius: 6,
                padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>确定</button>
              <button onClick={() => setConfirmClear(false)} style={{
                background: T.warm, color: T.textLight, border: "none", borderRadius: 6,
                padding: "4px 12px", fontSize: 12, cursor: "pointer",
              }}>取消</button>
            </>
          ) : (
            <button onClick={() => setConfirmClear(true)} style={{
              background: "none", border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "6px 10px",
              color: T.textMuted, cursor: "pointer", fontSize: 13,
            }}>🗑️</button>
          )}
          <button onClick={() => setView("archive")} style={{
            background: T.warm, border: "none", borderRadius: 8, padding: "6px 14px",
            color: T.accent, cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>📜 Archive</button>
        </div>
      </div>

      {!hasToday && selectedDate === today() && (
        <div style={{
          background: T.highlight, border: "1px solid #F0E0B0", borderRadius: 10,
          padding: "12px 16px", marginBottom: 16, fontSize: 14, color: T.accent,
        }}>🕊️ 今天还没有灵修记录哦，来开始今天的灵修吧～</div>
      )}

      {selectedDate === today() && (
        <Card>
          <h4 style={{ color: T.accent, margin: "0 0 10px", fontSize: 15 }}>📖 今日经文</h4>
          <textarea value={scriptureInput} onChange={e => setScriptureInput(e.target.value)}
            placeholder={"输入今天阅读的经文章节，如：以弗所书 3章\n也可以粘贴具体经文内容..."}
            style={{
              width: "100%", minHeight: 80, border: `1px solid ${T.cardBorder}`,
              borderRadius: 8, padding: 12, fontSize: 14, resize: "vertical",
              fontFamily: "inherit", color: T.text, background: T.warm,
              boxSizing: "border-box", lineHeight: 1.6,
            }} />
          <button onClick={generateQuestions} disabled={loading || !scriptureInput.trim()} style={{
            marginTop: 10, background: T.primary, color: "#fff", border: "none",
            borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 600,
            cursor: loading ? "wait" : "pointer", opacity: loading || !scriptureInput.trim() ? 0.6 : 1,
          }}>{loading ? "生成中..." : "✨ 生成反思问题"}</button>
        </Card>
      )}

      {cur && (
        <>
          <Card>
            <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 6 }}>经文章节</div>
            <div style={{ fontWeight: 600, color: T.text, fontSize: 16, marginBottom: 14 }}>
              {cur.scripture_ref || cur.scripture_input}
            </div>
            <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 8 }}>反思问题</div>
            {(cur.questions || []).map((q, i) => (
              <div key={i} style={{
                background: T.warm, borderRadius: 8, padding: "10px 14px", marginBottom: 8,
                color: T.text, fontSize: 14, lineHeight: 1.7, borderLeft: `3px solid ${T.primary}`,
              }}>
                <span style={{ color: T.primary, fontWeight: 700, marginRight: 6 }}>{i + 1}.</span>{q}
              </div>
            ))}
          </Card>

          <Card style={{ borderTop: `3px solid ${T.primary}` }}>
            <h4 style={{ color: T.primaryDark, margin: "0 0 4px", fontSize: 16 }}>✍️ 我的感悟</h4>
            <p style={{ color: T.textMuted, fontSize: 12, margin: "0 0 12px" }}>
              记录你的灵修感悟、祷告、或生活中的回应
            </p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder={"今天的经文让我想到了...\n我的祷告是...\n在生活中我可以..."}
              style={{
                width: "100%", minHeight: 160, border: `1px solid ${T.cardBorder}`,
                borderRadius: 10, padding: 14, fontSize: 15, resize: "vertical",
                fontFamily: "inherit", color: T.text, background: T.warm,
                boxSizing: "border-box", lineHeight: 1.9,
              }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <span style={{ color: T.textMuted, fontSize: 12 }}>{notes.length > 0 ? `${notes.length} 字` : ""}</span>
              <button onClick={saveNotes} style={{
                background: T.primary, color: "#fff", border: "none", borderRadius: 10,
                padding: "11px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(91,117,83,0.3)",
              }}>{saving ? "✓ 已保存!" : "💾 保存感悟"}</button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── App ───
export default function Home() {
  const [tab, setTab] = useState("read");
  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'Segoe UI', 'PingFang SC', sans-serif" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px 40px" }}>
        <div style={{ textAlign: "center", padding: "28px 0 8px" }}>
          <h1 style={{ color: T.primaryDark, margin: 0, fontSize: 24, fontWeight: 700 }}>🌿 Daily Growth</h1>
          <p style={{ color: T.textMuted, margin: "6px 0 0", fontSize: 13 }}>英语朗读 · 灵修笔记</p>
        </div>
        <Tabs active={tab} onChange={setTab} />
        {tab === "read" ? <MorningRead /> : <DailyDevotion />}
      </div>
    </div>
  );
}

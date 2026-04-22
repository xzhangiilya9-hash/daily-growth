import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const { scriptureInput } = await request.json();

  if (!scriptureInput?.trim()) {
    return Response.json({ error: "Scripture input is required" }, { status: 400 });
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  const prompt = `You are a thoughtful Christian devotional guide. Given a Bible passage reference or text, generate reflective questions. Return ONLY a JSON object with NO markdown backticks: {"scripture_ref":"the passage reference","questions":["question 1","question 2","question 3"]}. Questions should be in Chinese, deeply thoughtful, helping the reader connect scripture to daily life, inner growth, and relationship with God.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${prompt}\n\nToday's scripture reading: ${scriptureInput}` }] }],
          generationConfig: { temperature: 0.7 },
        }),
      }
    );

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    // Upsert — update if today's devotion exists, otherwise insert
    const { data: existing } = await supabase
      .from("devotions")
      .select("id, notes")
      .eq("date", todayStr)
      .single();

    if (existing) {
      await supabase.from("devotions").update({
        scripture_input: scriptureInput,
        scripture_ref: result.scripture_ref,
        questions: result.questions,
      }).eq("date", todayStr);
    } else {
      await supabase.from("devotions").insert({
        date: todayStr,
        scripture_input: scriptureInput,
        scripture_ref: result.scripture_ref,
        questions: result.questions,
        notes: "",
      });
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error("Generate questions error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

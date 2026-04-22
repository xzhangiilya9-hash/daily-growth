import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST() {
  const todayStr = new Date().toISOString().slice(0, 10);

  // Check if today's article already exists
  const { data: existing } = await supabase
    .from("articles")
    .select("id")
    .eq("date", todayStr)
    .single();

  if (existing) {
    return Response.json({ message: "Article already exists for today" });
  }

  const dayNum = Math.floor(Date.now() / 86400000);
  const style = dayNum % 2 === 0
    ? "natural spoken English conversation at upper-intermediate level"
    : "intermediate-to-advanced business English";
  const styleLabel = dayNum % 2 === 0 ? "Daily Conversation" : "Business English";

  const prompt = `You are an English learning content creator for upper-intermediate (B2-C1) learners. Generate a short article (250-320 words) in ${style} style for a Chinese professional improving their spoken English fluency. Use natural contractions, phrasal verbs, idiomatic expressions, nuanced vocabulary, and varied sentence structures. Avoid overly simple language — write the way an educated native speaker would actually talk or write in a professional/social context. Return ONLY a JSON object with NO markdown backticks:
{"title":"...","style":"${styleLabel}","content":"...the article text...","takeaways":[{"sentence":"A complete natural English sentence demonstrating a sophisticated idiomatic expression, phrasal verb, collocation, or native speaking pattern that an upper-intermediate learner should master","chinese":"这句话的完整中文翻译，包含对关键表达的简要解释"}]}
IMPORTANT: "takeaways" must contain 4-6 items. Each "sentence" must be a FULL practical sentence using expressions that go beyond basic English — focus on nuanced, natural, native-level patterns. Do NOT include vocabulary lists.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${prompt}\n\nGenerate a fresh article for ${todayStr}. Pick a practical, relatable topic relevant to a working professional.` }] }],
          generationConfig: { temperature: 0.9 },
        }),
      }
    );

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const article = JSON.parse(cleaned);

    const { error } = await supabase.from("articles").insert({
      date: todayStr,
      title: article.title,
      style: article.style || styleLabel,
      content: article.content,
      takeaways: article.takeaways || [],
      is_read: false,
    });

    if (error) throw error;

    return Response.json({ success: true });
  } catch (e) {
    console.error("Generate article error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

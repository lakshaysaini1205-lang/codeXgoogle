import type {
  AICategorization,
  IssueCategory,
  IssuePriority,
} from "./types";

interface CategoryRule {
  category: IssueCategory;
  keywords: string[];
  priority: IssuePriority;
  titleTemplates: string[];
}

const RULES: CategoryRule[] = [
  {
    category: "pothole",
    keywords: [
      "pothole",
      "hole",
      "road damage",
      "crack",
      "bump",
      "asphalt",
      "pavement",
      "road",
      "street surface",
      "uneven",
    ],
    priority: "high",
    titleTemplates: [
      "Pothole on {location}",
      "Road damage requiring repair",
      "Dangerous road surface defect",
    ],
  },
  {
    category: "water_leak",
    keywords: [
      "water",
      "leak",
      "leakage",
      "pipe",
      "burst",
      "flood",
      "sewage",
      "drain",
      "overflow",
      "waterlogging",
    ],
    priority: "critical",
    titleTemplates: [
      "Water leak reported",
      "Pipe burst / water leakage",
      "Flooding from water leak",
    ],
  },
  {
    category: "streetlight",
    keywords: [
      "light",
      "streetlight",
      "lamp",
      "dark",
      "lighting",
      "bulb",
      "pole",
      "flicker",
      "broken light",
    ],
    priority: "medium",
    titleTemplates: [
      "Streetlight not working",
      "Broken street lamp",
      "Area poorly lit at night",
    ],
  },
  {
    category: "waste",
    keywords: [
      "garbage",
      "trash",
      "waste",
      "dump",
      "litter",
      "bin",
      "rubbish",
      "sanitation",
      "smell",
      "overflowing",
    ],
    priority: "medium",
    titleTemplates: [
      "Illegal waste dumping",
      "Overflowing garbage bin",
      "Sanitation concern",
    ],
  },
  {
    category: "infrastructure",
    keywords: [
      "bridge",
      "footpath",
      "sidewalk",
      "bench",
      "park",
      "sign",
      "fence",
      "building",
      "public",
      "infrastructure",
      "damaged",
    ],
    priority: "medium",
    titleTemplates: [
      "Damaged public infrastructure",
      "Infrastructure maintenance needed",
      "Public facility in disrepair",
    ],
  },
  {
    category: "safety",
    keywords: [
      "danger",
      "unsafe",
      "accident",
      "hazard",
      "fallen tree",
      "wire",
      "electric",
      "fire",
      "crime",
      "security",
    ],
    priority: "critical",
    titleTemplates: [
      "Public safety hazard",
      "Immediate safety concern",
      "Dangerous condition reported",
    ],
  },
];

function scoreCategory(text: string, rule: CategoryRule): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const keyword of rule.keywords) {
    if (lower.includes(keyword)) {
      score += keyword.length > 5 ? 2 : 1;
    }
  }
  return score;
}

function extractTags(text: string, category: IssueCategory): string[] {
  const tags = [category.replace("_", "-")];
  const urgencyWords = ["urgent", "immediate", "dangerous", "severe", "large"];
  const lower = text.toLowerCase();
  for (const word of urgencyWords) {
    if (lower.includes(word)) tags.push(word);
  }
  if (lower.includes("school") || lower.includes("children")) tags.push("near-school");
  if (lower.includes("traffic") || lower.includes("highway")) tags.push("traffic-area");
  return [...new Set(tags)].slice(0, 5);
}

function adjustPriority(
  base: IssuePriority,
  text: string,
  confidence: number
): IssuePriority {
  const lower = text.toLowerCase();
  const urgent = ["urgent", "emergency", "dangerous", "accident", "children", "hospital"];
  if (urgent.some((w) => lower.includes(w))) return "critical";
  if (base === "critical" && confidence > 0.6) return "critical";
  if (confidence > 0.8 && base === "high") return "high";
  return base;
}

export function categorizeIssue(
  description: string,
  locationHint?: string
): AICategorization {
  const combined = `${description} ${locationHint ?? ""}`.trim();

  let bestRule: CategoryRule | null = null;
  let bestScore = 0;

  for (const rule of RULES) {
    const score = scoreCategory(combined, rule);
    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }

  const category: IssueCategory = bestRule?.category ?? "other";
  const maxPossible = bestRule ? bestRule.keywords.length * 2 : 1;
  const confidence = bestRule
    ? Math.min(0.95, 0.45 + (bestScore / maxPossible) * 0.5)
    : 0.35;

  const priority = adjustPriority(
    bestRule?.priority ?? "low",
    combined,
    confidence
  );

  const title =
    bestRule?.titleTemplates[0] ??
    (description.length > 60
      ? description.slice(0, 57) + "..."
      : description || "Community issue reported");

  const tags = extractTags(combined, category);

  const reasoning = bestRule
    ? `AI detected ${bestScore} keyword match(es) for "${category.replace("_", " ")}" with ${Math.round(confidence * 100)}% confidence. Priority set to ${priority} based on issue type and urgency signals.`
    : "Insufficient keyword matches — classified as general community issue. Manual review recommended.";

  return {
    category,
    confidence,
    priority,
    suggestedTitle: title,
    tags,
    reasoning,
  };
}

export async function categorizeWithAI(
  description: string,
  locationHint?: string
): Promise<AICategorization> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You categorize civic/community issues. Respond ONLY with valid JSON: {"category":"pothole|water_leak|streetlight|waste|infrastructure|safety|other","confidence":0.0-1.0,"priority":"low|medium|high|critical","suggestedTitle":"string","tags":["string"],"reasoning":"string"}`,
            },
            {
              role: "user",
              content: `Description: ${description}\nLocation: ${locationHint ?? "unknown"}`,
            },
          ],
          temperature: 0.2,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content ?? "";
        const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ""));
        return parsed as AICategorization;
      }
    } catch {
      // fall through to rule-based
    }
  }

  return categorizeIssue(description, locationHint);
}

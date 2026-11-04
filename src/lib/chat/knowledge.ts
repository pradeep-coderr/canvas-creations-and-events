import {
  PLAN_STEPS,
  botAnswer,
  GREETING,
  planQuestion,
  planSummary,
  type BotAnswer,
  type ChatBotContext,
  type ChatChoice,
  type ChatEvent,
  type PlanStep,
} from "./bot";

/*
 * Answers to typed messages (no AI): the message is matched against a few
 * topics (where we are, how to reach us, prices, what we style, dates,
 * photos, talking to a person, hello / thanks) and against the FAQ questions
 * published in Admin → Content → FAQs. Every fact comes from the site's own
 * content (ChatBotContext); nothing is invented. Up to two topics are answered
 * together ("how much, and where are you?"). The answer depends only on the
 * message and the content, so the visitor's chat and the admin inbox show the
 * same reply.
 */

type Topic = "hello" | "thanks" | "location" | "contact" | "pricing" | "style" | "date" | "work" | "person" | "bye";

/** Words and phrases that point to each topic (matched as whole words). */
const TOPICS: Record<Topic, string[]> = {
  hello: ["hi", "hello", "hey", "hiya", "good morning", "good afternoon", "good evening", "g'day", "gday", "namaste"],
  thanks: ["thanks", "thank you", "thankyou", "thx", "cheers", "appreciate", "awesome", "perfect", "great"],
  bye: ["bye", "goodbye", "see you", "see ya", "that's all", "thats all"],
  location: [
    "where", "location", "located", "locate", "address", "based", "suburb", "area", "areas", "near", "nearby",
    "travel", "come to", "service area", "adelaide", "south australia", "sa", "munno para", "visit", "studio", "far",
  ],
  contact: ["phone", "call", "number", "mobile", "email", "e-mail", "contact", "reach", "whatsapp", "text", "message you", "instagram", "facebook", "tiktok", "social"],
  pricing: ["price", "prices", "pricing", "cost", "costs", "how much", "budget", "quote", "quotes", "package", "packages", "rate", "rates", "charge", "fee", "fees", "expensive", "cheap", "affordable", "deposit", "pay", "payment", "$"],
  style: [
    "what do you do", "services", "service", "style", "styling", "decor", "decoration", "decorations", "decorate", "setup", "set up",
    "balloon", "balloons", "backdrop", "backdrops", "flower", "flowers", "floral", "florals", "theme", "themes", "table",
    "wedding", "weddings", "birthday", "birthdays", "baby shower", "engagement", "engagements", "corporate", "party", "parties",
    "mehndi", "mehendi", "henna", "haldi", "sangeet", "diwali", "eid", "cultural", "christening", "anniversary", "gender reveal",
    "bridal shower", "naming", "gala", "proposal", "baby",
  ],
  date: ["available", "availability", "free on", "book", "booking", "booked", "date", "dates", "weekend", "saturday", "sunday", "this month", "next month", "reserve", "lead time", "how soon", "how far in advance"],
  work: ["photo", "photos", "picture", "pictures", "pics", "gallery", "portfolio", "examples", "previous", "past work", "your work", "see your", "video", "videos"],
  person: ["human", "person", "real person", "someone", "somebody", "talk to", "speak to", "team", "staff", "owner", "agent", "call me", "call back", "callback"],
};

const STOP = new Set(
  "a an and are as at be by can could do does for from have how i i'm im in is it its me my of on or our please so that the their them there this to us we what when where which who will with would you your yours help make need want know get like just about any some".split(" "),
);

const normalise = (text: string) =>
  ` ${text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9$' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;

const words = (text: string) =>
  normalise(text)
    .trim()
    .split(" ")
    .map((w) => w.replace(/'s$/, "").replace(/s$/, ""))
    .filter((w) => w.length > 1 && !STOP.has(w));

function topicScores(message: string): [Topic, number][] {
  const text = normalise(message);
  return (Object.keys(TOPICS) as Topic[])
    .map((topic): [Topic, number] => [
      topic,
      TOPICS[topic].reduce((score, key) => {
        if (key === "$") return text.includes("$") ? score + 1 : score;
        const hit = text.includes(` ${key} `) || text.includes(` ${key}s `) || text.includes(` ${key}es `);
        return hit ? score + (key.includes(" ") ? 2 : 1) : score;
      }, 0),
    ])
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);
}

/** The FAQ whose question best matches the message (most of its key words). */
function bestFaq(message: string, ctx: ChatBotContext) {
  const said = new Set(words(message));
  let best: { answer: string; score: number } | null = null;
  for (const faq of ctx.faqs) {
    const asked = [...new Set(words(faq.question))];
    if (!asked.length) continue;
    const hits = asked.filter((w) => said.has(w)).length;
    const score = hits / asked.length;
    if (hits >= 1 && score >= 0.5 && (!best || score > best.score)) best = { answer: faq.answer, score };
  }
  return best;
}

const where = (ctx: ChatBotContext) => [ctx.address.locality, ctx.address.region].filter(Boolean).join(", ");

function contactLine(ctx: ChatBotContext) {
  const parts = [`call us on ${ctx.phone}`];
  if (ctx.email) parts.push(`email ${ctx.email}`);
  return parts.join(" or ");
}

/** One topic's answer, from the site's content. */
function topicAnswer(topic: Topic, ctx: ChatBotContext, message: string): BotAnswer {
  switch (topic) {
    case "hello":
      return { ...GREETING, text: "Hi there! Lovely to hear from you. What are you celebrating? I can help with what we style, prices, dates and more." };
    case "thanks":
      return { text: "You're very welcome! Is there anything else I can help with?", chips: ["pricing", "date", "team"] };
    case "bye":
      return { text: `Thanks for stopping by! If anything comes up, ${contactLine(ctx)}.`, chips: [] };
    case "location":
      return {
        text: `We're based in ${where(ctx)}. Tell us where your celebration will be and we'll confirm we can style it there.`,
        chips: ["date", "team"],
      };
    case "contact":
      return {
        text: `You can ${contactLine(ctx)}. Or leave your details here and the team will get back to you.`,
        chips: ["team"],
      };
    case "pricing":
      return botAnswer("pricing", ctx);
    case "style": {
      // "Do you do baby showers?": answer that occasion directly when we style it.
      const text = normalise(message);
      const asked = ctx.categories.find((c) => {
        const name = c.toLowerCase().replace(/s$/, "");
        const also = Object.entries(OCCASION_WORDS).find(([k]) => name.includes(k))?.[1] ?? [];
        return [name, ...also].some((w) => text.includes(` ${w}`));
      });
      if (asked) {
        return {
          text: `Yes, we style ${asked.toLowerCase()}! Every setup is designed around your theme, colours and venue: backdrops, balloons, florals and table styling.`,
          chips: ["work", "pricing", "date"],
        };
      }
      return botAnswer("style", ctx);
    }
    case "date":
      return botAnswer("date", ctx);
    case "work":
      return botAnswer("work", ctx);
    case "person":
      return botAnswer("team", ctx);
  }
}

/** Other words for an occasion (matched to the site's categories by name). */
const OCCASION_WORDS: Record<string, string[]> = {
  wedding: ["bridal", "reception", "ceremony", "marriage"],
  engagement: ["proposal", "ring ceremony"],
  birthday: ["bday", "b'day", "first birthday", "1st birthday", "sweet 16", "21st", "18th", "50th"],
  "baby shower": ["gender reveal", "naming", "christening", "baptism", "welcome baby", "baby"],
  cultural: ["mehndi", "mehendi", "henna", "haldi", "sangeet", "diwali", "eid", "pooja", "puja", "nikah", "teej", "dashain", "tihar", "festival"],
  corporate: ["office", "work party", "gala", "conference", "launch", "company", "business", "christmas party", "end of year"],
};

/** Topics that only make sense on their own (not merged with a second one). */
const SOLO: Topic[] = ["hello", "thanks", "bye"];

/**
 * The bot's reply to a typed message, or null when it has nothing useful to
 * say (then the team answers it; before handover the visitor is invited to
 * leave their details).
 */
export function answerTyped(message: string, ctx: ChatBotContext): BotAnswer | null {
  const faq = bestFaq(message, ctx);
  const topics = topicScores(message);

  // The owner's own FAQ answer wins when it clearly matches.
  if (faq && faq.score >= 0.75) return { text: faq.answer, chips: ["team", "pricing"] };

  const [first, second] = topics;
  if (!first) return faq ? { text: faq.answer, chips: ["team", "pricing"] } : null;
  // "Hi, how much is a backdrop?": answer the question, not the greeting.
  const main = SOLO.includes(first[0]) && second && !SOLO.includes(second[0]) ? second : first;
  const answer = topicAnswer(main[0], ctx, message);
  const other = topics.find(([t]) => t !== main[0] && !SOLO.includes(t) && !SOLO.includes(main[0]));
  if (!other || answer.form) return answer;
  const extra = topicAnswer(other[0], ctx, message);
  if (extra.form) return { ...extra, text: `${answer.text}\n\n${extra.text}` };
  return { text: `${answer.text}\n\n${extra.text}`, chips: [...new Set([...answer.chips, ...extra.chips])].slice(0, 3), link: answer.link ?? extra.link };
}

/** When nothing matched, before the visitor has shared their details (first time). */
export const UNSURE_ANSWER: BotAnswer = {
  text: "Good question! I'm not sure about that one, but the team will know. Leave your details and they'll reply here, usually within a few hours.",
  chips: ["team", "pricing", "style"],
};

/** Later misses: never leave the visitor without a reply; offer the details form. */
const STILL_UNSURE: BotAnswer[] = [
  {
    text: "Sorry, I didn't quite catch that. Leave your name and email or phone below and the team will answer you directly.",
    chips: [],
    form: "contact",
  },
  {
    text: "That one's best answered by the team. Pop your details in below and they'll get back to you.",
    chips: [],
    form: "contact",
  },
];

/** "what?", "huh", "??": the visitor is confused, so say plainly what the chat can do. */
const CLARIFY: BotAnswer = {
  text: "Sorry, let me be clearer! I can tell you what we style, our prices and where we're based, or check a date for you. Or leave your details and the team will reply.",
  chips: ["style", "pricing", "date", "team"],
};
const CONFUSED = new Set(["what", "huh", "pardon", "sorry", "eh", "hmm", "confused", "more", "what do you mean", "i dont understand", "i don't understand", "dont understand", "don't understand", "what what", "more what", "?"]);
/** "ok", "cool", "sure": a light nod, not a question. */
const ACK_WORDS = new Set(["ok", "okay", "k", "cool", "alright", "all right", "sure", "yes", "yep", "yeah", "no worries", "got it", "nice", "noted"]);
const ACK: BotAnswer = { text: "Great! Is there anything else I can help with?", chips: ["style", "pricing", "date", "team"] };

function isConfused(message: string) {
  const text = normalise(message).trim();
  if (/^[?!.\s]+$/.test(message.trim())) return true;
  return text.split(" ").length <= 4 && CONFUSED.has(text.replace(/\?/g, "").trim());
}

type BotMessage = {
  id: number;
  sender: "visitor" | "team" | "system";
  body: string;
  choice: ChatChoice | null;
  kind?: ChatEvent | null;
  planStep?: PlanStep | null;
};

/**
 * What the bot answered to each of the visitor's messages (by message id),
 * used by the visitor's chat and the admin inbox alike:
 *   - a menu choice gets its answer;
 *   - a typed message gets an answer from the site's content; a confused one
 *     ("what?", "huh") gets a plain list of what the chat can do; "ok" gets a
 *     light "anything else?"; anything else gets "not sure, ask the team",
 *     and after that the details form;
 *   - once a person has the chat (the visitor shared their details, the team
 *     replied, or the team turned the bot off for this chat), the bot stays
 *     quiet: typed messages are for the team. The team can turn it back on.
 * The on/off state comes from the chat's own history, so earlier answers
 * never change when the bot is switched later.
 */
export function botReplies(messages: BotMessage[], ctx: ChatBotContext) {
  const replies = new Map<number, BotAnswer>();
  let withTeam = false;
  let misses = 0;
  // "Plan my event": the answers so far (a new plan starts afresh).
  let plan: Partial<Record<PlanStep, string>> = {};
  for (const m of messages) {
    if (m.sender !== "visitor") {
      // "bot_on" hands the chat back to the bot; anything else from the team pauses it.
      withTeam = m.kind !== "bot_on";
      continue;
    }
    // Quote details and accepting a quote are for the team, not the bot.
    if (m.kind) continue;
    if (m.planStep) {
      plan[m.planStep] = m.body;
      if (withTeam) continue;
      const next = PLAN_STEPS[PLAN_STEPS.indexOf(m.planStep) + 1];
      replies.set(m.id, next ? planQuestion(next, ctx) : planSummary(plan));
      continue;
    }
    if (m.choice === "plan") plan = {};
    if (m.choice) {
      replies.set(m.id, botAnswer(m.choice, ctx));
    } else if (!withTeam) {
      const said = normalise(m.body).trim();
      const answer = ACK_WORDS.has(said) ? ACK : isConfused(m.body) ? CLARIFY : answerTyped(m.body, ctx);
      if (answer) replies.set(m.id, answer);
      else {
        // Always a reply before the team is involved; wording varies, then the form.
        replies.set(m.id, misses === 0 ? UNSURE_ANSWER : STILL_UNSURE[(misses - 1) % STILL_UNSURE.length]);
        misses++;
      }
    }
  }
  return replies;
}

/** Whether the bot answers this chat's next typed message (the same rule as botReplies). */
export function botActive(messages: Pick<BotMessage, "sender" | "kind">[]) {
  let withTeam = false;
  for (const m of messages) if (m.sender !== "visitor") withTeam = m.kind !== "bot_on";
  return !withTeam;
}

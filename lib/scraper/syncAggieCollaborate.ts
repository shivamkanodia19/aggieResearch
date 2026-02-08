/**
 * Aggie Collaborate Scraper
 *
 * Syncs research opportunities from https://aggiecollaborate.tamu.edu/projects/
 * by scraping the listing page and each project detail page, then upserting to DB.
 */

import * as cheerio from "cheerio";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { enrichOpportunity } from "@/lib/opportunities/enrichMajors";

const LISTING_URL = "https://aggiecollaborate.tamu.edu/projects/";
const BASE_URL = "https://aggiecollaborate.tamu.edu";
const FETCH_OPTIONS: RequestInit = {
  headers: {
    "User-Agent":
      "AggieResearchFinder/1.0 (Research opportunities aggregator; +https://aggieresearchfinder.com)",
  },
  signal: AbortSignal.timeout(15000),
};
const DELAY_MS = 300;

export type ScrapedContactRole =
  | "professor"
  | "phd_student"
  | "postdoc"
  | "lab_manager"
  | "research_scientist";

export interface ScrapedOpportunity {
  title: string;
  leader_name: string | null;
  leader_email: string | null;
  leader_department: string | null;
  project_type: string | null;
  status: string;
  who_can_join: string[] | null;
  description: string | null;
  team_needs: string | null;
  special_opportunities: string | null;
  categories: string[] | null;
  source_url: string;
  source: "aggie_collaborate";
  contact_role: ScrapedContactRole;
}

interface ListingEntry {
  url: string;
  title: string;
  status: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeUrl(href: string): string {
  const url = href.startsWith("http") ? href : new URL(href, BASE_URL).href;
  const u = new URL(url);
  if (!u.pathname.endsWith("/")) u.pathname += "/";
  return u.toString();
}

/** Parse listing page and return project links with status. */
async function fetchListingEntries(): Promise<ListingEntry[]> {
  const res = await fetch(LISTING_URL, FETCH_OPTIONS);
  if (!res.ok) throw new Error(`Listing fetch failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const entries: ListingEntry[] = [];
  let currentStatus = "Recruiting";

  $("h4, a[href*='aggiecollaborate.tamu.edu']").each((_, el) => {
    const $el = $(el);
    const tagName = (el as { name?: string }).name?.toLowerCase();

    if (tagName === "h4") {
      const text = $el.text().trim();
      if (text.includes("Projects Recruiting Team Members")) currentStatus = "Recruiting";
      else if (text.includes("Projects with Full Teams")) currentStatus = "Full Team";
      else if (text.includes("Completed Projects")) currentStatus = "Completed";
      return;
    }

    if (tagName === "a") {
      const href = $el.attr("href");
      if (!href) return;

      const fullUrl = normalizeUrl(href);
      const path = new URL(fullUrl).pathname.replace(/\/$/, "");
      if (!path || path === "/projects") return;

      const title = $el.text().replace(/^>\s*/, "").trim();
      if (!title) return;

      entries.push({ url: fullUrl, title, status: currentStatus });
    }
  });

  const seen = new Set<string>();
  return entries.filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}

/** Map listing status to DB status. */
function mapStatus(s: string): string {
  if (s === "Full Team") return "Full Team";
  if (s === "Completed") return "Completed";
  return "Recruiting";
}

/** Detect contact role from description and leader block text. */
function detectContactRole(
  leaderBlock: string | null,
  description: string | null
): ScrapedContactRole {
  const text = [leaderBlock, description].filter(Boolean).join(" ").toLowerCase();
  const name = (leaderBlock ?? "").toLowerCase();
  if (/\b(ph\.?d\.?\s*student|graduate\s*student|phd\s+student)\b/.test(text)) return "phd_student";
  if (/\bpostdoc\b|\bpost-doctoral\b/.test(text)) return "postdoc";
  if (/\blab\s+manager\b/.test(text)) return "lab_manager";
  if (/\bresearch\s+scientist\b/.test(text)) return "research_scientist";
  if (name.startsWith("dr.") || name.includes("professor")) return "professor";
  return "professor";
}

/** Parse a project detail page into ScrapedOpportunity fields. */
function parseDetailPage(
  html: string,
  sourceUrl: string,
  listingTitle: string,
  status: string
): ScrapedOpportunity {
  const $ = cheerio.load(html);
  const bodyText = $("body").text();

  const getSection = (label: string): string | null => {
    const idx = bodyText.indexOf(label);
    if (idx === -1) return null;
    const start = idx + label.length;
    const rest = bodyText.slice(start);
    const nextLabel = rest.match(/\n\s*(?:Team Leader|Project Type|Who Can Join|Project Description|Team Needs|Special Opportunities)/);
    const end = nextLabel ? nextLabel.index! : rest.length;
    return rest.slice(0, end).trim() || null;
  };

  let leader_name: string | null = null;
  let leader_email: string | null = null;
  let leader_department: string | null = null;

  const leaderBlock = getSection("Team Leader");
  if (leaderBlock) {
    const emailMatch = leaderBlock.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) leader_email = emailMatch[0];
    const parts = leaderBlock
      .replace(/[\w.-]+@[\w.-]+\.\w+/, "")
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length >= 1) leader_name = parts[0] + (parts[1] && !parts[1].startsWith("A&M") ? " " + parts[1] : "");
    if (parts.some((p) => p === "Biology" || p === "College" || p === "Station"))
      leader_department = parts.find((p) => p.length > 2 && !["Texas", "A&M", "College", "Station"].includes(p)) ?? null;
  }

  const projectType = getSection("Project Type");
  const whoCanJoinRaw = getSection("Who Can Join");
  const who_can_join = whoCanJoinRaw ? [whoCanJoinRaw] : null;
  const description = getSection("Project Description");
  const team_needs = getSection("Team Needs");
  const special_opportunities = getSection("Special Opportunities");

  if (leaderBlock && !leader_department) {
    const afterName = leaderBlock.replace(leader_name ?? "", "").trim();
    const words = afterName.split(/\s+/).filter(Boolean);
    if (words.length >= 1 && !words[0].includes("@")) leader_department = words[0];
  }

  const contact_role = detectContactRole(leaderBlock, description);
  return {
    title: listingTitle,
    leader_name: leader_name || null,
    leader_email,
    leader_department: leader_department || null,
    project_type: projectType || null,
    status: mapStatus(status),
    who_can_join,
    description,
    team_needs,
    special_opportunities,
    categories: ["Research"],
    source_url: sourceUrl,
    source: "aggie_collaborate",
    contact_role,
  };
}

/** Fetch one project detail page and return ScrapedOpportunity. */
async function fetchProjectDetail(
  entry: ListingEntry
): Promise<ScrapedOpportunity | null> {
  try {
    const res = await fetch(entry.url, FETCH_OPTIONS);
    if (!res.ok) return null;
    const html = await res.text();
    return parseDetailPage(html, entry.url, entry.title, entry.status);
  } catch (err) {
    console.error(`[sync] Failed to fetch ${entry.url}:`, err);
    return null;
  }
}

export async function scrapeAggieCollaborate(): Promise<ScrapedOpportunity[]> {
  const entries = await fetchListingEntries();
  const results: ScrapedOpportunity[] = [];

  for (let i = 0; i < entries.length; i++) {
    const opp = await fetchProjectDetail(entries[i]);
    if (opp) results.push(opp);
    if (i < entries.length - 1) await delay(DELAY_MS);
  }

  return results;
}

export async function syncOpportunitiesToDatabase(): Promise<{
  synced: number;
  archived: number;
  summarized?: number;
}> {
  const supabase = createServiceRoleClient();
  const scraped = await scrapeAggieCollaborate();
  const now = new Date().toISOString();
  const sourceUrls = new Set(scraped.map((s) => s.source_url));

  for (const opp of scraped) {
    const row = {
      title: opp.title,
      leader_name: opp.leader_name,
      leader_email: opp.leader_email,
      leader_department: opp.leader_department,
      project_type: opp.project_type,
      status: opp.status,
      who_can_join: opp.who_can_join,
      description: opp.description,
      team_needs: opp.team_needs,
      special_opportunities: opp.special_opportunities,
      categories: opp.categories,
      source_url: opp.source_url,
      source: opp.source,
      contact_role: opp.contact_role,
      last_synced: now,
      updated_at: now,
    };

    const { error } = await supabase.from("opportunities").upsert(row, {
      onConflict: "source_url",
      ignoreDuplicates: false,
    });
    if (error) console.error(`[sync] Upsert failed for ${opp.source_url}:`, error);
  }

  const { data: existing } = await supabase
    .from("opportunities")
    .select("id, source_url")
    .not("source_url", "is", null);

  let archived = 0;
  if (existing) {
    for (const row of existing) {
      if (row.source_url && !sourceUrls.has(row.source_url)) {
        const { error } = await supabase
          .from("opportunities")
          .update({ status: "Archived", updated_at: now })
          .eq("id", row.id);
        if (!error) archived++;
      }
    }
  }

  // Enrich opportunities with relevant_majors (keyword fallback; AI if any LLM key set)
  const { data: recruiting } = await supabase
    .from("opportunities")
    .select("id, title, description, who_can_join, relevant_majors, ai_summary")
    .eq("status", "Recruiting");

  const toEnrich = (recruiting ?? []).filter(
    (r) => !r.relevant_majors || r.relevant_majors.length === 0
  );

  const { hasAnyLLMKey } = await import("@/lib/llm");
  if (toEnrich.length > 0) {
    let enriched = 0;
    for (const row of toEnrich) {
      await enrichOpportunity(supabase, row as Parameters<typeof enrichOpportunity>[1]);
      enriched++;
      if (hasAnyLLMKey() && enriched < toEnrich.length) {
        await delay(300);
      }
    }
    console.log(`[sync] Enriched ${enriched} opportunities with majors`);
  }

  let summarized = 0;
  if (hasAnyLLMKey()) {
    try {
      const { summarizeNewOpportunities } = await import("@/lib/batch-summarize");
      const result = await summarizeNewOpportunities(supabase);
      summarized = result.summarized;
      if (result.summarized > 0 || result.failed > 0) {
        console.log(`[sync] Groq summarized ${result.summarized} opportunities, ${result.failed} failed`);
      }
    } catch (err) {
      console.error("[sync] Groq batch summarize error:", err);
    }

    // Technical discipline tags (engineering subfields, medicine, animal science, etc.); research can span multiple
    try {
      const { inferDisciplinesWithGroq } = await import("@/lib/opportunities/enrichDisciplines");
      const { data: toTag } = await supabase
        .from("opportunities")
        .select("id, title, description, who_can_join")
        .eq("status", "Recruiting")
        .or("technical_disciplines.is.null,technical_disciplines.eq.{}");
      let tagged = 0;
      for (const row of toTag ?? []) {
        try {
          const disciplines = await inferDisciplinesWithGroq(row);
          if (disciplines.length > 0) {
            const { error } = await supabase
              .from("opportunities")
              .update({
                technical_disciplines: disciplines,
                updated_at: new Date().toISOString(),
              })
              .eq("id", row.id);
            if (!error) tagged++;
          }
          await delay(400);
        } catch (e) {
          console.error(`[sync] Discipline tag failed for ${row.id}:`, e);
        }
      }
      if (tagged > 0) console.log(`[sync] Groq tagged ${tagged} opportunities with technical disciplines`);
    } catch (err) {
      console.error("[sync] Groq discipline tagging error:", err);
    }
  }

  console.log(`[sync] Synced ${scraped.length} opportunities, archived ${archived}`);
  return { synced: scraped.length, archived, summarized };
}

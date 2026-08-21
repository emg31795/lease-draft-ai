// Grounded statutory rules for notice periods and deadline day-counting.
//
// WHY THIS FILE EXISTS: before this, lib/generateNotice.js asked the LLM to invent
// statute citations and reason about statutory day-counting from scratch, with zero
// verification. That's the exact failure mode the product's own marketing warns
// landlords about ("judges dismiss up to 40% of self-filed cases over subtle notice
// flaws"). This file is the fix: it holds researched, sourced facts and computes the
// actual deadline date in code, so the LLM only formats prose around fixed facts
// instead of generating the facts themselves.
//
// SCOPE (Aug 2026): California, Texas, Florida, New York, and Ohio, for the notice
// types each state actually has a real statutory basis for. A few notice-type/state
// combinations are deliberately NOT grounded here and fall back to the old (ungrounded)
// LLM-only behavior in generateNotice.js, because the research found no clean statutory
// basis for them — see the New York "Cure or Quit" note below. Ohio's "60-Day Notice to
// Vacate" isn't grounded either, because Ohio law doesn't have that tier at all — the
// wizard UI (app/page.js) hides that option entirely for Ohio rather than offering a
// notice type with no statutory backing.
//
// SOURCING: every citation and rule below was researched against primary sources
// (leginfo.legislature.ca.gov, statutes.capitol.texas.gov, flsenate.gov, nysenate.gov,
// codes.ohio.gov, where fetchable) and cross-checked against secondary legal sources.
// Full source lists with URLs and detailed flagged-uncertainty sections live in the
// Claude Project as claude/roadmap.md's linked research docs (florida-legal-research.md,
// new-york-legal-research.md, ohio-legal-research.md) plus the CA/TX sourcing doc from
// the original pilot. This is NOT a substitute for review by a licensed landlord-tenant
// attorney — see the per-state notes below and the promptNotes attached to each rule,
// which surface the most legally load-bearing caveats directly in the generated notice.
//
// CA/TX known gaps (from the original pilot, still open):
//   - California: the Tenant Protection Act (Civil Code § 1946.2) can override the
//     plain 30/60-day notice-only rule entirely for tenancies covered by it. This file
//     does NOT determine TPA coverage — it surfaces a caution instead (see
//     CA_TPA_CAUTION below) rather than silently guessing.
//   - Texas: SB 38 (89th Legislature), effective Jan 1, 2026, changed day-counting for
//     Chapter 24 eviction notices (new § 24.0042) and notice delivery methods
//     (§ 24.005(f-3)/(f-4)). Texas has NO tenancy-length-based 30-vs-60-day distinction
//     the way California does — both wizard options resolve to the same § 91.001
//     "one month's notice" rule for Texas, with an explanatory note (see
//     TX_NO_TENANCY_TIER_CAUTION below) rather than fabricating a distinction that
//     doesn't exist in Texas law.
//   - Exact day-count effect of substituted/"nail and mail" service under CA CCP § 1162
//     could not be confirmed against a primary source (only secondary commentary).
//   - Full verbatim text of Civil Code § 1946.2 (CA just-cause) could not be fetched
//     directly from leginfo; summarized from AG guidance + secondary analysis.
//   - TX Property Code § 91.001's exact subsection lettering was only single-sourced.
//   - Eshagian v. Cepeda (Cal. Ct. App. 2025) is a very recent appellate decision
//     requiring CA 3-day notices to explicitly state the service date and counting
//     rule — implemented below, but worth confirming this hasn't been further
//     narrowed/expanded by a later decision.
//
// FL/NY/OH known gaps (Aug 2026 research pass — see the full docs in the Project for
// complete detail; the highest-priority items are repeated here since they directly
// affect the code below):
//   - Florida: § 83.56(3)'s "legal holidays" for the 3-day notice means "court-observed
//     holidays only," which is NOT Florida Statutes Ch. 683's general holiday list. This
//     file uses an approximate court-holiday calendar (see floridaCourtHolidays below)
//     that has not been checked against the Florida State Courts System's official
//     annual schedule or any single county's local administrative orders.
//   - Florida's 30/60-day Notice to Vacate deadline depends on the tenancy's actual
//     rental-period boundary (see periodicNoticeDeadline below), which requires the
//     landlord to supply a period-anchor date (the next rent due date) — if they don't,
//     this file falls back to an approximation (service date + 1 period) that may
//     understate the true required notice.
//   - Ohio: whether ORC § 1923.04's 3-day count excludes weekends/court holidays is
//     genuinely unresolved between sources — this file takes the more conservative
//     (longer) reading, which reduces the risk of filing too early, but it's a real
//     open question, not a settled one.
//   - New York: whether the RPL § 231-c Good Cause Eviction Law disclosure must be
//     appended statewide or only in NYC and municipalities that have separately opted
//     in is a genuine, unresolved source conflict — this file surfaces it as a caution
//     note rather than guessing which applies to a given property.
//   - New York: RPL § 226-c's exact tier boundary at exactly one/two years of occupancy
//     is implemented as a contiguous <1yr / 1–<2yr / ≥2yr split, which is the most
//     natural reading of the statute's "less than"/"more than" phrasing, but was not
//     confirmed against a byte-for-byte primary-source diff.
//   - New York has no clean statewide statutory basis for a pre-suit "Cure or Quit"
//     notice on a market-rate tenancy (the closest analogs are a post-judgment court
//     stay and a rent-stabilized-only regulation) — this file intentionally does NOT
//     add a 'Cure or Quit Notice' rule for New York, so it falls back to the prior
//     ungrounded AI behavior, and the wizard UI discloses this to the user directly.

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function nthWeekdayOfMonth(year, month, weekday, n) {
  // month is 0-indexed. Returns a Date for the nth occurrence of `weekday` (0=Sun) in month.
  const d = new Date(year, month, 1);
  let count = 0;
  while (true) {
    if (d.getDay() === weekday) {
      count++;
      if (count === n) return new Date(d);
    }
    d.setDate(d.getDate() + 1);
  }
}

function lastWeekdayOfMonth(year, month, weekday) {
  const d = new Date(year, month + 1, 0); // last day of month
  while (d.getDay() !== weekday) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// California judicial holidays (Cal. Rules of Court 10.1046 + Code Civ. Proc. § 135,
// approximate — verify against the current Judicial Council list annually, since these
// are subject to legislative changes like the Cesar Chavez Day / Juneteenth additions).
function californiaHolidays(year) {
  const dates = [
    new Date(year, 0, 1), // New Year's Day
    nthWeekdayOfMonth(year, 0, 1, 3), // MLK Day - 3rd Monday of January
    nthWeekdayOfMonth(year, 1, 1, 3), // Presidents Day - 3rd Monday of February
    new Date(year, 2, 31), // Cesar Chavez Day - March 31
    lastWeekdayOfMonth(year, 4, 1), // Memorial Day - last Monday of May
    new Date(year, 5, 19), // Juneteenth
    new Date(year, 6, 4), // Independence Day
    nthWeekdayOfMonth(year, 8, 1, 1), // Labor Day - 1st Monday of September
    nthWeekdayOfMonth(year, 9, 1, 2), // Indigenous Peoples' Day - 2nd Monday of October
    new Date(year, 10, 11), // Veterans Day
    nthWeekdayOfMonth(year, 10, 4, 4), // Thanksgiving - 4th Thursday of November
    addDays(nthWeekdayOfMonth(year, 10, 4, 4), 1), // day after Thanksgiving
    new Date(year, 11, 25), // Christmas Day
  ];
  return new Set(dates.map(dateKey));
}

// Texas state and federal holidays relevant to Property Code § 24.0042's "state or
// federal holiday" deadline-rollover rule (approximate — verify against the Texas
// comptroller's official holiday schedule annually).
function texasHolidays(year) {
  const dates = [
    new Date(year, 0, 1), // New Year's Day
    new Date(year, 0, 19), // Confederate Heroes Day
    nthWeekdayOfMonth(year, 0, 1, 3), // MLK Day
    nthWeekdayOfMonth(year, 1, 1, 3), // Presidents Day / Washington's Birthday
    new Date(year, 2, 2), // Texas Independence Day
    new Date(year, 3, 21), // San Jacinto Day
    lastWeekdayOfMonth(year, 4, 1), // Memorial Day
    new Date(year, 5, 19), // Emancipation Day (Juneteenth)
    new Date(year, 6, 4), // Independence Day
    nthWeekdayOfMonth(year, 8, 1, 1), // Labor Day
    nthWeekdayOfMonth(year, 9, 1, 2), // Columbus Day
    new Date(year, 10, 11), // Veterans Day
    nthWeekdayOfMonth(year, 10, 4, 4), // Thanksgiving
    addDays(nthWeekdayOfMonth(year, 10, 4, 4), 1), // day after Thanksgiving
    new Date(year, 11, 24), // Christmas Eve
    new Date(year, 11, 25), // Christmas Day
    new Date(year, 11, 26), // Day after Christmas
  ];
  return new Set(dates.map(dateKey));
}

// Florida court-observed holidays for Fla. Stat. § 83.56(3) purposes (approximate — this
// is NOT Ch. 683's general holiday list, which the statute explicitly does not use for
// this section. Verify against the Florida State Courts System's official annual
// holiday schedule; some circuits/counties observe a couple of additional discretionary
// closure days not captured here).
function floridaCourtHolidays(year) {
  const dates = [
    new Date(year, 0, 1), // New Year's Day
    nthWeekdayOfMonth(year, 0, 1, 3), // MLK Day
    lastWeekdayOfMonth(year, 4, 1), // Memorial Day
    new Date(year, 5, 19), // Juneteenth
    new Date(year, 6, 4), // Independence Day
    nthWeekdayOfMonth(year, 8, 1, 1), // Labor Day
    new Date(year, 10, 11), // Veterans Day
    nthWeekdayOfMonth(year, 10, 4, 4), // Thanksgiving
    addDays(nthWeekdayOfMonth(year, 10, 4, 4), 1), // day after Thanksgiving
    new Date(year, 11, 25), // Christmas Day
  ];
  return new Set(dates.map(dateKey));
}

// Ohio holidays used for the (genuinely unresolved — see file header) weekend/holiday
// exclusion practice on ORC § 1923.04's 3-day count. Approximate; verify against local
// municipal/county court closure calendars.
function ohioCourtHolidays(year) {
  const dates = [
    new Date(year, 0, 1), // New Year's Day
    nthWeekdayOfMonth(year, 0, 1, 3), // MLK Day
    nthWeekdayOfMonth(year, 1, 1, 3), // Presidents Day
    lastWeekdayOfMonth(year, 4, 1), // Memorial Day
    new Date(year, 5, 19), // Juneteenth
    new Date(year, 6, 4), // Independence Day
    nthWeekdayOfMonth(year, 8, 1, 1), // Labor Day
    new Date(year, 10, 11), // Veterans Day
    nthWeekdayOfMonth(year, 10, 4, 4), // Thanksgiving
    new Date(year, 11, 25), // Christmas Day
  ];
  return new Set(dates.map(dateKey));
}

// New York public holidays per General Construction Law § 24 (approximate — used only
// for GCL § 25-a's "roll the final deadline day forward" rule, not for excluding days
// throughout the count — see nyGCLDeadline below).
function newYorkPublicHolidays(year) {
  const firstMondayNov = nthWeekdayOfMonth(year, 10, 1, 1);
  const dates = [
    new Date(year, 0, 1), // New Year's Day
    nthWeekdayOfMonth(year, 0, 1, 3), // MLK Day
    new Date(year, 1, 12), // Lincoln's Birthday
    nthWeekdayOfMonth(year, 1, 1, 3), // Washington's Birthday
    lastWeekdayOfMonth(year, 4, 1), // Memorial Day
    new Date(year, 5, 19), // Juneteenth
    new Date(year, 6, 4), // Independence Day
    nthWeekdayOfMonth(year, 8, 1, 1), // Labor Day
    nthWeekdayOfMonth(year, 9, 1, 2), // Columbus Day
    addDays(firstMondayNov, 1), // Election Day - Tuesday after the first Monday in November
    new Date(year, 10, 11), // Veterans Day
    nthWeekdayOfMonth(year, 10, 4, 4), // Thanksgiving
    new Date(year, 11, 25), // Christmas Day
  ];
  return new Set(dates.map(dateKey));
}

function isCaliforniaHoliday(date) {
  return californiaHolidays(date.getFullYear()).has(dateKey(date));
}

function isTexasHoliday(date) {
  return texasHolidays(date.getFullYear()).has(dateKey(date));
}

function isFloridaCourtHoliday(date) {
  return floridaCourtHolidays(date.getFullYear()).has(dateKey(date));
}

function isOhioCourtHoliday(date) {
  return ohioCourtHolidays(date.getFullYear()).has(dateKey(date));
}

function isNewYorkPublicHoliday(date) {
  return newYorkPublicHolidays(date.getFullYear()).has(dateKey(date));
}

// California Code of Civil Procedure § 1161(2)/(3): "three days' notice, excluding
// Saturdays and Sundays and other judicial holidays." Count forward from the day after
// service, skipping weekends/holidays, until `days` valid days have been counted.
function californiaJudicialDaysDeadline(servedDate, days) {
  let d = new Date(servedDate);
  let counted = 0;
  while (counted < days) {
    d = addDays(d, 1);
    if (!isWeekend(d) && !isCaliforniaHoliday(d)) {
      counted++;
    }
  }
  return d;
}

// Texas Property Code § 24.0042 (added by SB 38, eff. Jan 1, 2026): exclude the day
// notice is given; count calendar days (weekends/holidays included in the running
// count); but if the resulting deadline itself falls on a Saturday, Sunday, or state/
// federal holiday, roll forward to the next day that isn't one of those.
function texasCalendarDaysWithRollover(servedDate, days) {
  let d = addDays(servedDate, days);
  while (isWeekend(d) || isTexasHoliday(d)) {
    d = addDays(d, 1);
  }
  return d;
}

// Fla. Stat. § 83.56(3): exclude Saturdays, Sundays, and court-observed holidays
// throughout the count (same shape as California's judicial-days rule). Day of delivery
// is not counted; count starts the day after delivery.
function floridaExcludedDaysDeadline(servedDate, days) {
  let d = new Date(servedDate);
  let counted = 0;
  while (counted < days) {
    d = addDays(d, 1);
    if (!isWeekend(d) && !isFloridaCourtHoliday(d)) {
      counted++;
    }
  }
  return d;
}

// Fla. Stat. § 83.56(2)(b): straight calendar days, confirmed against primary text to
// have NO weekend/holiday exclusion clause (unlike the 3-day notice in the same statute).
function floridaCalendarDaysDeadline(servedDate, days) {
  return addDays(servedDate, days);
}

// ORC § 1923.04: see file header — the weekend/holiday exclusion here is a real,
// unresolved source conflict. We take the more conservative (longer) reading, which
// matches documented Ohio court eviction-packet practice.
function ohioExcludedDaysDeadline(servedDate, days) {
  let d = new Date(servedDate);
  let counted = 0;
  while (counted < days) {
    d = addDays(d, 1);
    if (!isWeekend(d) && !isOhioCourtHoliday(d)) {
      counted++;
    }
  }
  return d;
}

// ORC § 5321.11: calendar days from receipt, no exclusion described in the statute.
function ohioCalendarDaysDeadline(servedDate, days) {
  return addDays(servedDate, days);
}

// NY General Construction Law §§ 20 and 25-a: exclude the day of service (day 0), count
// forward `days` ordinary calendar days (weekends/holidays count toward the total), then
// if the resulting deadline itself lands on a Saturday, Sunday, or public holiday, roll
// it forward to the next business day.
function nyGCLDeadline(servedDate, days) {
  let deadline = addDays(servedDate, days);
  while (isWeekend(deadline) || isNewYorkPublicHoliday(deadline)) {
    deadline = addDays(deadline, 1);
  }
  return deadline;
}

// Shared period-anchored deadline math for Fla. Stat. § 83.57 (30/60-day notices must
// land relative to the END of the current rental period) and ORC § 5321.17(B) (30-day
// notice must land ON the tenant's next periodic rental date). `anchorDate` is a period
// boundary the landlord supplied (their next rent due date / next periodic rental date).
// `periodMonths` is how many months one rental period spans (1 for month-to-month, 12
// for year-to-year). `endOfPeriodOffsetDays` is 0 when the deadline IS the boundary date
// itself (Ohio), or -1 when the deadline is the day BEFORE the next period starts, i.e.
// the end of the prior period (Florida). Walks forward one period at a time until the
// resulting deadline is at least `requiredDays` after the service date.
function periodicNoticeDeadline(servedDate, anchorDate, requiredDays, periodMonths, endOfPeriodOffsetDays) {
  let periodsOut = 0;
  while (true) {
    const boundary = addMonths(anchorDate, periodsOut);
    const deadline = addDays(boundary, endOfPeriodOffsetDays);
    const daysOfNotice = Math.round((deadline.getTime() - servedDate.getTime()) / 86400000);
    if (daysOfNotice >= requiredDays) return deadline;
    periodsOut += periodMonths;
  }
}

const CA_ABANDONED_PROPERTY_DISCLOSURE =
  'State law permits former tenants to reclaim abandoned personal property left at the ' +
  'former address of the tenant, subject to certain conditions. You may or may not be ' +
  'able to reclaim property without incurring additional costs, depending on the cost of ' +
  'storing the property and the length of time before it is reclaimed. In general, these ' +
  'costs will be lower the sooner you contact your former landlord after being notified ' +
  'that property belonging to you was left behind after you moved out.';

const CA_TPA_CAUTION =
  "CAUTION FOR LANDLORD (include as a clearly marked note, not as part of the formal " +
  "notice language itself): California's Tenant Protection Act (Civil Code § 1946.2) " +
  "may require a stated 'just cause' for this termination instead of (or in addition to) " +
  "the plain notice period below, unless this property is exempt (e.g. built within the " +
  "last 15 years, an owner-occupied duplex, or a qualifying single-family home/condo " +
  "with the required exemption notice already given in the lease). This tool does not " +
  "determine TPA coverage for you — confirm your property's status before relying on a " +
  "notice-only termination, since a covered property may require different notice " +
  "content entirely.";

const CA_JUDICIAL_DAYS_DISCLOSURE_NOTE =
  "Per a 2025 California Court of Appeal decision (Eshagian v. Cepeda), explicitly " +
  "state the exact date this notice was served, and state in plain language that the " +
  "notice period excludes Saturdays, Sundays, and judicial holidays, so an ordinary " +
  "tenant can determine the exact deadline from the face of the notice.";

const TX_NO_TENANCY_TIER_NOTE =
  "IMPORTANT: Texas law (Property Code § 91.001) does not vary the notice period for " +
  "terminating a month-to-month tenancy based on how long the tenant has lived there — " +
  "unlike some other states, there is no separate 30-day/60-day distinction in Texas. " +
  "The tenancy terminates on whichever is later: the date stated in this notice, or one " +
  "full month after the date this notice is given. State this plainly in the notice " +
  "rather than implying a tenancy-length-based rule that doesn't exist under Texas law.";

const FL_COURT_HOLIDAY_CAUTION =
  'CAUTION FOR LANDLORD (include as a clearly marked note, not as part of the formal ' +
  'notice language itself): Florida Statutes § 83.56(3) excludes Saturdays, Sundays, ' +
  'and "legal holidays" from this 3-day count, and the statute defines those holidays ' +
  'as court-observed holidays only — NOT the general list in Florida Statutes Chapter ' +
  '683. This tool uses an approximate court-holiday calendar; confirm the exact closure ' +
  "dates for your county's court before relying on this deadline for a filing.";

const FL_3DAY_MANDATORY_LANGUAGE_NOTE =
  'Florida law requires this 3-day notice to substantially track this statutory form — ' +
  'incorporate its substance (the amount owed, the property address, and the 3-day/' +
  'exclusion language) even if you do not quote it verbatim: "You are hereby notified ' +
  'that you are indebted to me in the sum of [amount] dollars for the rent and use of ' +
  'the premises [address], Florida, now occupied by you and that I demand payment of ' +
  'the rent or possession of the premises within 3 days (excluding Saturday, Sunday, ' +
  'and legal holidays) from the date of delivery of this notice, to wit: on or before ' +
  'the [day] of [month, year]."';

const FL_7DAY_CALENDAR_NOTE =
  'Florida Statutes § 83.56(2)(b) (this 7-day cure notice) contains no weekend/holiday ' +
  'exclusion language, unlike the 3-day nonpayment notice — this is a real, confirmed ' +
  'asymmetry in Florida law, not an error. State plainly that the count runs on ' +
  'straight calendar days from the date of delivery.';

const FL_PERIOD_END_NOTE =
  'IMPORTANT: under Florida Statutes § 83.57, this notice period is not simply N days ' +
  'from today — it must give the tenant at least the stated number of days’ notice ' +
  'before the END of the current rental period (the monthly or annual cycle the ' +
  'tenancy runs on). The deadline date given above already accounts for this using the ' +
  'rental-period date the landlord provided; state that deadline plainly as the ' +
  'termination date rather than implying a flat day-count from the service date.';

const OH_UNCONDITIONAL_DEMAND_NOTE =
  'Ohio Revised Code § 1923.04 is a generic, unconditional demand for possession — ' +
  'Ohio law gives the tenant no statutory right to cure by paying. Do not frame this ' +
  'as a conditional "pay within 3 days to avoid eviction" offer; frame it as a demand ' +
  'that the tenant leave the premises, noting that paying the amount owed is a ' +
  'practical (not a statutory) way to resolve the matter with the landlord.';

const OH_WEEKEND_HOLIDAY_CAUTION =
  'CAUTION FOR LANDLORD (include as a clearly marked note, not as part of the formal ' +
  'notice language itself): whether Ohio Revised Code § 1923.04’s 3-day count ' +
  'excludes weekends and court holidays is not settled by the statute’s own text — ' +
  'documented court practice in some Ohio counties excludes them (the more ' +
  'conservative rule, used for this deadline), but at least one legal source states ' +
  'the opposite. Confirm local municipal/county court practice before filing.';

const OH_3DAY_MANDATORY_LANGUAGE_NOTE =
  'Ohio Revised Code § 1923.04(A) requires this notice to include substantially this ' +
  'language, conventionally shown in bold or all-capital letters on official court ' +
  'forms: "You are being asked to leave the premises. If you do not leave, an ' +
  'eviction action may be initiated against you. If you are in doubt regarding your ' +
  'legal rights and obligations as a tenant, it is recommended that you seek legal ' +
  'assistance." Include this language clearly in the notice.';

const OH_CURE_SCOPE_NOTE =
  'Ohio has no general "cure or quit" statute for ordinary lease violations. This ' +
  'notice is valid ONLY for a health-and-safety noncompliance under Ohio Revised Code ' +
  '§ 5321.11 (e.g. failing to keep the unit sanitary or dispose of garbage properly) — ' +
  'it is not a lawful basis for curing other lease violations like an unauthorized pet ' +
  'or guest. State the specific health-or-safety duty violated and give the tenant ' +
  'until the computed deadline (not less than 30 days after receipt) to fix it.';

const OH_PERIODIC_DATE_NOTE =
  'Ohio Revised Code § 5321.17(B) requires this 30-day notice to expire on the ' +
  "tenant's periodic rental date (e.g. the recurring monthly rent due date), not " +
  'simply 30 days after service. The deadline above already accounts for that using ' +
  'the periodic rental date the landlord provided.';

const NY_TIER_NOTE =
  'New York Real Property Law § 226-c sets this notice period based on how long the ' +
  'tenant has occupied the unit or the length of their lease term, whichever is ' +
  'longer (under 1 year = 30 days, 1 to under 2 years = 60 days, 2+ years = 90 days). ' +
  'Confirm the occupancy length used to select this notice period is correct before ' +
  'relying on it — too short a period makes the notice legally insufficient.';

const NY_GOOD_CAUSE_CAUTION =
  'CAUTION FOR LANDLORD (include as a clearly marked note, not as part of the formal ' +
  'notice language itself): as of the 2024 Good Cause Eviction Law, New York Real ' +
  'Property Law § 231-c may require this notice to append a separate "Good Cause ' +
  'Eviction Law" disclosure form stating whether this tenancy is covered. This ' +
  'applies at minimum in New York City, and in a growing list of other ' +
  "municipalities that have separately opted in. This tool does not determine your " +
  "property's Good Cause coverage or your municipality's opt-in status — confirm " +
  'this before relying on this notice alone.';

const NY_RENT_DEMAND_NOTE =
  'New York RPAPL § 711(2) requires this rent demand to state, in the alternative, ' +
  'both the amount of rent owed and the fact that the tenant may pay that amount or ' +
  'surrender possession — include both options explicitly.';

const RULES = {
  California: {
    'Pay or Quit Notice': {
      citation: 'California Code of Civil Procedure § 1161(2)',
      noticePeriodLabel: '3 days (excluding Saturdays, Sundays, and judicial holidays)',
      computeDeadline: (servedDate) => californiaJudicialDaysDeadline(servedDate, 3),
      promptNotes: [CA_JUDICIAL_DAYS_DISCLOSURE_NOTE],
    },
    'Cure or Quit Notice': {
      citation: 'California Code of Civil Procedure § 1161(3)',
      noticePeriodLabel: '3 days (excluding Saturdays, Sundays, and judicial holidays)',
      computeDeadline: (servedDate) => californiaJudicialDaysDeadline(servedDate, 3),
      promptNotes: [CA_JUDICIAL_DAYS_DISCLOSURE_NOTE],
    },
    '30-Day Notice to Vacate': {
      citation: 'California Civil Code § 1946.1(b)',
      noticePeriodLabel: '30 calendar days',
      computeDeadline: (servedDate) => addDays(servedDate, 30),
      promptNotes: [CA_ABANDONED_PROPERTY_DISCLOSURE, CA_TPA_CAUTION],
    },
    '60-Day Notice to Vacate': {
      citation: 'California Civil Code § 1946.1(a)',
      noticePeriodLabel: '60 calendar days',
      computeDeadline: (servedDate) => addDays(servedDate, 60),
      promptNotes: [CA_ABANDONED_PROPERTY_DISCLOSURE, CA_TPA_CAUTION],
    },
  },
  Texas: {
    'Pay or Quit Notice': {
      citation: 'Texas Property Code § 24.005(a), computed per § 24.0042',
      noticePeriodLabel:
        '3 days by default (calendar days, but the deadline itself rolls forward past a ' +
        'Saturday, Sunday, or state/federal holiday) — confirm the lease does not specify a different period',
      computeDeadline: (servedDate) => texasCalendarDaysWithRollover(servedDate, 3),
      promptNotes: [
        'Texas Property Code § 24.005 allows the lease to specify a different notice ' +
          'period than the 3-day default — note in the notice that this assumes the ' +
          'statutory default applies.',
      ],
    },
    'Cure or Quit Notice': {
      citation: 'Texas Property Code § 24.005(a), computed per § 24.0042',
      noticePeriodLabel:
        '3 days by default (calendar days, with deadline rollover past weekends/holidays) — ' +
        'Texas has no separate statutory "cure" notice type; this is a standard notice to vacate for a lease violation',
      computeDeadline: (servedDate) => texasCalendarDaysWithRollover(servedDate, 3),
      promptNotes: [
        'Texas does not have a distinct "cure or quit" statute the way California does. ' +
          'State plainly that this is a notice to vacate for a lease violation under ' +
          'Property Code § 24.005, and that any right to cure comes from the lease itself, not state law.',
      ],
    },
    '30-Day Notice to Vacate': {
      citation: 'Texas Property Code § 91.001(b)',
      noticePeriodLabel: 'one full month (not a flat 30-day count)',
      computeDeadline: (servedDate) => addMonths(servedDate, 1),
      promptNotes: [TX_NO_TENANCY_TIER_NOTE],
    },
    '60-Day Notice to Vacate': {
      citation: 'Texas Property Code § 91.001(b)',
      noticePeriodLabel: 'one full month (Texas has no 60-day tier)',
      computeDeadline: (servedDate) => addMonths(servedDate, 1),
      promptNotes: [TX_NO_TENANCY_TIER_NOTE],
    },
  },
  Florida: {
    'Pay or Quit Notice': {
      citation: 'Florida Statutes § 83.56(3)',
      noticePeriodLabel: '3 days (excluding Saturdays, Sundays, and Florida court-observed holidays)',
      computeDeadline: (servedDate) => floridaExcludedDaysDeadline(servedDate, 3),
      promptNotes: [FL_COURT_HOLIDAY_CAUTION, FL_3DAY_MANDATORY_LANGUAGE_NOTE],
    },
    'Cure or Quit Notice': {
      citation: 'Florida Statutes § 83.56(2)(b)',
      noticePeriodLabel: '7 calendar days from delivery (no weekend/holiday exclusion for this notice type)',
      computeDeadline: (servedDate) => floridaCalendarDaysDeadline(servedDate, 7),
      promptNotes: [FL_7DAY_CALENDAR_NOTE],
    },
    '30-Day Notice to Vacate': {
      citation: 'Florida Statutes § 83.57(3) (month-to-month tenancy)',
      noticePeriodLabel:
        'at least 30 days’ notice prior to the end of the current monthly rental period (not simply 30 days from today)',
      computeDeadline: (servedDate, fields) =>
        periodicNoticeDeadline(
          servedDate,
          parsePeriodAnchor(fields?.periodStartDate, servedDate, 1),
          30,
          1,
          -1
        ),
      promptNotes: [FL_PERIOD_END_NOTE],
    },
    '60-Day Notice to Vacate': {
      citation: 'Florida Statutes § 83.57(1) (year-to-year tenancy)',
      noticePeriodLabel:
        'at least 60 days’ notice prior to the end of the current annual rental period (not simply 60 days from today)',
      computeDeadline: (servedDate, fields) =>
        periodicNoticeDeadline(
          servedDate,
          parsePeriodAnchor(fields?.periodStartDate, servedDate, 12),
          60,
          12,
          -1
        ),
      promptNotes: [FL_PERIOD_END_NOTE],
    },
  },
  Ohio: {
    'Pay or Quit Notice': {
      citation: 'Ohio Revised Code § 1923.04',
      noticePeriodLabel:
        '3 days (Ohio court practice excludes Saturdays, Sundays, and court holidays, though this is not settled by the statute’s text — see caution note)',
      computeDeadline: (servedDate) => ohioExcludedDaysDeadline(servedDate, 3),
      promptNotes: [OH_UNCONDITIONAL_DEMAND_NOTE, OH_WEEKEND_HOLIDAY_CAUTION, OH_3DAY_MANDATORY_LANGUAGE_NOTE],
    },
    'Cure or Quit Notice': {
      citation: 'Ohio Revised Code § 5321.11 (health-and-safety noncompliance only)',
      noticePeriodLabel: '30 calendar days from the tenant’s receipt of notice',
      computeDeadline: (servedDate) => ohioCalendarDaysDeadline(servedDate, 30),
      promptNotes: [OH_CURE_SCOPE_NOTE],
    },
    '30-Day Notice to Vacate': {
      citation: 'Ohio Revised Code § 5321.17(B)',
      noticePeriodLabel: 'at least 30 days’ notice, expiring on the tenant’s next periodic rental date',
      computeDeadline: (servedDate, fields) =>
        periodicNoticeDeadline(
          servedDate,
          parsePeriodAnchor(fields?.periodStartDate, servedDate, 1),
          30,
          1,
          0
        ),
      promptNotes: [OH_PERIODIC_DATE_NOTE],
    },
    // No '60-Day Notice to Vacate' entry: ORC § 5321.17 has no such tier. app/page.js
    // hides this option from the wizard entirely when Ohio is selected.
  },
  'New York': {
    'Pay or Quit Notice': {
      citation: 'RPAPL § 711(2), as amended by the Housing Stability and Tenant Protection Act of 2019',
      noticePeriodLabel:
        '14 days (day of service excluded; all calendar days count; deadline rolls to the next business day if it lands on a weekend or public holiday)',
      computeDeadline: (servedDate) => nyGCLDeadline(servedDate, 14),
      promptNotes: [NY_RENT_DEMAND_NOTE, NY_GOOD_CAUSE_CAUTION],
    },
    // No 'Cure or Quit Notice' entry: no clean statewide statutory basis for a pre-suit
    // cure notice on a market-rate NY tenancy — see file header. Falls back to the
    // ungrounded AI path; app/page.js discloses this to the user for New York.
    '30-Day Notice to Vacate': {
      citation: 'New York Real Property Law § 226-c(2)(b)',
      noticePeriodLabel: '30 days (occupancy or lease term under 1 year)',
      computeDeadline: (servedDate) => nyGCLDeadline(servedDate, 30),
      promptNotes: [NY_TIER_NOTE, NY_GOOD_CAUSE_CAUTION],
    },
    '60-Day Notice to Vacate': {
      citation: 'New York Real Property Law § 226-c(2)(c)',
      noticePeriodLabel: '60 days (occupancy or lease term at least 1 year but under 2 years)',
      computeDeadline: (servedDate) => nyGCLDeadline(servedDate, 60),
      promptNotes: [NY_TIER_NOTE, NY_GOOD_CAUSE_CAUTION],
    },
    '90-Day Notice to Vacate': {
      citation: 'New York Real Property Law § 226-c(2)(d)',
      noticePeriodLabel: '90 days (occupancy or lease term 2 years or more)',
      computeDeadline: (servedDate) => nyGCLDeadline(servedDate, 90),
      promptNotes: [NY_TIER_NOTE, NY_GOOD_CAUSE_CAUTION],
    },
  },
};

// Resolves the period-boundary date used by Florida's and Ohio's period-anchored
// notices. If the landlord didn't supply one (shouldn't happen — the wizard requires
// it for these notice types — but never throw on bad input), approximate with one
// period out from the service date so a deadline still computes.
function parsePeriodAnchor(periodStartDate, servedDate, fallbackPeriodMonths) {
  if (periodStartDate) {
    const parsed = new Date(`${periodStartDate}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return addMonths(servedDate, fallbackPeriodMonths);
}

// New York's RPL § 226-c notice period is driven by tenant occupancy length (or lease
// term, whichever is longer), not a free-standing choice — the wizard uses this to
// auto-select the correct 30/60/90-day notice type from a "how long has the tenant
// lived there" input. Exported so app/page.js can drive the same logic client-side.
export function nyTierNoticeTypeForOccupancyMonths(months) {
  const n = Number(months);
  if (!Number.isFinite(n) || n < 0) return '30-Day Notice to Vacate';
  if (n < 12) return '30-Day Notice to Vacate';
  if (n < 24) return '60-Day Notice to Vacate';
  return '90-Day Notice to Vacate';
}

// Whether a given state/noticeType pair has a real grounded rule in this file — used by
// app/page.js for the "verified in code" vs. "AI-drafted" microcopy instead of a blunt
// per-state flag, since grounding is now per notice-type (e.g. New York's Cure or Quit
// isn't grounded even though its other notice types are).
export function isNoticeTypeGrounded(state, noticeType) {
  return Boolean(RULES[state]?.[noticeType]);
}

// Returns null if this state/noticeType combination isn't grounded (e.g. New York's
// "Cure or Quit," or Ohio's "60-Day Notice to Vacate," or any state/type pair not
// researched) — callers should fall back to the prior LLM-only behavior in that case,
// not throw.
export function getGroundedNoticeFacts({ state, noticeType, serveDate, periodStartDate }) {
  const stateRules = RULES[state];
  const rule = stateRules?.[noticeType];
  if (!rule) return null;

  // serveDate comes from the wizard as an HTML date input value (YYYY-MM-DD). Fall back
  // to today if it's missing/unparseable so this never throws on bad input — the AI
  // prompt layer already validates required fields before this is called.
  const parsedServeDate = serveDate ? new Date(`${serveDate}T00:00:00`) : new Date();
  const servedDate = Number.isNaN(parsedServeDate.getTime()) ? new Date() : parsedServeDate;

  const deadline = rule.computeDeadline(servedDate, { periodStartDate });
  const deadlineLabel = deadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    citation: rule.citation,
    noticePeriodLabel: rule.noticePeriodLabel,
    deadlineLabel,
    promptNotes: rule.promptNotes,
  };
}

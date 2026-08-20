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
// SCOPE (Aug 2026 pilot): California and Texas only, for the 4 notice types the wizard
// currently offers. Florida, New York, and Ohio are NOT covered here yet — they still
// fall back to the old (ungrounded) LLM-only behavior in generateNotice.js until they
// get the same research-and-verify treatment.
//
// SOURCING: every citation and rule below was researched against primary sources
// (leginfo.legislature.ca.gov / statutes.capitol.texas.gov where fetchable) and
// cross-checked against secondary legal sources. Full source list with URLs was
// provided alongside this change for a human (non-lawyer) spot-check — see the PR
// description / chat handoff. This is NOT a substitute for review by a licensed
// landlord-tenant attorney, especially for:
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
//
// Known gaps flagged during research that a human should verify before this ships to
// real customers (not blocking, but real):
//   - Exact day-count effect of substituted/"nail and mail" service under CA CCP § 1162
//     could not be confirmed against a primary source (only secondary commentary).
//   - Full verbatim text of Civil Code § 1946.2 (CA just-cause) could not be fetched
//     directly from leginfo; summarized from AG guidance + secondary analysis.
//   - TX Property Code § 91.001's exact subsection lettering was only single-sourced.
//   - Eshagian v. Cepeda (Cal. Ct. App. 2025) is a very recent appellate decision
//     requiring CA 3-day notices to explicitly state the service date and counting
//     rule — implemented below, but worth confirming this hasn't been further
//     narrowed/expanded by a later decision.

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

function isCaliforniaHoliday(date) {
  return californiaHolidays(date.getFullYear()).has(dateKey(date));
}

function isTexasHoliday(date) {
  return texasHolidays(date.getFullYear()).has(dateKey(date));
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
};

// Returns null if this state/noticeType combination isn't grounded yet (e.g. FL, NY,
// OH, or a state/type pair not researched) — callers should fall back to the prior
// LLM-only behavior in that case, not throw.
export function getGroundedNoticeFacts({ state, noticeType, serveDate }) {
  const stateRules = RULES[state];
  const rule = stateRules?.[noticeType];
  if (!rule) return null;

  // serveDate comes from the wizard as an HTML date input value (YYYY-MM-DD). Fall back
  // to today if it's missing/unparseable so this never throws on bad input — the AI
  // prompt layer already validates required fields before this is called.
  const parsedServeDate = serveDate ? new Date(`${serveDate}T00:00:00`) : new Date();
  const servedDate = Number.isNaN(parsedServeDate.getTime()) ? new Date() : parsedServeDate;

  const deadline = rule.computeDeadline(servedDate);
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

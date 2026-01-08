export function tagMistake(expected, actual, metadata = {}) {
  expected = (expected ?? "").toLowerCase().trim();
  actual = (actual ?? "").toLowerCase().trim();

  const tags = [];

  // Letter reversals (b↔d, p↔q, m↔w)
  const flip = { b: "d", d: "b", p: "q", q: "p", m: "w", w: "m", u: "n", n: "u" };
  if (expected.length === 1 && flip[expected] === actual) {
    tags.push({ tag: "letter_reversal", confidence: 0.95, source: "rule_based" });
  }

  // Visual look-alike letters
  const visualPairs = [["h", "n"], ["i", "l"], ["c", "o"], ["m", "n"]];
  if (
    expected.length === 1 &&
    visualPairs.some((p) => p.includes(expected) && p.includes(actual))
  ) {
    tags.push({ tag: "visual_processing", confidence: 0.8, source: "rule_based" });
  }

  // Sequencing issue: same letters, wrong order
  if (
    expected.length > 1 &&
    expected.split("").sort().join("") === actual.split("").sort().join("") &&
    expected !== actual
  ) {
    tags.push({ tag: "sequencing", confidence: 0.85, source: "rule_based" });
  }

  // Working memory (simple check: too long to answer)
  if (metadata?.timeTakenMs > 10000) {
    tags.push({ tag: "working_memory", confidence: 0.5, source: "rule_based" });
  }

  // Phonological (expand later with ML)
  const phonology = {
    ship: ["chip", "sip", "sheep"],
    cat: ["cap", "cut"],
  };

  if (phonology[expected]?.includes(actual)) {
    tags.push({
      tag: "phonological_awareness",
      confidence: 0.7,
      source: "rule_based",
    });
  }

  if (tags.length === 0) {
    tags.push({ tag: "other", confidence: 0.3, source: "rule_based" });
  }

  return tags;
}

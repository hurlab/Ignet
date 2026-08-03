// Pull the human-readable text out of a BioSummarAI / summarize response.
//
// The service replies with an envelope, not a bare string:
//
//   { Summary: { reply: "...", conversation_history: [...] }, entities: {...} }
//
// `conversation_history` carries the full system + user + assistant turns, so
// rendering the envelope verbatim shows the prompt back to the user along with
// every entity count. Gene.jsx did exactly that: it probed `summary` (lowercase)
// and `data`, neither of which exists, then fell through to JSON.stringify.
//
// Key order matters. `data.reply` is checked before `Summary.reply` because
// BioSummarAI.jsx has always resolved it that way, and a wrapped response would
// otherwise change which field wins.
export function extractSummaryText(res) {
  if (typeof res === 'string') return res
  if (!res || typeof res !== 'object') return null

  const text =
    res.data?.reply ??
    res.Summary?.reply ??
    res.reply ??
    res.summary ??
    res.text ??
    null

  // A non-string here (an object, an array) means the shape moved again --
  // treat it as absent rather than letting React stringify it downstream.
  return typeof text === 'string' && text.trim() ? text : null
}

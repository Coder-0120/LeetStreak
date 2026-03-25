const axios = require("axios");

const LC_HEADERS = (username) => ({
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Referer": `https://leetcode.com/${username}/`,
  "Origin": "https://leetcode.com",
});

async function hasUserSubmittedToday(username) {
  try {
    const res = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: `
          query userCalendar($username: String!) {
            matchedUser(username: $username) {
              userCalendar { submissionCalendar }
            }
          }
        `,
        variables: { username },
      },
      { headers: LC_HEADERS(username) }
    );

    const calStr = res.data?.data?.matchedUser?.userCalendar?.submissionCalendar;
    if (!calStr) return false;

    const calendar = JSON.parse(calStr);
    const now = new Date();
    const utcToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000;

    return (calendar[utcToday] || 0) > 0;
  } catch (err) {
    console.error("LeetCode hasUserSubmittedToday error:", err.message);
    return false;
  }
}

/**
 * Returns { easy, medium, hard, totalSolved } by reading LeetCode's
 * acSubmissionNum counts DIRECTLY — no looping/pushing into arrays.
 *
 * acSubmissionNum shape from LeetCode:
 *   [
 *     { difficulty: "All",    count: 320 },  ← use this for totalSolved
 *     { difficulty: "Easy",   count: 150 },
 *     { difficulty: "Medium", count: 120 },
 *     { difficulty: "Hard",   count:  50 },
 *   ]
 */
async function fetchUserStats(username) {
  try {
    const res = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              submitStats: submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
          }
        `,
        variables: { username },
      },
      { headers: LC_HEADERS(username) }
    );

    const acStats = res.data?.data?.matchedUser?.submitStats?.acSubmissionNum;
    if (!acStats) return { easy: 0, medium: 0, hard: 0, totalSolved: 0 };

    // Build lookup keyed by lowercase difficulty name
    const lookup = {};
    for (const item of acStats) {
      lookup[item.difficulty.toLowerCase()] = item.count;
    }

    const easy        = lookup["easy"]   ?? 0;
    const medium      = lookup["medium"] ?? 0;
    const hard        = lookup["hard"]   ?? 0;
    // "all" bucket is the authoritative total LeetCode shows on profile
    const totalSolved = lookup["all"]    ?? (easy + medium + hard);

    return { easy, medium, hard, totalSolved };
  } catch (err) {
    console.error("LeetCode fetchUserStats error:", err.message);
    return { easy: 0, medium: 0, hard: 0, totalSolved: 0 };
  }
}

module.exports = { hasUserSubmittedToday, fetchUserStats };
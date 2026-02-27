const express = require("express");
const axios = require("axios");
const router = express.Router();

const LC_GQL = "https://leetcode.com/graphql";
const headers = { "Content-Type": "application/json" };
const { hasUserSubmittedToday } = require("../services/leetcodeService");


// ── 1. Solve stats (existing, unchanged) ──────────────────────────────────────
router.get("/status/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const hasSubmittedToday = await hasUserSubmittedToday(username);

    res.json({
      username,
      hasSubmittedToday,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch submission status" });
  }
});

// ── 0. Difficulty stats (Easy / Medium / Hard / All)
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const response = await axios.post(LC_GQL, {
      query: `
        query userProblemsSolved($username: String!) {
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
    }, { headers });

    const stats =
      response.data?.data?.matchedUser?.submitStats?.acSubmissionNum;

    if (!stats) return res.status(404).json({ message: "Stats not found" });

    res.json(stats); // returns All, Easy, Medium, Hard
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// // ── 2. Today's submission status (existing, unchanged) ────────────────────────
// router.get("/status/:username", async (req, res) => {
//   const { username } = req.params;
//   try {
//     const response = await axios.post(LC_GQL, {
//       query: `
//         query userCalendar($username: String!) {
//           matchedUser(username: $username) {
//             userCalendar { submissionCalendar }
//           }
//         }`,
//       variables: { username },
//     }, { headers });

//     const calStr = response.data?.data?.matchedUser?.userCalendar?.submissionCalendar;
//     if (!calStr) return res.status(404).json({ message: "Calendar not found" });

//     const calendar = JSON.parse(calStr);
//     const now = new Date();
//     const utcToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000;
//     const submissionsToday = calendar[utcToday] || 0;

//     res.json({ username, hasSubmittedToday: submissionsToday > 0, submissionsToday });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch submission status" });
//   }
// });

// ── 3. NEW: Full profile (rank, name, avatar, country, beats%, languages, badges)
router.get("/profile/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const response = await axios.post(LC_GQL, {
      query: `
        query fullProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              realName
              userAvatar
              countryName
              company
              school
              ranking
            }
            problemsSolvedBeatsStats {
              difficulty
              percentage
            }
            languageProblemCount {
              languageName
              problemsSolved
            }
            badges {
              id
              displayName
              icon
              creationDate
            }
          }
        }`,
      variables: { username },
    }, { headers });

    const user = response.data?.data?.matchedUser;
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      username: user.username,
      profile: user.profile,
      beatsStats: user.problemsSolvedBeatsStats,
      languages: user.languageProblemCount,
      badges: user.badges,
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch full profile" });
  }
});

// ── 4. NEW: Streak & active days (from userCalendar, same endpoint you have)
router.get("/calendar/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const response = await axios.post(LC_GQL, {
      query: `
        query userCalendarFull($username: String!) {
          matchedUser(username: $username) {
            userCalendar {
              activeYears
              streak
              totalActiveDays
              submissionCalendar
            }
          }
        }`,
      variables: { username },
    }, { headers });

    const cal = response.data?.data?.matchedUser?.userCalendar;
    if (!cal) return res.status(404).json({ message: "Calendar not found" });

    // Parse submissionCalendar into { timestamp: count } and build heatmap array
    const calMap = JSON.parse(cal.submissionCalendar);

    // Build last-365-days array for heatmap [ { date, count } ]
    const days = [];
    const now = Date.now();
    for (let i = 364; i >= 0; i--) {
      const ts = Math.floor((now - i * 86400000) / 1000);
      // LeetCode keys are UTC midnight timestamps — find the closest key
      const dayStart = ts - (ts % 86400);
      days.push({ date: new Date(dayStart * 1000).toISOString().split("T")[0], count: calMap[dayStart] || 0 });
    }

    res.json({
      streak: cal.streak,
      totalActiveDays: cal.totalActiveDays,
      activeYears: cal.activeYears,
      heatmap: days, // 365 days of real data
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch calendar" });
  }
});

// ── 5. NEW: Recent submissions (last 20, public)
router.get("/submissions/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const response = await axios.post(LC_GQL, {
      query: `
        query recentSubmissions($username: String!) {
          recentSubmissionList(username: $username, limit: 20) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
          }
        }`,
      variables: { username },
    }, { headers });

    const submissions = response.data?.data?.recentSubmissionList;
    if (!submissions) return res.status(404).json({ message: "No submissions found" });

    res.json(submissions);
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
});

// ── 6. NEW: Contest ranking
router.get("/contest/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const response = await axios.post(LC_GQL, {
      query: `
        query contestRanking($username: String!) {
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            totalParticipants
            topPercentage
          }
          userContestRankingHistory(username: $username) {
            attended
            rating
            ranking
            contest { title startTime }
          }
        }`,
      variables: { username },
    }, { headers });

    const ranking = response.data?.data?.userContestRanking;
    const history = response.data?.data?.userContestRankingHistory;

    res.json({
      ranking: ranking || null,
      history: (history || []).filter(h => h.attended).slice(-10), // last 10 attended
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch contest data" });
  }
});

module.exports = router;
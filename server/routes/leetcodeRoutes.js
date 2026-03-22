const express = require("express");
const axios = require("axios");
const router = express.Router();

const LC_GQL = "https://leetcode.com/graphql";
const headers = { "Content-Type": "application/json" };
const { hasUserSubmittedToday } = require("../services/leetcodeService");
const authMiddleware = require("../middleware/authMiddleware");
const Submission=require("../models/submissionHistModel");
const User=require("../models/userModel");


// ── 1. Solve stats (existing, unchanged) ──────────────────────────────────────
router.get("/status/:username", authMiddleware, async (req, res) => {
  const { username } = req.params;

  try {
    const response = await axios.post(
      LC_GQL,
      {
        query: `
          query userCalendar($username: String!) {
            matchedUser(username: $username) {
              userCalendar {
                submissionCalendar
              }
            }
          }`,
        variables: { username },
      },
      { headers }
    );

    const calStr =
      response.data?.data?.matchedUser?.userCalendar?.submissionCalendar;

    if (!calStr)
      return res.status(404).json({ message: "Calendar not found" });

    const calendar = JSON.parse(calStr);

    // ✅ FIXED UTC calculation
    const now = new Date();
    const utcToday =
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      ) / 1000;

    const submissionsToday = calendar[utcToday] || 0;

    res.json({
      username,
      hasSubmittedToday: submissionsToday > 0,
      submissionsToday,
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch submission status" });
  }
});
// ── 0. Difficulty stats (Easy / Medium / Hard / All)
router.get("/:username",authMiddleware ,async (req, res) => {
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
router.get("/profile/:username",authMiddleware ,async (req, res) => {
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
router.get("/calendar/:username",authMiddleware ,async (req, res) => {
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
// ── 5. FIXED: Recent submissions (store in DB)
router.get("/submissions/:username", async (req, res) => {
  const { username } = req.params;

  try {
    console.log("✅ ROUTE HIT:", username);

    const response = await axios.post(
      LC_GQL,
      {
        query: `
          query recentSubmissions($username: String!) {
            recentSubmissionList(username: $username) {
              title
              titleSlug
              timestamp
              statusDisplay
              lang
            }
          }
        `,
        variables: { username },
      },
      { headers }
    );

    // ✅ FULL DEBUG
    console.log("🔥 RAW RESPONSE:", JSON.stringify(response.data, null, 2));

    const submissions = response.data?.data?.recentSubmissionList;

    if (!submissions || submissions.length === 0) {
      console.log("❌ No submissions found");
      return res.status(404).json({ message: "No submissions found" });
    }

    console.log("✅ TOTAL SUBMISSIONS:", submissions.length);

    // ⭐ Loop and store accepted submissions
    for (let sub of submissions) {
      console.log("➡️ Checking:", sub.titleSlug, sub.statusDisplay);

      // ✅ Only Accepted
      if (sub.statusDisplay !== "Accepted") continue;

      // ✅ Duplicate check
      const exists = await Submission.findOne({
        username,
        titleSlug: sub.titleSlug,
      });

      if (exists) {
        console.log("⚠️ Already exists:", sub.titleSlug);
        continue;
      }

      // ✅ Save in DB
      try {
        await Submission.create({
          username,
          title: sub.title,
          titleSlug: sub.titleSlug,
          solvedAt: new Date(sub.timestamp * 1000),
        });

        console.log("🔥 SAVED:", sub.titleSlug);
      } catch (dbErr) {
        console.log("❌ DB ERROR:", dbErr.message);
      }
    }

    res.json(submissions);
  } catch (err) {
    console.error("❌ API ERROR:", err?.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
});

// ── 6. NEW: Contest ranking
router.get("/contest/:username", authMiddleware, async (req, res) => {
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
// ── 7. Monthly Leaderboard (Top 10)
router.get("/leaderboard/monthly", async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Step 1: Get all registered users with a leetcodeUsername
    const allUsers = await User.find(
      { leetcodeUsername: { $exists: true, $ne: null, $ne: "" } },
      { leetcodeUsername: 1, _id: 0 }
    );

    // Step 2: Get submission counts for this month
    const submissionCounts = await Submission.aggregate([
      { $match: { solvedAt: { $gte: startOfMonth } } },
      { $group: { _id: "$username", count: { $sum: 1 } } },
      { $project: { _id: 0, username: "$_id", count: 1 } },
    ]);

    // Step 3: Build a map for quick lookup
    const countMap = {};
    submissionCounts.forEach(s => {
      countMap[s.username] = s.count;
    });

    // Step 4: Merge — every user appears, 0 if no submissions
    const leaderboard = allUsers
      .map(u => ({
        username: u.leetcodeUsername,
        count: countMap[u.leetcodeUsername] ?? 0,
      }))
      .sort((a, b) => b.count - a.count); // sort by count desc

    console.log("🔥 Leaderboard:", leaderboard);
    res.json(leaderboard);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});
module.exports = router;
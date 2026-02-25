const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const response = await axios.get(
      `https://leetcode.com/graphql`,
      {
        headers: {
          "Content-Type": "application/json"
        },
        data: {
          query: `
          query userProfile($username: String!) {
            matchedUser(username: $username) {
              username
              submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
          }
          `,
          variables: { username }
        }
      }
    );

    const stats =
      response.data.data.matchedUser.submitStatsGlobal
        .acSubmissionNum;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch LeetCode data" });
  }
});
router.get("/status/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: `
          query userCalendar($username: String!) {
            matchedUser(username: $username) {
              userCalendar {
                submissionCalendar
              }
            }
          }
        `,
        variables: { username }
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const calendarStr =
      response.data?.data?.matchedUser?.userCalendar
        ?.submissionCalendar;

    if (!calendarStr) {
      return res.status(404).json({
        message: "Submission calendar not found"
      });
    }

    const calendar = JSON.parse(calendarStr);

    const now = new Date();
    const utcTodayStart =
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      ) / 1000;

    const submissionsToday = calendar[utcTodayStart] || 0;

    res.status(200).json({
      username,
      hasSubmittedToday: submissionsToday > 0,
      submissionsToday
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch LeetCode submission status"
    });
  }
});
module.exports = router;
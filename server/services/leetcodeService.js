const axios = require("axios");

const LC_GQL = "https://leetcode.com/graphql";

async function hasUserSubmittedToday(username) {
  try {
    const response = await axios.post(LC_GQL, {
      query: `
        query userCalendar($username: String!) {
          matchedUser(username: $username) {
            userCalendar {
              submissionCalendar
            }
          }
        }
      `,
      variables: { username },
    });

    const calStr =
      response.data?.data?.matchedUser?.userCalendar?.submissionCalendar;

    if (!calStr) return false;

    const calendar = JSON.parse(calStr);

    const now = new Date();
    const utcToday =
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      ) / 1000;

    const submissionsToday = calendar[utcToday] || 0;

    return submissionsToday > 0;
  } catch (err) {
    console.error("LeetCode API error:", err.message);
    return false;
  }
}

module.exports = { hasUserSubmittedToday };
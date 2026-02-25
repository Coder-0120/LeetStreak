import React, { useEffect, useState } from "react";
import axios from "axios";

interface LeetCodeStat {
  difficulty: string;
  count: number;
}

interface SubmissionStatus {
  hasSubmittedToday: boolean;
  submissionsToday: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<LeetCodeStat[]>([]);
  const [status, setStatus] = useState<SubmissionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    const username = userInfo
      ? JSON.parse(userInfo).data.leetcodeUsername
      : null;

    if (!username) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, statusRes] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/leetcode/${username}`
          ),
          axios.get(
            `http://localhost:5000/api/leetcode/status/${username}`
          )
        ]);

        setStats(statsRes.data);
        setStatus(statusRes.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <h2>Loading Dashboard...</h2>;
  if (!status) return <h2>No data available</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 LeetCode Dashboard</h1>

      {/* Submission Status */}
      <h2>
        {status.hasSubmittedToday ? (
          <span style={{ color: "green" }}>
            ✅ You have coded today!
          </span>
        ) : (
          <span style={{ color: "red" }}>
            ❌ No submission today
          </span>
        )}
      </h2>

      <p>
        Submissions today:{" "}
        <strong>{status.submissionsToday}</strong>
      </p>

      <hr style={{ margin: "20px 0" }} />

      {/* Difficulty Stats */}
      <h3>Problems Solved</h3>

      {stats.map(stat => (
        <div key={stat.difficulty}>
          <strong>{stat.difficulty}:</strong>{" "}
          {stat.count}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
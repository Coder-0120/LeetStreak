const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    title: String,
    titleSlug: String,
    solvedAt: Date,
  },
  { timestamps: true }
);

// ✅ Prevent duplicates (VERY IMPORTANT)
submissionSchema.index({ username: 1, titleSlug: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
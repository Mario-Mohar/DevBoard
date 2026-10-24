const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Task = require("../models/Task");

const verifyWebhookSignature = (rawBody, signature, secret) => {
  if (!Buffer.isBuffer(rawBody) || !/^sha256=[a-f0-9]{64}$/i.test(signature || "")) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest();
  const received = Buffer.from(signature.slice("sha256=".length), "hex");

  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
};

// POST /api/github/webhook - create tasks from tagged commit messages
router.post("/webhook", async (req, res) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(503).json({ message: "GitHub webhook is not configured" });
  }

  if (!verifyWebhookSignature(req.rawBody, req.get("x-hub-signature-256"), secret)) {
    return res.status(401).json({ message: "Invalid GitHub webhook signature" });
  }

  if (req.get("x-github-event") !== "push") {
    return res.json({ ok: true, ignored: true });
  }

  const commits = req.body?.commits;
  if (!Array.isArray(commits)) {
    return res.status(400).json({ message: "Invalid GitHub push payload" });
  }

  const repository = req.body.repository?.full_name;
  const repositoryPath =
    typeof repository === "string" && /^[^/]+\/[^/]+$/.test(repository)
      ? repository
      : null;
  const seenShas = new Set();
  const taskCandidates = commits.flatMap((commit) => {
    if (typeof commit?.message !== "string" || typeof commit.id !== "string") {
      return [];
    }

    const sha = commit.id;
    const message = commit.message.trim();
    const taskMarker = /(?:^|\s)#(?:task|todo|urgent)\b/i;
    if (
      !/^[a-f0-9]{40,64}$/i.test(sha) ||
      seenShas.has(sha) ||
      !taskMarker.test(message)
    ) {
      return [];
    }
    seenShas.add(sha);

    const title = message
      .replace(/(?:^|\s)#(?:task|todo|urgent)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!title) return [];

    return [{
      sha,
      task: {
        title,
        status: "backlog",
        priority: /(?:^|\s)#urgent\b/i.test(message) ? "high" : "medium",
        tags: ["git", "auto-created"],
        githubIssueUrl: repositoryPath
          ? `https://github.com/${repositoryPath}/commit/${sha}`
          : "",
        githubCommitSha: sha,
      },
    }];
  });

  try {
    const outcomes = await Promise.all(
      taskCandidates.map(async ({ sha, task }) => {
        try {
          const result = await Task.updateOne(
            { githubCommitSha: sha },
            { $setOnInsert: task },
            { upsert: true, timestamps: false },
          );
          return result.upsertedCount > 0 ? "created" : "duplicate";
        } catch (err) {
          if (err.code === 11000) return "duplicate";
          throw err;
        }
      }),
    );

    const created = outcomes.filter((outcome) => outcome === "created").length;
    res.json({ ok: true, created, duplicates: outcomes.length - created });
  } catch (err) {
    console.error("GitHub webhook task creation failed:", err);
    res.status(500).json({ message: "Failed to create tasks from push" });
  }
});

// GET /api/github/issues?repo=owner/repo
// Fetches open issues from a GitHub repo and optionally imports them as tasks
router.get("/issues", protect, async (req, res) => {
  const { repo } = req.query;
  if (!repo) return res.status(400).json({ message: "repo query param required (owner/repo)" });

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/issues?state=open`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    if (!response.ok) throw new Error("GitHub API error");
    const issues = await response.json();
    res.json(
      issues.map((i) => ({
        number: i.number,
        title: i.title,
        url: i.html_url,
        labels: i.labels.map((l) => l.name),
        body: i.body,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/github/import — import a GitHub issue as a task
router.post("/import", protect, async (req, res) => {
  const { title, githubIssueUrl, githubIssueNumber, tags } = req.body;
  try {
    const task = await Task.create({
      title,
      githubIssueUrl,
      githubIssueNumber,
      tags: Task.sanitizeTags(tags),
      status: "backlog",
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

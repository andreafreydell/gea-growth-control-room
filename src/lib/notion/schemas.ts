export const WEEKLY_REPORT_SCHEMA = {
  "Week Of": { date: {} },
  "Exec Summary": { rich_text: {} },
  "Paid Summary": { rich_text: {} },
  "Site Summary": { rich_text: {} },
  "Lifecycle Summary": { rich_text: {} },
  "Budget Moves": { rich_text: {} },
  Risks: { rich_text: {} },
};

export const CREATIVE_BRIEFS_SCHEMA = {
  Name: { title: {} },
  "Week Of": { date: {} },
  Angle: { rich_text: {} },
  Rationale: { rich_text: {} },
  "Target Audience": {
    select: {
      options: [
        { name: "Prospecting", color: "blue" },
        { name: "Retargeting", color: "green" },
        { name: "Lookalike", color: "purple" },
        { name: "Broad", color: "orange" },
      ],
    },
  },
  Format: {
    select: {
      options: [
        { name: "Static Image", color: "blue" },
        { name: "Video", color: "green" },
        { name: "Carousel", color: "purple" },
        { name: "UGC", color: "orange" },
        { name: "Story", color: "pink" },
      ],
    },
  },
  Status: {
    select: {
      options: [
        { name: "Draft", color: "gray" },
        { name: "In Progress", color: "yellow" },
        { name: "Complete", color: "green" },
      ],
    },
  },
};

export const LIFECYCLE_EXPERIMENTS_SCHEMA = {
  Name: { title: {} },
  "Week Of": { date: {} },
  Hypothesis: { rich_text: {} },
  Channel: {
    select: {
      options: [
        { name: "Email", color: "blue" },
        { name: "SMS", color: "green" },
        { name: "Push", color: "purple" },
      ],
    },
  },
  "Metric to Watch": { rich_text: {} },
  Status: {
    select: {
      options: [
        { name: "Proposed", color: "gray" },
        { name: "Running", color: "yellow" },
        { name: "Complete", color: "green" },
      ],
    },
  },
};

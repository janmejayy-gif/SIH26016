// ---------------------------------------------------------------------------
// LADI Portal — Early-warning alert mock data (Phase 2)
// ---------------------------------------------------------------------------

export const alerts = [
  {
    id: "ALR-2417",
    severity: "Critical",
    title: "Delay threshold breached across 14 projects",
    description:
      "Predicted delay probability crossed the 85% escalation threshold for 14 projects in Uttar Pradesh and Bihar. Review board notification recommended.",
    location: "Uttar Pradesh · Bihar",
    projectId: "LAD-UP-1042",
    time: "25 minutes ago",
    category: "Threshold Breach",
    recommendedAction:
      "Trigger review-board notification and schedule district-level escalation within 48 hours.",
    reviewed: false,
  },
  {
    id: "ALR-2416",
    severity: "High",
    title: "Compensation disbursement pending over 90 days",
    description:
      "Six land parcels under the Samruddhi Mahamarg corridor have pending compensation older than 90 days, raising dispute probability.",
    location: "Maharashtra",
    projectId: "LAD-MH-2043",
    time: "1 hour ago",
    category: "Disbursement",
    recommendedAction:
      "Escalate to state finance department with parcel-wise aging report attached.",
    reviewed: false,
  },
  {
    id: "ALR-2415",
    severity: "Medium",
    title: "Public hearing rescheduled twice",
    description:
      "Section 4 public hearing for Jaipur Ring Road Section 2 has been rescheduled twice within 30 days — a known precursor to schedule slippage.",
    location: "Rajasthan",
    projectId: "LAD-RJ-0554",
    time: "3 hours ago",
    category: "Process",
    recommendedAction:
      "Direct collectorate to publish final hearing date with wide public notice.",
    reviewed: false,
  },
  {
    id: "ALR-2414",
    severity: "Medium",
    title: "Forest clearance documents incomplete",
    description:
      "Required FC documentation is missing for 3 of 9 parcels on the Indore drainage corridor alignment.",
    location: "Madhya Pradesh",
    projectId: "LAD-MP-1201",
    time: "5 hours ago",
    category: "Compliance",
    recommendedAction:
      "Assign state forest cell to compile missing annexures within one week.",
    reviewed: true,
  },
  {
    id: "ALR-2412",
    severity: "Low",
    title: "Nightly data sync completed successfully",
    description:
      "Records synchronized for all 18 monitored states with no discrepancies detected in project milestone feeds.",
    location: "All States",
    projectId: null,
    time: "Yesterday, 11:40 PM",
    category: "System",
    recommendedAction: "No action required — informational only.",
    reviewed: true,
  },
];

export const alertSeverityCounts = alerts.reduce(
  (counts, alert) => ({
    ...counts,
    [alert.severity]: (counts[alert.severity] || 0) + 1,
  }),
  {}
);

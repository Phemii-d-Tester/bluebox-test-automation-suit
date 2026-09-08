# Performance Test Best Practices

> Authored from the perspective of a Senior QA Engineer with extensive experience in performance engineering.
> This document serves as a complete reference for AI Agents and QA teams executing performance tests.

---

## Overview

Performance testing is a non-functional testing discipline that validates system behaviour under expected and extreme load conditions. It is **not** a single test type — it is a category of tests, each serving a distinct purpose. Done correctly, it prevents production outages, SLA breaches, and costly post-release firefighting.

**Core Principle:** Performance testing must begin at the design phase, not after development is complete. Shift left — test early, test often, and test continuously.

---

## 1. Performance Test Strategy Template

Define the strategy before writing a single test script.

```json
{
  "strategy": {
    "project_name": "Your Project Name",
    "version": "1.0.0",
    "author": "Senior QA Engineer",
    "review_date": "YYYY-MM-DD",

    "objectives": [
      "Validate system meets defined SLA thresholds under normal load",
      "Identify bottlenecks before production release",
      "Establish performance baselines for future regression comparisons",
      "Validate scalability under peak and extreme load"
    ],

    "scope": {
      "in_scope": ["API layer", "database queries", "third-party integrations"],
      "out_of_scope": ["front-end rendering", "CDN caching layer"]
    },

    "test_types": [
      "load_test",
      "stress_test",
      "spike_test",
      "soak_test",
      "volume_test",
      "scalability_test"
    ],

    "environments": {
      "target": "staging",
      "note": "Environment must be production-equivalent. Never run performance tests on shared dev environments."
    },

    "entry_criteria": [
      "All P0 and P1 functional tests passing",
      "Performance environment provisioned and validated",
      "Baseline metrics captured from previous release",
      "Test data seeded and verified",
      "Monitoring and observability tools active"
    ],

    "exit_criteria": [
      "All test types executed successfully",
      "No SLA breach on P0 scenarios",
      "Performance report reviewed and signed off",
      "All critical bottlenecks documented and triaged"
    ]
  }
}
```

**Fields:**

| Field | Description |
|---|---|
| `objectives` | The specific goals this test cycle must validate |
| `scope.in_scope` | Components and layers being tested |
| `scope.out_of_scope` | Components explicitly excluded and why |
| `test_types` | All test types to be executed in this cycle |
| `environments.target` | Target environment — must be production-equivalent |
| `entry_criteria` | Conditions that must be met before testing begins |
| `exit_criteria` | Conditions that must be met before testing is considered complete |

---

## 2. Performance Test Types

Each test type answers a different question. Never substitute one for another.

```json
{
  "test_types": {
    "load_test": {
      "purpose": "Validate behaviour under expected peak load",
      "question": "Does the system perform within SLA at normal and peak traffic?",
      "duration": "30–60 minutes",
      "user_ramp": "gradual",
      "when_to_use": "Before every major release"
    },
    "stress_test": {
      "purpose": "Find the breaking point of the system",
      "question": "At what load does the system degrade or fail?",
      "duration": "Until failure or defined ceiling",
      "user_ramp": "incremental until threshold exceeded",
      "when_to_use": "Capacity planning and architecture validation"
    },
    "spike_test": {
      "purpose": "Validate behaviour under sudden, extreme traffic surges",
      "question": "Can the system survive and recover from a sudden traffic spike?",
      "duration": "Short spikes of 5–15 minutes within a longer run",
      "user_ramp": "instant surge then drop",
      "when_to_use": "Seasonal events, marketing campaigns, product launches"
    },
    "soak_test": {
      "purpose": "Detect memory leaks and degradation over time",
      "question": "Does the system remain stable under sustained load for an extended period?",
      "duration": "6–24 hours",
      "user_ramp": "steady sustained load",
      "when_to_use": "Pre-release for long-running services"
    },
    "volume_test": {
      "purpose": "Validate behaviour with large data volumes",
      "question": "Does the system perform when processing or storing large amounts of data?",
      "duration": "Depends on data volume",
      "user_ramp": "steady load with large payloads",
      "when_to_use": "Data migration, batch processing, reporting workloads"
    },
    "scalability_test": {
      "purpose": "Measure how performance scales with added resources",
      "question": "Does doubling resources result in proportional throughput gains?",
      "duration": "Iterative across infrastructure configurations",
      "user_ramp": "incremental with resource changes between runs",
      "when_to_use": "Cloud scaling validation and infrastructure sizing"
    }
  }
}
```

---

## 3. KPIs and SLA Thresholds Template

Define acceptance thresholds before testing. Never define them after results are in.

```json
{
  "sla_thresholds": {
    "response_time": {
      "p50_ms": 200,
      "p90_ms": 500,
      "p95_ms": 800,
      "p99_ms": 1500,
      "max_ms": 3000
    },
    "throughput": {
      "min_requests_per_second": 500,
      "target_requests_per_second": 1000
    },
    "error_rate": {
      "acceptable_percent": 0.1,
      "critical_percent": 1.0
    },
    "availability": {
      "target_percent": 99.9
    },
    "resource_utilization": {
      "cpu_max_percent": 70,
      "memory_max_percent": 75,
      "disk_io_max_percent": 60,
      "network_saturation_max_percent": 60
    },
    "concurrent_users": {
      "normal_load": 500,
      "peak_load": 1000,
      "stress_ceiling": 2000
    }
  }
}
```

**Threshold Guidelines:**

| Metric | Green | Amber | Red |
|---|---|---|---|
| P95 Response Time | < 800ms | 800ms – 1500ms | > 1500ms |
| Error Rate | < 0.1% | 0.1% – 1.0% | > 1.0% |
| CPU Utilization | < 70% | 70% – 85% | > 85% |
| Memory Utilization | < 75% | 75% – 90% | > 90% |
| Throughput (RPS) | ≥ target | 80%–99% of target | < 80% of target |

> **Rule:** If any metric hits Red during a P0 scenario, the test cycle fails and a defect must be raised before release.

---

## 4. Test Environment Config Template

```json
{
  "environment": {
    "name": "staging",
    "is_production_equivalent": true,

    "infrastructure": {
      "app_servers": 2,
      "cpu_per_server": "8 vCPU",
      "ram_per_server": "16 GB",
      "database": "PostgreSQL 15 – 4 vCPU / 8 GB RAM",
      "cache": "Redis 7 – single node",
      "load_balancer": "NGINX"
    },

    "data_setup": {
      "seed_users": 100000,
      "seed_transactions": 1000000,
      "data_state": "clean snapshot before each run",
      "pii_handling": "anonymised synthetic data only — never use production PII"
    },

    "network": {
      "latency_simulation": false,
      "bandwidth_cap": "none"
    },

    "third_party_dependencies": {
      "strategy": "mock or stub",
      "note": "Never hammer real third-party APIs during load tests"
    },

    "monitoring_tools": [
      "Prometheus",
      "Grafana",
      "New Relic APM",
      "ELK Stack for log aggregation"
    ]
  }
}
```

> **Critical Rule:** If the test environment is not production-equivalent, results are meaningless. Document every deviation from production in the report.

---

## 5. Test Scenario Template

```json
{
  "scenario_id": "PERF_TC_001",
  "name": "User Login Under Peak Load",
  "test_type": "load_test",
  "priority": "P0",
  "risk_level": "HIGH",
  "business_criticality": "Revenue-impacting — login is the gateway to all user activity",

  "endpoint": "/auth/login",
  "method": "POST",

  "headers": {
    "Content-Type": "application/json"
  },

  "request_body": {
    "email": "{{USER_EMAIL}}",
    "password": "{{USER_PASSWORD}}"
  },

  "load_profile": {
    "ramp_up_seconds": 120,
    "steady_state_users": 500,
    "steady_state_duration_seconds": 1800,
    "ramp_down_seconds": 60
  },

  "think_time_seconds": {
    "min": 1,
    "max": 3
  },

  "sla": {
    "p95_response_time_ms": 800,
    "error_rate_percent": 0.1,
    "min_throughput_rps": 200
  },

  "pass_criteria": "All SLA thresholds met throughout steady state phase",
  "fail_criteria": "P95 > 800ms OR error rate > 0.1% at any point during steady state"
}
```

**Fields:**

| Field | Description |
|---|---|
| `scenario_id` | Unique identifier — used to reference results in the report |
| `test_type` | The performance test category this scenario belongs to |
| `priority` | P0 = must pass; P1 = important; P2 = informational |
| `business_criticality` | Plain-language description of the business impact |
| `load_profile.ramp_up_seconds` | Time to gradually increase users to steady state — never ramp up instantly for load tests |
| `load_profile.steady_state_users` | Target concurrent user count during the main test window |
| `think_time_seconds` | Simulated delay between user actions — always include; zero think time is unrealistic |
| `sla` | Scenario-specific thresholds that override global SLA defaults if needed |
| `pass_criteria` | Explicit statement of what constitutes a passing result |
| `fail_criteria` | Explicit statement of what constitutes a failing result |

---

## 6. Load Profile Patterns

Match the load profile to the real-world traffic shape.

```json
{
  "load_profiles": {
    "gradual_ramp": {
      "use_case": "Standard load and soak tests",
      "pattern": "0 → peak over ramp_up_seconds → hold → ramp down",
      "risk": "LOW"
    },
    "step_load": {
      "use_case": "Stress testing and scalability testing",
      "pattern": "Increase load in fixed steps (e.g. +100 users every 5 minutes)",
      "risk": "MEDIUM"
    },
    "spike": {
      "use_case": "Flash sales, breaking news, viral events",
      "pattern": "Baseline → instant 10x surge → return to baseline",
      "risk": "HIGH"
    },
    "steady_state": {
      "use_case": "Soak tests to detect memory leaks and resource exhaustion",
      "pattern": "Fixed user count held for 6–24 hours",
      "risk": "MEDIUM"
    },
    "real_world_simulation": {
      "use_case": "Most accurate production simulation",
      "pattern": "Based on production traffic analytics — mimics hourly peaks and troughs",
      "risk": "LOW"
    }
  }
}
```

---

## 7. Metrics Collection Template

Define what must be captured during every test run.

```json
{
  "metrics_collection": {
    "application_layer": [
      "response_time_p50",
      "response_time_p90",
      "response_time_p95",
      "response_time_p99",
      "response_time_max",
      "requests_per_second",
      "active_virtual_users",
      "error_count",
      "error_rate_percent",
      "http_status_code_distribution"
    ],
    "infrastructure_layer": [
      "cpu_utilization_percent",
      "memory_utilization_percent",
      "heap_memory_used",
      "garbage_collection_frequency",
      "garbage_collection_duration_ms",
      "disk_read_write_iops",
      "network_bytes_in_out"
    ],
    "database_layer": [
      "query_response_time_p95",
      "active_connections",
      "connection_pool_utilization",
      "slow_query_count",
      "deadlock_count",
      "cache_hit_ratio"
    ],
    "custom_business_metrics": [
      "orders_processed_per_minute",
      "login_success_rate",
      "checkout_completion_rate"
    ],
    "collection_interval_seconds": 10,
    "retention_days": 90
  }
}
```

---

## 8. Test Execution Workflow (For AI Agent)

```json
{
  "execution_flow": [
    "validate_entry_criteria",
    "provision_and_validate_environment",
    "seed_test_data",
    "activate_monitoring_tools",
    "capture_baseline_snapshot",
    "execute_smoke_test_at_1_user",
    "confirm_smoke_test_passes",
    "execute_performance_scenarios_by_priority",
    "collect_and_aggregate_metrics",
    "compare_against_sla_thresholds",
    "identify_and_log_bottlenecks",
    "generate_performance_report",
    "restore_environment_to_baseline_state",
    "notify_stakeholders_of_results"
  ]
}
```

**Step-by-step detail:**

| Step | Description |
|---|---|
| `validate_entry_criteria` | Confirm all entry criteria in the strategy template are satisfied before proceeding |
| `provision_and_validate_environment` | Verify environment matches spec — check server count, DB config, cache, and network |
| `seed_test_data` | Populate DB with the required volume of realistic, anonymised synthetic data |
| `activate_monitoring_tools` | Confirm dashboards are live and capturing metrics before the first request is sent |
| `capture_baseline_snapshot` | Record CPU, memory, and DB state before load is applied — this is your zero reference |
| `execute_smoke_test_at_1_user` | Run every scenario with a single user first — catch script errors before burning load time |
| `confirm_smoke_test_passes` | Do NOT proceed to full load if the smoke test fails — fix first |
| `execute_performance_scenarios_by_priority` | Run P0 first, then P1, then P2. Stop and triage any P0 failure before continuing |
| `collect_and_aggregate_metrics` | Pull metrics from all layers — app, infra, and database |
| `compare_against_sla_thresholds` | Evaluate every scenario result against its defined SLA |
| `identify_and_log_bottlenecks` | Document the root cause and affected component for every threshold breach |
| `generate_performance_report` | Produce a structured report using the template in section 9 |
| `restore_environment_to_baseline_state` | Reset DB state and clear caches — leave the environment clean for the next run |
| `notify_stakeholders_of_results` | Share the report summary with the team, including pass/fail verdict and critical findings |

---

## 9. Performance Test Report Template

```json
{
  "report": {
    "report_id": "PERF_RPT_001",
    "project_name": "Your Project Name",
    "version": "1.0.0",
    "environment": "staging",
    "test_date": "YYYY-MM-DD",
    "executed_by": "QA Engineer Name",
    "reviewed_by": "QA Lead / Manager",

    "overall_verdict": "PASS | FAIL | CONDITIONAL PASS",

    "summary": {
      "total_scenarios": 10,
      "passed": 8,
      "failed": 2,
      "p0_failures": 0,
      "p1_failures": 2
    },

    "scenario_results": [
      {
        "scenario_id": "PERF_TC_001",
        "name": "User Login Under Peak Load",
        "verdict": "PASS",
        "p95_response_time_ms": 620,
        "error_rate_percent": 0.04,
        "throughput_rps": 310,
        "peak_cpu_percent": 58,
        "peak_memory_percent": 62,
        "notes": "All SLAs met with headroom. No anomalies observed."
      }
    ],

    "bottlenecks_identified": [
      {
        "id": "BTN_001",
        "severity": "HIGH",
        "component": "Database",
        "description": "P95 query time exceeded 500ms under 800+ concurrent users due to missing index on orders.user_id",
        "evidence": "Slow query log — 1,243 queries > 500ms during stress test",
        "recommendation": "Add composite index on (user_id, created_at)",
        "owner": "Backend Team",
        "due_date": "YYYY-MM-DD"
      }
    ],

    "baseline_comparison": {
      "previous_version": "0.9.0",
      "p95_change_ms": "+45",
      "throughput_change_rps": "+120",
      "error_rate_change": "-0.02%",
      "verdict": "Performance improved overall. P95 regression is within acceptable tolerance."
    },

    "environment_deviations": [
      "Staging uses 2 app servers vs 4 in production — results may understate production capacity"
    ],

    "recommendations": [
      "Fix BTN_001 (DB index) before production release",
      "Re-run soak test after memory leak fix is deployed",
      "Enable horizontal auto-scaling for app tier — observed CPU spike to 82% during stress test"
    ],

    "sign_off": {
      "qa_lead": "Pending",
      "engineering_lead": "Pending",
      "release_manager": "Pending"
    }
  }
}
```

---

## 10. Common Performance Anti-Patterns to Avoid

These are the mistakes that cause inaccurate results and missed production issues.

```json
{
  "anti_patterns": [
    {
      "id": "AP_001",
      "name": "Testing on a non-production-equivalent environment",
      "risk": "HIGH",
      "description": "Results from underpowered or shared environments are misleading and dangerous to act on.",
      "fix": "Always use a dedicated, production-equivalent environment for performance testing."
    },
    {
      "id": "AP_002",
      "name": "Zero think time between requests",
      "risk": "HIGH",
      "description": "Real users pause between actions. Zero think time creates an unrealistic hammering pattern.",
      "fix": "Always model realistic think time (typically 1–5 seconds based on UX analytics)."
    },
    {
      "id": "AP_003",
      "name": "Defining thresholds after seeing results",
      "risk": "HIGH",
      "description": "Post-hoc threshold setting defeats the purpose of performance testing and enables result manipulation.",
      "fix": "Thresholds must be agreed and documented in the strategy before the first test is run."
    },
    {
      "id": "AP_004",
      "name": "Skipping the smoke test",
      "risk": "MEDIUM",
      "description": "Launching straight into full load with broken scripts wastes environment hours and produces invalid results.",
      "fix": "Always run a 1-user smoke test first and confirm all scenarios complete successfully."
    },
    {
      "id": "AP_005",
      "name": "Ignoring infrastructure metrics",
      "risk": "HIGH",
      "description": "Response time alone does not tell you why the system is slow. A 200ms response with 90% CPU is a time bomb.",
      "fix": "Always collect CPU, memory, DB connection, and GC metrics alongside response time."
    },
    {
      "id": "AP_006",
      "name": "Testing with static or insufficient test data",
      "risk": "MEDIUM",
      "description": "A DB with 100 rows performs very differently from one with 10 million rows. Small data hides real bottlenecks.",
      "fix": "Seed the test DB to production-scale data volumes before testing."
    },
    {
      "id": "AP_007",
      "name": "Running load tests against real third-party APIs",
      "risk": "HIGH",
      "description": "Load testing against live payment gateways, email providers, or SMS services violates ToS and can incur real charges.",
      "fix": "Always mock or stub third-party dependencies for load and stress tests."
    },
    {
      "id": "AP_008",
      "name": "Treating performance testing as a one-time activity",
      "risk": "HIGH",
      "description": "A single pre-release test misses performance regressions introduced in later sprints.",
      "fix": "Integrate performance tests into the CI/CD pipeline and run on every significant merge."
    }
  ]
}
```

---

## 11. CI/CD Integration Config

```json
{
  "ci_cd_config": {
    "tool": "k6",
    "script_path": "./performance/scripts/",
    "environment_file": "./performance/environments/staging.json",

    "pipeline_triggers": ["pull_request_to_main", "pre_deployment_to_staging", "nightly"],

    "execution_tiers": {
      "pull_request": {
        "test_types": ["smoke_test"],
        "max_duration_minutes": 5,
        "note": "Quick validation — single user, confirms scripts are not broken"
      },
      "pre_deployment": {
        "test_types": ["load_test"],
        "max_duration_minutes": 45,
        "note": "Full load test against staging before every production deployment"
      },
      "nightly": {
        "test_types": ["soak_test"],
        "max_duration_minutes": 480,
        "note": "8-hour soak test to catch memory leaks and gradual degradation"
      }
    },

    "fail_build_on": [
      "P0 scenario failure",
      "HIGH risk scenario failure",
      "error_rate above 1.0%",
      "p95 response time exceeds SLA by more than 20%"
    ],

    "report_artifacts": ["html_report", "json_summary", "trend_chart"],
    "notify_on_failure": ["slack_channel", "email_to_qa_lead"]
  }
}
```

---

## 12. Recommended Folder Structure

```
/performance-testing
  /strategy
      performance-test-strategy.md      # Test strategy and objectives
      sla-thresholds.json               # Agreed SLA thresholds
      risk-matrix.json                  # Risk-based prioritization

  /scripts
      /k6                               # k6 test scripts
      /jmeter                           # JMeter JMX files
      /locust                           # Locust Python scripts

  /scenarios
      load-test-scenarios.json          # All scenario definitions
      stress-test-scenarios.json
      soak-test-scenarios.json

  /environments
      staging.json                      # Environment-specific config
      production-equivalent.json

  /test-data
      seed-scripts/                     # DB seeding scripts
      synthetic-data/                   # Pre-generated anonymised datasets

  /monitoring
      grafana-dashboards/               # Dashboard JSON exports
      alerting-rules/                   # Prometheus alert definitions

  /reports
      /YYYY-MM-DD                       # One folder per test run, date-stamped
          summary.json
          full-report.html
          bottlenecks.md
          raw-metrics.csv

  /baselines
      v1.0.0-baseline.json             # Stored benchmark results per release
      v1.1.0-baseline.json
```

---

## 13. AI Agent Instructions

Rules the agent must follow when executing performance tests.

```json
{
  "agent_rules": [
    "Never execute performance tests without confirming all entry criteria are met",
    "Always run a smoke test at 1 virtual user before scaling to full load",
    "Never define or adjust SLA thresholds after results have been observed",
    "Always mock third-party API dependencies — never send load to real external services",
    "Collect metrics from application, infrastructure, and database layers on every run",
    "Stop and triage any P0 scenario failure immediately — do not continue to lower-priority tests",
    "Always include think time in load profiles — never simulate zero-delay hammering",
    "Capture a system baseline snapshot before applying any load",
    "Use only anonymised synthetic data — never use real user PII in test data",
    "Document every deviation between the test environment and production in the report",
    "Store raw metrics and the full report in a date-stamped folder for every run",
    "Compare results against the previous release baseline and flag regressions",
    "Reset the environment to a clean state after every test run",
    "Raise a defect for every bottleneck identified — do not embed findings only in the report",
    "Never mark a test cycle as PASS if a P0 scenario or HIGH risk scenario has failed"
  ]
}
```

---

## Quick Reference Card

| Test Type | Goal | Duration | When |
|---|---|---|---|
| Smoke | Confirm scripts work at 1 user | < 5 min | Every commit |
| Load | Validate SLAs under peak load | 30–60 min | Every release |
| Stress | Find the breaking point | Until failure | Quarterly / arch changes |
| Spike | Survive sudden traffic surges | 5–15 min bursts | Pre-peak events |
| Soak | Detect memory leaks over time | 6–24 hours | Pre-release |
| Volume | Large data processing validation | Data-dependent | Data migrations |
| Scalability | Validate horizontal/vertical scaling | Iterative | Infrastructure changes |

| Metric | Ideal | Warning | Critical |
|---|---|---|---|
| P95 Response Time | < 500ms | 500ms–1500ms | > 1500ms |
| Error Rate | < 0.1% | 0.1%–1.0% | > 1.0% |
| CPU | < 70% | 70%–85% | > 85% |
| Memory | < 75% | 75%–90% | > 90% |
| DB Connection Pool | < 60% | 60%–80% | > 80% |

# Security Test Best Practices

> Authored from the perspective of a Senior Cybersecurity Engineer.
> All test configurations are compatible with **OWASP ZAP (Zed Attack Proxy)** — the industry-standard open-source web application security scanner.
> This document serves as a complete reference for AI Agents and security teams executing security tests.

---

## Overview

Security testing is a systematic process of identifying vulnerabilities, threats, and risks in applications, APIs, and infrastructure before malicious actors can exploit them. It is not a checkbox activity — it is a continuous security engineering discipline embedded into every phase of the SDLC.

**Core Principle:** Security must be shifted left. Vulnerabilities found in development cost 10x less to fix than those found in production. Integrate security testing into every pull request, every deployment, and every release cycle.

**ZAP Overview:** OWASP ZAP is a free, open-source DAST (Dynamic Application Security Testing) tool used to find vulnerabilities in web applications and APIs during runtime. It supports both manual testing and fully automated CI/CD pipelines via its CLI, REST API, and Docker images.

---

## 1. Security Test Strategy Template

```json
{
  "strategy": {
    "project_name": "Your Project Name",
    "version": "1.0.0",
    "author": "Senior Cybersecurity Engineer",
    "classification": "CONFIDENTIAL",
    "review_date": "YYYY-MM-DD",

    "objectives": [
      "Identify and remediate OWASP Top 10 vulnerabilities before production release",
      "Validate authentication and authorisation controls are enforced correctly",
      "Ensure sensitive data is protected in transit and at rest",
      "Detect injection vulnerabilities across all input vectors",
      "Validate security headers and TLS/SSL configuration",
      "Establish a security baseline for continuous regression testing"
    ],

    "scope": {
      "in_scope": [
        "All public-facing API endpoints",
        "Authentication and session management",
        "Input validation and output encoding",
        "Access control and authorisation",
        "Security headers and HTTPS configuration",
        "Third-party integrations"
      ],
      "out_of_scope": [
        "Physical security",
        "Social engineering",
        "Third-party vendor infrastructure not within contractual scope"
      ]
    },

    "frameworks_and_standards": [
      "OWASP Top 10 (2021)",
      "OWASP API Security Top 10 (2023)",
      "OWASP Testing Guide v4.2",
      "NIST SP 800-115",
      "CWE/SANS Top 25"
    ],

    "test_types": [
      "passive_scan",
      "active_scan",
      "authenticated_scan",
      "api_security_scan",
      "fuzzing",
      "penetration_test"
    ],

    "zap_tool": {
      "version": "ZAP 2.15+",
      "mode": "Safe | Protected | Standard | Attack",
      "docker_image": "ghcr.io/zaproxy/zaproxy:stable",
      "api_key": "{{ZAP_API_KEY}}"
    },

    "entry_criteria": [
      "Application is deployed and accessible in the target environment",
      "All P0 functional tests are passing",
      "ZAP instance is running and API key is configured",
      "Authentication credentials for test accounts are provisioned",
      "Scope is defined and confirmed — no scanning of out-of-scope assets",
      "Written authorisation obtained for penetration testing activities"
    ],

    "exit_criteria": [
      "All CRITICAL and HIGH vulnerabilities remediated or formally accepted with risk owner sign-off",
      "ZAP scan reports generated and stored",
      "Security defects raised and triaged in the issue tracker",
      "Security report reviewed and signed off by security lead"
    ]
  }
}
```

---

## 2. ZAP Environment Configuration

```json
{
  "zap_config": {
    "instance": {
      "host": "localhost",
      "port": 8080,
      "api_key": "{{ZAP_API_KEY}}",
      "api_url": "http://localhost:8080"
    },

    "target": {
      "base_url": "https://your-app.staging.example.com",
      "environment": "staging",
      "note": "Never run active or attack scans against production without explicit written approval"
    },

    "proxy_settings": {
      "proxy_host": "localhost",
      "proxy_port": 8080,
      "ssl_insecure": false,
      "note": "Configure your browser or HTTP client to route traffic through ZAP proxy for passive scanning"
    },

    "scan_policy": {
      "name": "Default Policy",
      "attack_strength": "MEDIUM",
      "alert_threshold": "MEDIUM",
      "custom_policy_file": "./zap/policies/custom-scan-policy.policy"
    },

    "spider_config": {
      "max_depth": 10,
      "max_duration_minutes": 30,
      "max_children": 0,
      "accept_cookies": true,
      "submit_forms": true,
      "process_forms": true
    },

    "ajax_spider_config": {
      "enabled": true,
      "max_duration_minutes": 10,
      "max_crawl_depth": 5,
      "browser": "firefox-headless",
      "note": "Use AJAX spider for Single Page Applications (React, Angular, Vue)"
    },

    "active_scan_config": {
      "max_duration_minutes": 60,
      "max_rule_duration_minutes": 5,
      "thread_count": 2,
      "delay_in_ms": 0,
      "handle_anti_csrf_tokens": true
    },

    "alert_filters": {
      "ignore_false_positives": [],
      "minimum_risk_level_to_report": "LOW"
    },

    "report_config": {
      "output_dir": "./security-reports/",
      "formats": ["html", "json", "xml", "md"],
      "template": "traditional-html-plus"
    }
  }
}
```

---

## 3. ZAP Authentication Configuration

Authentication must be configured correctly or ZAP will only scan public/unauthenticated surfaces.

```json
{
  "authentication": {
    "context_name": "App Authentication Context",
    "context_id": "1",

    "auth_type": "form_based",

    "form_based_auth": {
      "login_url": "https://your-app.staging.example.com/auth/login",
      "login_request_data": "email={%username%}&password={%password%}",
      "username_field": "email",
      "password_field": "password",
      "logged_in_indicator": "Dashboard",
      "logged_out_indicator": "Login | Sign in"
    },

    "bearer_token_auth": {
      "login_url": "https://your-app.staging.example.com/auth/login",
      "method": "POST",
      "request_body": {
        "email": "{{TEST_USER_EMAIL}}",
        "password": "{{TEST_USER_PASSWORD}}"
      },
      "token_extraction": {
        "from": "response_body",
        "json_path": "$.data.access_token"
      },
      "inject_header": "Authorization",
      "inject_format": "Bearer {{TOKEN}}"
    },

    "test_users": [
      {
        "role": "admin",
        "username": "{{ADMIN_USER_EMAIL}}",
        "password": "{{ADMIN_USER_PASSWORD}}",
        "note": "Use dedicated security test accounts — never use real user credentials"
      },
      {
        "role": "standard_user",
        "username": "{{STD_USER_EMAIL}}",
        "password": "{{STD_USER_PASSWORD}}"
      },
      {
        "role": "unauthenticated",
        "username": null,
        "password": null,
        "note": "Used to validate that protected endpoints reject anonymous access"
      }
    ],

    "session_management": {
      "type": "cookie_based | token_based",
      "session_token_name": "session_id | Authorization",
      "verify_session_after_each_request": true
    }
  }
}
```

> **Security Rule:** All test credentials must be dedicated security test accounts with no access to real data. Rotate credentials after every test cycle.

---

## 4. OWASP Top 10 (2021) — ZAP Test Coverage Map

```json
{
  "owasp_top10_coverage": {
    "A01_Broken_Access_Control": {
      "zap_scanners": ["Access Control Testing", "Forced Browsing"],
      "zap_scan_ids": [6, 10094, 10095, 10096],
      "test_approach": "Test horizontal and vertical privilege escalation — access other users' resources, access admin endpoints as standard user",
      "priority": "P0",
      "risk": "CRITICAL"
    },
    "A02_Cryptographic_Failures": {
      "zap_scanners": ["SSL/TLS Scanner", "Passive Scan Rules"],
      "zap_scan_ids": [10012, 10015, 10017, 10020, 90033],
      "test_approach": "Validate HTTPS enforcement, check for weak cipher suites, validate sensitive data is not in plaintext in responses or logs",
      "priority": "P0",
      "risk": "CRITICAL"
    },
    "A03_Injection": {
      "zap_scanners": ["SQL Injection", "Command Injection", "LDAP Injection", "XPath Injection"],
      "zap_scan_ids": [40018, 40019, 40020, 40021, 40022],
      "test_approach": "Fuzz all input parameters, headers, and cookies with injection payloads",
      "priority": "P0",
      "risk": "CRITICAL"
    },
    "A04_Insecure_Design": {
      "zap_scanners": ["Spider", "Manual Review"],
      "zap_scan_ids": [],
      "test_approach": "Review business logic flows — cannot be fully automated. Supplement ZAP with manual threat modelling.",
      "priority": "P0",
      "risk": "HIGH"
    },
    "A05_Security_Misconfiguration": {
      "zap_scanners": ["Passive Scan", "Active Scan — Server Side"],
      "zap_scan_ids": [10010, 10011, 10016, 10038, 10054, 90011],
      "test_approach": "Check security headers, directory listing, default credentials, verbose error messages, unnecessary features exposed",
      "priority": "P0",
      "risk": "HIGH"
    },
    "A06_Vulnerable_and_Outdated_Components": {
      "zap_scanners": ["Passive Scan — Technology Detection"],
      "zap_scan_ids": [10003],
      "test_approach": "ZAP identifies technology versions. Cross-reference with CVE databases. Supplement with SCA tools (e.g. Dependabot, Snyk).",
      "priority": "P1",
      "risk": "HIGH"
    },
    "A07_Identification_and_Authentication_Failures": {
      "zap_scanners": ["Authentication Testing", "Brute Force"],
      "zap_scan_ids": [10023, 40026, 40027],
      "test_approach": "Test session fixation, session timeout, account lockout, credential exposure in URLs, weak password policies",
      "priority": "P0",
      "risk": "CRITICAL"
    },
    "A08_Software_and_Data_Integrity_Failures": {
      "zap_scanners": ["Passive Scan"],
      "zap_scan_ids": [10096],
      "test_approach": "Check for insecure deserialization, missing subresource integrity (SRI), unsigned updates",
      "priority": "P1",
      "risk": "HIGH"
    },
    "A09_Security_Logging_and_Monitoring_Failures": {
      "zap_scanners": ["Active Scan"],
      "zap_scan_ids": [],
      "test_approach": "Trigger known attack patterns and verify they are captured in application logs. Cannot be fully automated by ZAP — requires log review.",
      "priority": "P1",
      "risk": "MEDIUM"
    },
    "A10_Server_Side_Request_Forgery": {
      "zap_scanners": ["SSRF Scanner"],
      "zap_scan_ids": [40046],
      "test_approach": "Inject SSRF payloads into all URL parameters and headers that trigger server-side requests",
      "priority": "P0",
      "risk": "CRITICAL"
    }
  }
}
```

---

## 5. Security Test Case Template

```json
{
  "test_id": "SEC_TC_001",
  "name": "SQL Injection — Login Endpoint",
  "owasp_category": "A03:2021 — Injection",
  "cwe_id": "CWE-89",
  "priority": "P0",
  "risk_level": "CRITICAL",

  "zap_config": {
    "scan_type": "active_scan",
    "scanner_id": 40018,
    "scanner_name": "SQL Injection",
    "attack_strength": "HIGH",
    "alert_threshold": "LOW"
  },

  "target": {
    "endpoint": "/auth/login",
    "method": "POST",
    "parameters": ["email", "password"]
  },

  "headers": {
    "Content-Type": "application/json"
  },

  "test_payloads": [
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' OR 1=1 --",
    "admin'--",
    "1; DROP TABLE users--",
    "' UNION SELECT null, username, password FROM users--"
  ],

  "expected": {
    "safe_response_code": 400,
    "should_not_return": ["SQL syntax error", "ORA-", "mysql_fetch", "stack trace", "internal server error"],
    "should_not_execute": "Database query modification or bypass",
    "zap_alert_risk": "No CRITICAL or HIGH alerts"
  },

  "pass_criteria": "No injection vulnerability detected — all payloads return sanitised error responses",
  "fail_criteria": "ZAP raises a HIGH or CRITICAL SQL Injection alert OR database error message is exposed in response",

  "remediation": {
    "fix": "Use parameterised queries / prepared statements. Never concatenate user input into SQL strings.",
    "reference": "https://owasp.org/www-community/attacks/SQL_Injection"
  }
}
```

---

## 6. Security Test Case Library (OWASP-Aligned)

### 6.1 Injection Tests

```json
{
  "injection_tests": [
    {
      "test_id": "SEC_TC_002",
      "name": "Cross-Site Scripting (XSS) — Reflected",
      "owasp_category": "A03:2021 — Injection",
      "cwe_id": "CWE-79",
      "priority": "P0",
      "zap_scanner_id": 40012,
      "payloads": [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "javascript:alert('XSS')",
        "'><script>alert(document.cookie)</script>"
      ],
      "expected": {
        "safe_status_code": 400,
        "output_should_be_encoded": true,
        "zap_alert": "No XSS alerts raised"
      },
      "remediation": "Encode all user-supplied output. Implement a strict Content-Security-Policy header."
    },
    {
      "test_id": "SEC_TC_003",
      "name": "Cross-Site Scripting (XSS) — Stored",
      "owasp_category": "A03:2021 — Injection",
      "cwe_id": "CWE-79",
      "priority": "P0",
      "zap_scanner_id": 40016,
      "test_approach": "Submit XSS payloads in fields that are persisted and later rendered (e.g. user profile, comments, product reviews)",
      "remediation": "Sanitise input on write. Encode output on read. Never trust stored data."
    },
    {
      "test_id": "SEC_TC_004",
      "name": "Command Injection",
      "owasp_category": "A03:2021 — Injection",
      "cwe_id": "CWE-78",
      "priority": "P0",
      "zap_scanner_id": 40018,
      "payloads": [
        "; ls -la",
        "| cat /etc/passwd",
        "&& whoami",
        "`id`"
      ],
      "remediation": "Never pass user input to system shell commands. Use safe API equivalents."
    }
  ]
}
```

### 6.2 Authentication & Session Tests

```json
{
  "auth_session_tests": [
    {
      "test_id": "SEC_TC_005",
      "name": "Brute Force — Login Endpoint",
      "owasp_category": "A07:2021 — Identification and Authentication Failures",
      "cwe_id": "CWE-307",
      "priority": "P0",
      "zap_scanner_id": 40026,
      "test_approach": "Send 20+ rapid consecutive failed login attempts. Validate account lockout or rate limiting is triggered.",
      "expected": {
        "lockout_after_attempts": 5,
        "lockout_response_code": 429,
        "lockout_message": "Too many attempts"
      },
      "remediation": "Implement account lockout, CAPTCHA, or exponential backoff after repeated failures."
    },
    {
      "test_id": "SEC_TC_006",
      "name": "Session Token Entropy Validation",
      "owasp_category": "A07:2021 — Identification and Authentication Failures",
      "cwe_id": "CWE-330",
      "priority": "P0",
      "zap_scanner_id": 10040,
      "test_approach": "Capture 50+ session tokens using ZAP Token Analysis. Validate tokens are cryptographically random with sufficient entropy.",
      "expected": {
        "token_length_bits": 128,
        "predictability": "none",
        "sequential": false
      },
      "remediation": "Use cryptographically secure random number generators for session token generation."
    },
    {
      "test_id": "SEC_TC_007",
      "name": "Session Fixation",
      "owasp_category": "A07:2021 — Identification and Authentication Failures",
      "cwe_id": "CWE-384",
      "priority": "P0",
      "test_approach": "Obtain a pre-auth session token. Authenticate. Verify the session token is regenerated post-login.",
      "expected": {
        "session_token_changes_after_login": true
      },
      "remediation": "Invalidate pre-authentication session tokens on successful login and issue a new token."
    },
    {
      "test_id": "SEC_TC_008",
      "name": "JWT — Algorithm Confusion Attack",
      "owasp_category": "A07:2021 — Identification and Authentication Failures",
      "cwe_id": "CWE-347",
      "priority": "P0",
      "test_approach": "Modify JWT header to alg:none. Submit to protected endpoints. Verify the token is rejected.",
      "expected": {
        "alg_none_accepted": false,
        "response_code": 401
      },
      "remediation": "Explicitly whitelist allowed JWT algorithms server-side. Reject alg:none unconditionally."
    }
  ]
}
```

### 6.3 Access Control Tests

```json
{
  "access_control_tests": [
    {
      "test_id": "SEC_TC_009",
      "name": "Horizontal Privilege Escalation (IDOR)",
      "owasp_category": "A01:2021 — Broken Access Control",
      "cwe_id": "CWE-639",
      "priority": "P0",
      "risk_level": "CRITICAL",
      "test_approach": "Authenticate as User A. Access User B's resources by substituting User B's resource ID in the request. Verify access is denied.",
      "example_attack": "GET /api/users/{{USER_B_ID}}/profile using User A's token",
      "expected": {
        "response_code": 403,
        "user_b_data_in_response": false
      },
      "remediation": "Enforce server-side ownership checks on every resource access. Never trust client-supplied resource IDs alone."
    },
    {
      "test_id": "SEC_TC_010",
      "name": "Vertical Privilege Escalation",
      "owasp_category": "A01:2021 — Broken Access Control",
      "cwe_id": "CWE-269",
      "priority": "P0",
      "risk_level": "CRITICAL",
      "test_approach": "Authenticate as a standard user. Attempt to access admin-only endpoints. Verify access is denied.",
      "example_attack": "POST /api/admin/users using a standard user token",
      "expected": {
        "response_code": 403,
        "admin_function_executed": false
      },
      "remediation": "Implement role-based access control (RBAC). Validate roles server-side on every request."
    },
    {
      "test_id": "SEC_TC_011",
      "name": "Forced Browsing — Unauthenticated Access",
      "owasp_category": "A01:2021 — Broken Access Control",
      "cwe_id": "CWE-425",
      "priority": "P0",
      "zap_scanner_id": 10095,
      "test_approach": "Send requests to protected endpoints with no authentication headers. Verify all are rejected.",
      "expected": {
        "response_code": 401,
        "data_exposed": false
      },
      "remediation": "Apply authentication middleware globally. Explicitly whitelist public routes — never blacklist protected ones."
    }
  ]
}
```

### 6.4 Security Header Tests

```json
{
  "security_header_tests": [
    {
      "test_id": "SEC_TC_012",
      "name": "Security Headers Validation",
      "owasp_category": "A05:2021 — Security Misconfiguration",
      "priority": "P1",
      "zap_scanner_id": 10038,
      "test_approach": "Use ZAP Passive Scan to validate all required security headers are present on every response",
      "required_headers": {
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
        "Content-Security-Policy": "default-src 'self'; script-src 'self'; object-src 'none'",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
      },
      "headers_that_must_not_be_present": [
        "X-Powered-By",
        "Server",
        "X-AspNet-Version",
        "X-AspNetMvc-Version"
      ],
      "zap_alerts_to_check": [
        "Anti-clickjacking Header",
        "Content-Security-Policy Header Not Set",
        "Missing Anti-cacheing Headers",
        "Strict-Transport-Security Header"
      ]
    },
    {
      "test_id": "SEC_TC_013",
      "name": "CORS Misconfiguration",
      "owasp_category": "A05:2021 — Security Misconfiguration",
      "cwe_id": "CWE-942",
      "priority": "P0",
      "zap_scanner_id": 40040,
      "test_approach": "Send requests with Origin: https://evil.com. Validate that wildcard CORS or reflection of arbitrary origins is not present on credentialed responses.",
      "expected": {
        "access_control_allow_origin": "must not be * on credentialed responses",
        "reflects_arbitrary_origin": false
      },
      "remediation": "Maintain an explicit CORS allowlist. Never use wildcard (*) with Access-Control-Allow-Credentials: true."
    }
  ]
}
```

### 6.5 API Security Tests (OWASP API Top 10)

```json
{
  "api_security_tests": [
    {
      "test_id": "SEC_TC_014",
      "name": "Mass Assignment / Over-Posting",
      "owasp_api_category": "API3:2023 — Broken Object Property Level Authorization",
      "cwe_id": "CWE-915",
      "priority": "P0",
      "test_approach": "Send extra fields in the request body (e.g. 'role': 'admin', 'isVerified': true). Verify the server ignores or rejects unexpected fields.",
      "example_payload": {
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "isVerified": true,
        "credit_balance": 99999
      },
      "expected": {
        "extra_fields_applied": false,
        "role_changed": false
      },
      "remediation": "Use strict input DTOs/schema validation. Explicitly define allowed writable fields."
    },
    {
      "test_id": "SEC_TC_015",
      "name": "Unrestricted Resource Consumption (Rate Limiting)",
      "owasp_api_category": "API4:2023 — Unrestricted Resource Consumption",
      "cwe_id": "CWE-770",
      "priority": "P0",
      "test_approach": "Send 1000 rapid requests to a public endpoint. Validate rate limiting is enforced and returns 429.",
      "expected": {
        "rate_limit_enforced": true,
        "response_code_on_limit": 429,
        "retry_after_header_present": true
      },
      "remediation": "Implement rate limiting at the API gateway level. Use token bucket or sliding window algorithm."
    },
    {
      "test_id": "SEC_TC_016",
      "name": "Sensitive Data Exposure in API Responses",
      "owasp_api_category": "API3:2023 — Broken Object Property Level Authorization",
      "cwe_id": "CWE-213",
      "priority": "P0",
      "zap_scanner_id": 10110,
      "test_approach": "Inspect all API responses for sensitive data fields that should not be returned to the client.",
      "sensitive_fields_to_check": [
        "password",
        "password_hash",
        "credit_card_number",
        "cvv",
        "ssn",
        "private_key",
        "secret",
        "internal_id"
      ],
      "expected": {
        "sensitive_fields_in_response": false
      },
      "remediation": "Use response DTOs/serialisers to explicitly define which fields are returned. Never return raw DB objects."
    }
  ]
}
```

### 6.6 Cryptography & TLS Tests

```json
{
  "cryptography_tests": [
    {
      "test_id": "SEC_TC_017",
      "name": "TLS/SSL Configuration Validation",
      "owasp_category": "A02:2021 — Cryptographic Failures",
      "priority": "P0",
      "zap_scanner_id": 10012,
      "test_approach": "Use ZAP SSL Scanner to validate TLS configuration",
      "required": {
        "minimum_tls_version": "TLS 1.2",
        "preferred_tls_version": "TLS 1.3",
        "certificate_valid": true,
        "certificate_not_expired": true,
        "certificate_hostname_match": true
      },
      "prohibited": {
        "ssl_v2": true,
        "ssl_v3": true,
        "tls_1_0": true,
        "tls_1_1": true,
        "weak_ciphers": ["RC4", "DES", "3DES", "EXPORT", "NULL", "anon"],
        "self_signed_in_production": true
      },
      "remediation": "Enforce TLS 1.2+ minimum. Disable all deprecated protocol versions and weak cipher suites."
    },
    {
      "test_id": "SEC_TC_018",
      "name": "HTTP Strict Transport Security (HSTS)",
      "owasp_category": "A02:2021 — Cryptographic Failures",
      "priority": "P0",
      "zap_scanner_id": 10035,
      "test_approach": "Verify HSTS header is present on all HTTPS responses with sufficient max-age",
      "expected": {
        "hsts_header_present": true,
        "max_age_minimum_seconds": 31536000,
        "include_sub_domains": true
      },
      "remediation": "Set Strict-Transport-Security: max-age=31536000; includeSubDomains; preload on all responses."
    }
  ]
}
```

---

## 7. ZAP CLI Commands Reference

ZAP commands for common test operations — use these in automation scripts and CI/CD pipelines.

```bash
# ─────────────────────────────────────────────
# START ZAP IN DAEMON MODE (headless)
# ─────────────────────────────────────────────
zap.sh -daemon -port 8080 -config api.key={{ZAP_API_KEY}}

# ─────────────────────────────────────────────
# DOCKER — PULL ZAP STABLE IMAGE
# ─────────────────────────────────────────────
docker pull ghcr.io/zaproxy/zaproxy:stable

# ─────────────────────────────────────────────
# BASELINE SCAN (Passive only — safe for any environment)
# Runs spider + passive scan. No active attacks.
# ─────────────────────────────────────────────
docker run --rm \
  -v $(pwd)/reports:/zap/wrk/:rw \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
  -t https://your-app.staging.example.com \
  -r baseline-report.html \
  -J baseline-report.json \
  -l WARN

# ─────────────────────────────────────────────
# FULL SCAN (Active scan — use in staging ONLY)
# Runs spider + passive scan + active attack scan.
# WARNING: This will actively attempt to exploit vulnerabilities.
# ─────────────────────────────────────────────
docker run --rm \
  -v $(pwd)/reports:/zap/wrk/:rw \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-full-scan.py \
  -t https://your-app.staging.example.com \
  -r full-scan-report.html \
  -J full-scan-report.json \
  -z "-config api.key={{ZAP_API_KEY}}" \
  -l WARN

# ─────────────────────────────────────────────
# API SCAN — OpenAPI / Swagger definition
# Scans all endpoints defined in the spec.
# ─────────────────────────────────────────────
docker run --rm \
  -v $(pwd)/reports:/zap/wrk/:rw \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-api-scan.py \
  -t https://your-app.staging.example.com/api/openapi.json \
  -f openapi \
  -r api-scan-report.html \
  -J api-scan-report.json \
  -z "-config api.key={{ZAP_API_KEY}}"

# ─────────────────────────────────────────────
# AUTHENTICATED SCAN — using ZAP context file
# ─────────────────────────────────────────────
docker run --rm \
  -v $(pwd)/reports:/zap/wrk/:rw \
  -v $(pwd)/zap:/zap/config/:rw \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-full-scan.py \
  -t https://your-app.staging.example.com \
  -n /zap/config/app-context.context \
  -U "standard_user" \
  -r authenticated-scan-report.html

# ─────────────────────────────────────────────
# GENERATE REPORTS VIA ZAP API
# ─────────────────────────────────────────────
curl "http://localhost:8080/JSON/reports/action/generate/?apikey={{ZAP_API_KEY}}&title=Security+Report&template=traditional-html-plus&reportDir=/zap/wrk/&reportFileName=security-report"
```

---

## 8. ZAP Automation Framework Config

For advanced CI/CD integration using ZAP's built-in Automation Framework (YAML-based).

```yaml
# zap-automation-plan.yaml
env:
  contexts:
    - name: "App Security Context"
      urls:
        - "https://your-app.staging.example.com"
      includePaths:
        - "https://your-app.staging.example.com.*"
      excludePaths:
        - "https://your-app.staging.example.com/logout"
      authentication:
        method: "json"
        parameters:
          loginPageUrl: "https://your-app.staging.example.com/auth/login"
          loginRequestBody: '{"email":"{%username%}","password":"{%password%}"}'
          loginRequestUrl: "https://your-app.staging.example.com/auth/login"
        verification:
          method: "response"
          loggedInRegex: "access_token"
          loggedOutRegex: "Unauthorized"
      users:
        - name: "standard_user"
          credentials:
            username: "${ZAP_TEST_USER}"
            password: "${ZAP_TEST_PASSWORD}"
  parameters:
    failOnError: true
    failOnWarning: false
    progressToStdout: true

jobs:
  - type: spider
    parameters:
      context: "App Security Context"
      user: "standard_user"
      maxDuration: 10
      maxDepth: 10
      acceptCookies: true

  - type: ajaxSpider
    parameters:
      context: "App Security Context"
      user: "standard_user"
      maxDuration: 5
      runOnlyIfModern: true

  - type: passiveScan-wait
    parameters:
      maxDuration: 10

  - type: activeScan
    parameters:
      context: "App Security Context"
      user: "standard_user"
      policy: "Default Policy"
      maxScanDurationInMins: 60

  - type: report
    parameters:
      template: "traditional-html-plus"
      reportDir: "/zap/wrk/"
      reportFile: "security-report"
      reportTitle: "Security Scan Report"
      reportDescription: "Automated ZAP security scan"
    risks:
      - high
      - medium
      - low
      - informational
```

---

## 9. Vulnerability Severity Classification

```json
{
  "severity_model": {
    "CRITICAL": {
      "cvss_range": "9.0 – 10.0",
      "zap_risk_level": "High (P0)",
      "examples": ["Remote Code Execution", "SQL Injection with data exfiltration", "Authentication bypass", "Broken access control exposing all user data"],
      "sla_to_fix": "24 hours — block release",
      "action": "Immediate escalation. Release blocked until remediated and re-tested."
    },
    "HIGH": {
      "cvss_range": "7.0 – 8.9",
      "zap_risk_level": "High",
      "examples": ["Stored XSS", "IDOR", "Sensitive data exposure", "SSRF", "Privilege escalation"],
      "sla_to_fix": "3 business days — block release",
      "action": "Defect raised as P1. Release blocked until remediated."
    },
    "MEDIUM": {
      "cvss_range": "4.0 – 6.9",
      "zap_risk_level": "Medium",
      "examples": ["Reflected XSS", "Missing security headers", "CSRF on non-critical endpoints", "Weak TLS configuration"],
      "sla_to_fix": "7 business days",
      "action": "Defect raised as P2. Release may proceed with documented risk acceptance."
    },
    "LOW": {
      "cvss_range": "0.1 – 3.9",
      "zap_risk_level": "Low",
      "examples": ["Verbose error messages", "Cookie without Secure flag", "Missing cache-control headers"],
      "sla_to_fix": "30 days",
      "action": "Defect raised as P3. Tracked and resolved in a future sprint."
    },
    "INFORMATIONAL": {
      "cvss_range": "0.0",
      "zap_risk_level": "Informational",
      "examples": ["Technology fingerprinting", "Non-sensitive information disclosure"],
      "sla_to_fix": "Next quarter",
      "action": "Logged and reviewed in the next security review cycle."
    }
  }
}
```

---

## 10. Test Execution Workflow (For AI Agent)

```json
{
  "execution_flow": [
    "validate_written_authorisation_and_scope",
    "validate_entry_criteria",
    "start_zap_in_daemon_mode",
    "configure_zap_context_and_authentication",
    "run_spider_to_map_attack_surface",
    "run_ajax_spider_for_spa_content",
    "run_passive_scan_on_all_discovered_content",
    "run_active_scan_by_priority",
    "validate_security_headers_on_all_responses",
    "run_authenticated_scan_for_each_user_role",
    "run_api_scan_against_openapi_spec",
    "collect_and_triage_zap_alerts",
    "classify_findings_by_severity",
    "raise_defects_for_critical_and_high_findings",
    "generate_zap_report_in_all_formats",
    "compare_against_previous_scan_baseline",
    "notify_security_lead_and_development_team"
  ]
}
```

**Step-by-step detail:**

| Step | Description |
|---|---|
| `validate_written_authorisation_and_scope` | Confirm written authorisation exists before any active scanning — this is a legal requirement for penetration testing |
| `validate_entry_criteria` | Confirm all entry criteria in the strategy are met before any tool is executed |
| `start_zap_in_daemon_mode` | Launch ZAP headlessly. Confirm the REST API is responding on the configured port. |
| `configure_zap_context_and_authentication` | Set up the ZAP context with scope URLs, exclusions, and authentication method. Validate a successful login before proceeding. |
| `run_spider_to_map_attack_surface` | Crawl the application to discover all endpoints, forms, and parameters before scanning |
| `run_ajax_spider_for_spa_content` | Use AJAX spider for JavaScript-heavy or Single Page Applications where traditional spider may miss content |
| `run_passive_scan_on_all_discovered_content` | Passive scan analyses traffic without sending attack payloads — safe to run in any environment |
| `run_active_scan_by_priority` | Active scan sends attack payloads. Run P0 scenarios first. Never run active scan without explicit approval. |
| `validate_security_headers_on_all_responses` | Check every response for required headers and flag any that are missing or misconfigured |
| `run_authenticated_scan_for_each_user_role` | Repeat the scan logged in as admin, standard user, and unauthenticated to catch role-specific vulnerabilities |
| `run_api_scan_against_openapi_spec` | Import the OpenAPI spec into ZAP and scan every documented endpoint — catches vulnerabilities missed by spidering |
| `collect_and_triage_zap_alerts` | Pull all ZAP alerts. Remove confirmed false positives. Group by OWASP category. |
| `classify_findings_by_severity` | Map ZAP alert risk levels to the severity model in section 9 |
| `raise_defects_for_critical_and_high_findings` | Log every CRITICAL and HIGH finding as a tracked defect immediately |
| `generate_zap_report_in_all_formats` | Export HTML, JSON, and XML reports. Store in date-stamped report folder. |
| `compare_against_previous_scan_baseline` | Identify new vulnerabilities introduced since the last scan and regressions where fixed issues have re-emerged |
| `notify_security_lead_and_development_team` | Share findings with stakeholders — include overall verdict, CRITICAL/HIGH count, and top remediation priorities |

---

## 11. Security Test Report Template

```json
{
  "report": {
    "report_id": "SEC_RPT_001",
    "project_name": "Your Project Name",
    "version": "1.0.0",
    "classification": "CONFIDENTIAL",
    "environment": "staging",
    "scan_date": "YYYY-MM-DD",
    "scan_duration": "HH:MM",
    "tool": "OWASP ZAP 2.15",
    "executed_by": "Security Engineer Name",
    "reviewed_by": "Security Lead",

    "overall_verdict": "PASS | FAIL | CONDITIONAL PASS",

    "summary": {
      "total_alerts": 24,
      "critical": 0,
      "high": 2,
      "medium": 7,
      "low": 10,
      "informational": 5,
      "false_positives_excluded": 3,
      "release_blocked": false
    },

    "findings": [
      {
        "finding_id": "SEC_FIND_001",
        "severity": "HIGH",
        "owasp_category": "A01:2021 — Broken Access Control",
        "cwe_id": "CWE-639",
        "zap_alert_name": "Insecure Direct Object Reference",
        "affected_endpoint": "GET /api/users/{id}/profile",
        "evidence": "Authenticated as User A (ID: 101), accessed User B's profile (ID: 102). Response returned User B's full profile data.",
        "cvss_score": 8.1,
        "remediation": "Enforce server-side ownership validation. Verify that the authenticated user owns the requested resource.",
        "defect_id": "BUG-4421",
        "status": "Open",
        "owner": "Backend Team",
        "due_date": "YYYY-MM-DD"
      }
    ],

    "baseline_comparison": {
      "previous_scan_date": "YYYY-MM-DD",
      "new_findings": 3,
      "resolved_findings": 8,
      "regressions": 0,
      "verdict": "Net improvement — 8 issues closed, 3 new findings to address"
    },

    "false_positives": [
      {
        "zap_alert": "Application Error Disclosure",
        "reason": "Intentional validation error response. Not a real error disclosure.",
        "confirmed_by": "Security Engineer"
      }
    ],

    "recommendations": [
      "Fix SEC_FIND_001 (IDOR) immediately — block release until remediated",
      "Implement CSP header across all responses",
      "Enable HSTS preload on the primary domain",
      "Conduct targeted penetration test on payment flow in next sprint"
    ],

    "sign_off": {
      "security_lead": "Pending",
      "engineering_lead": "Pending",
      "release_manager": "Pending"
    }
  }
}
```

---

## 12. CI/CD Integration Config

```json
{
  "ci_cd_config": {
    "tool": "OWASP ZAP via Docker",
    "docker_image": "ghcr.io/zaproxy/zaproxy:stable",

    "pipeline_stages": {
      "pull_request": {
        "scan_type": "baseline_scan",
        "command": "zap-baseline.py -t {{TARGET_URL}} -r baseline-report.html -J baseline-report.json",
        "max_duration_minutes": 10,
        "purpose": "Passive scan only — catches obvious security misconfigurations without attacking the app",
        "fail_build_on": ["HIGH risk alerts", "CRITICAL risk alerts"]
      },
      "pre_deployment_staging": {
        "scan_type": "full_scan",
        "command": "zap-full-scan.py -t {{TARGET_URL}} -r full-report.html -J full-report.json -n context.context -U standard_user",
        "max_duration_minutes": 90,
        "purpose": "Full active scan against staging — mandatory before every production deployment",
        "fail_build_on": ["Any HIGH or CRITICAL alert"]
      },
      "api_deployment": {
        "scan_type": "api_scan",
        "command": "zap-api-scan.py -t {{OPENAPI_URL}} -f openapi -r api-report.html -J api-report.json",
        "max_duration_minutes": 45,
        "purpose": "Scan all API endpoints defined in the OpenAPI spec",
        "fail_build_on": ["Any HIGH or CRITICAL alert"]
      },
      "nightly": {
        "scan_type": "full_authenticated_scan",
        "command": "zap.sh -cmd -autorun /zap/config/automation-plan.yaml",
        "max_duration_minutes": 180,
        "purpose": "Deep authenticated scan across all user roles with full active scanning",
        "fail_build_on": ["Any HIGH or CRITICAL alert", "New MEDIUM alert compared to baseline"]
      }
    },

    "report_artifacts": [
      "html_report",
      "json_report",
      "xml_report",
      "sarif_report"
    ],

    "sarif_integration": {
      "enabled": true,
      "purpose": "Upload SARIF report to GitHub Advanced Security / GitLab SAST for inline code annotation",
      "command": "zap-full-scan.py -t {{TARGET_URL}} -J report.json && python3 zap-to-sarif.py"
    },

    "fail_build_on": [
      "CRITICAL severity finding",
      "HIGH severity finding",
      "New HIGH finding compared to previous baseline"
    ],

    "notify_on_failure": ["slack_security_channel", "email_security_lead", "jira_auto_ticket"]
  }
}
```

---

## 13. Security Anti-Patterns to Avoid

```json
{
  "anti_patterns": [
    {
      "id": "SAP_001",
      "name": "Running active scans against production",
      "risk": "CRITICAL",
      "description": "Active scanning sends attack payloads that can corrupt data, trigger alerts, cause outages, and may be illegal without written authorisation.",
      "fix": "Active and attack scans must only target dedicated staging environments. Baseline/passive scans are safe for production monitoring."
    },
    {
      "id": "SAP_002",
      "name": "Scanning without a defined context or authentication",
      "risk": "HIGH",
      "description": "An unauthenticated ZAP scan only covers the public attack surface — typically less than 30% of a typical application.",
      "fix": "Always configure ZAP context with authentication. Validate that ZAP successfully authenticates before starting the scan."
    },
    {
      "id": "SAP_003",
      "name": "Treating all ZAP alerts as confirmed vulnerabilities",
      "risk": "MEDIUM",
      "description": "ZAP produces false positives. Acting on every alert without triage wastes developer time and erodes trust in security testing.",
      "fix": "Every alert must be manually verified before raising a defect. Document confirmed false positives with justification."
    },
    {
      "id": "SAP_004",
      "name": "No security testing in the CI/CD pipeline",
      "risk": "CRITICAL",
      "description": "Point-in-time security testing misses vulnerabilities introduced between releases.",
      "fix": "Integrate ZAP baseline scan into every pull request pipeline. Run full scan on every pre-deployment build."
    },
    {
      "id": "SAP_005",
      "name": "Storing real credentials or PII in test scripts",
      "risk": "CRITICAL",
      "description": "Test scripts committed to source control with real credentials create a credential exposure risk that is difficult to remediate.",
      "fix": "Use environment variables or a secrets manager for all credentials. Never hardcode tokens, passwords, or PII in scripts or config files."
    },
    {
      "id": "SAP_006",
      "name": "Ignoring MEDIUM and LOW findings indefinitely",
      "risk": "HIGH",
      "description": "MEDIUM and LOW findings accumulate and are often chained together by attackers to achieve CRITICAL impact.",
      "fix": "Track all findings in the issue tracker. Review and remediate LOW/MEDIUM issues on a regular sprint cadence."
    },
    {
      "id": "SAP_007",
      "name": "Running security tests without written authorisation",
      "risk": "CRITICAL",
      "description": "Active penetration testing without written authorisation from the asset owner may violate the Computer Fraud and Abuse Act (CFAA) and equivalent laws in other jurisdictions.",
      "fix": "Obtain written authorisation from the asset owner before running any active or attack scan. Define scope explicitly in the authorisation document."
    }
  ]
}
```

---

## 14. Recommended Folder Structure

```
/security-testing
  /strategy
      security-test-strategy.md          # Test strategy, scope, objectives, entry/exit criteria
      threat-model.md                     # Threat modelling output (STRIDE or PASTA)
      risk-acceptance-register.md         # Formally accepted risks with owner sign-off

  /zap
      /contexts
          app-context.context             # ZAP context file with scope and auth config
      /policies
          custom-scan-policy.policy       # ZAP scan policy (attack strength + thresholds)
      /automation
          zap-automation-plan.yaml        # ZAP Automation Framework plan
      /scripts
          zap-baseline.sh                 # Wrapper script for baseline scan
          zap-full-scan.sh                # Wrapper script for full scan
          zap-api-scan.sh                 # Wrapper script for API scan
          zap-to-sarif.py                 # Convert ZAP JSON output to SARIF format

  /test-cases
      owasp-top10-tests.json              # Test cases mapped to OWASP Top 10
      api-security-tests.json             # OWASP API Security Top 10 tests
      auth-session-tests.json             # Authentication and session management tests

  /environments
      staging.json                        # Staging environment variables (no secrets)
      secrets.env.example                 # Example secrets file — never commit real secrets

  /reports
      /YYYY-MM-DD
          baseline-report.html            # ZAP baseline scan report
          full-scan-report.html           # ZAP full scan report
          api-scan-report.html            # ZAP API scan report
          findings-summary.json           # Triage-ready JSON findings
          report.sarif                    # SARIF format for IDE and code review integration

  /baselines
      v1.0.0-baseline.json               # Baseline alerts from previous release (for regression comparison)
```

---

## 15. AI Agent Instructions

```json
{
  "agent_rules": [
    "Never execute an active or attack scan without verifying written authorisation exists and scope is defined",
    "Always validate ZAP authentication is working correctly before starting any scan — a failed auth means only the public surface is tested",
    "Run spider and AJAX spider before active scanning to ensure full attack surface is mapped",
    "Never run active scans against production — baseline passive scans only in production",
    "Triage every ZAP alert manually before raising a defect — not all alerts are confirmed vulnerabilities",
    "Always scan with multiple user roles — unauthenticated, standard user, and admin",
    "Import the OpenAPI specification into ZAP for API scans — do not rely solely on spidering to discover endpoints",
    "Never store credentials, API keys, or tokens in scan scripts or config files — use environment variables or a secrets manager",
    "Block the release pipeline if any CRITICAL or HIGH severity finding is confirmed",
    "Compare every scan result against the previous baseline and flag regressions immediately",
    "Generate reports in HTML, JSON, and SARIF formats after every scan",
    "Store all reports in a date-stamped folder for audit trail and compliance purposes",
    "Do not exclude alerts from reporting without documented justification signed off by the security lead",
    "Raise a defect in the issue tracker for every confirmed CRITICAL and HIGH finding — do not embed findings only in the report",
    "Treat all test data as sensitive — use anonymised synthetic data only, never real user PII"
  ]
}
```

---

## Quick Reference Card

### ZAP Scan Types

| Scan Type | Active Attacks | Auth Support | Best For | Safe for Prod |
|---|---|---|---|---|
| Baseline Scan | No | No | PR pipeline, quick checks | Yes |
| Full Scan | Yes | Yes | Pre-deployment security gate | No |
| API Scan | Yes | Yes | REST API and OpenAPI testing | No |
| AJAX Spider | No | Yes | Single Page Applications | Yes |
| Automation Framework | Configurable | Yes | Complex CI/CD pipelines | Configurable |

### Severity vs Action

| Severity | CVSS | ZAP Risk | Release Decision | SLA to Fix |
|---|---|---|---|---|
| CRITICAL | 9.0–10.0 | High | Block immediately | 24 hours |
| HIGH | 7.0–8.9 | High | Block release | 3 business days |
| MEDIUM | 4.0–6.9 | Medium | Risk accepted for release | 7 business days |
| LOW | 0.1–3.9 | Low | Track in backlog | 30 days |
| INFO | 0.0 | Informational | Log and review | Next quarter |

### OWASP Top 10 — ZAP Coverage Summary

| OWASP Category | ZAP Scanner IDs | Coverage Level |
|---|---|---|
| A01 — Broken Access Control | 6, 10094, 10095, 10096 | Partial — supplement with manual testing |
| A02 — Cryptographic Failures | 10012, 10015, 10017, 10020 | Good |
| A03 — Injection | 40012, 40016, 40018, 40019, 40020 | Good |
| A04 — Insecure Design | Manual only | Requires manual threat modelling |
| A05 — Security Misconfiguration | 10010, 10038, 10054, 90011 | Excellent |
| A06 — Vulnerable Components | 10003 | Partial — supplement with SCA tools |
| A07 — Auth Failures | 10023, 10040, 40026, 40027 | Good |
| A08 — Data Integrity Failures | 10096 | Partial |
| A09 — Logging Failures | Manual only | Requires log review |
| A10 — SSRF | 40046 | Good |

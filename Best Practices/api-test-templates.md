# API Test Templates

A collection of reusable templates for configuring and testing APIs with an AI Agent.

---

## 1. Project Config Template

Use this template to define the base configuration for a project before running any tests.

```json
{
  "project_name": "Your Project Name",
  "base_url": "https://api.example.com",
  "auth": {
    "type": "Bearer",
    "token": "{{TOKEN}}"
  },
  "environments": ["dev", "staging", "production"],
  "timeout_ms": 5000,
  "retry_count": 2
}
```

**Fields:**

| Field | Type | Description |
|---|---|---|
| `project_name` | string | Human-readable name for the project |
| `base_url` | string | Root URL prepended to all endpoint paths |
| `auth.type` | string | Authentication scheme (e.g. `Bearer`) |
| `auth.token` | string | Token value; use `{{TOKEN}}` as a placeholder |
| `environments` | array | List of valid deployment environments |
| `timeout_ms` | number | Max request duration in milliseconds |
| `retry_count` | number | Number of retry attempts on failure |

---

## 2. API Test Case Template (Happy Path)

Use this template for positive/valid input test cases.

```json
{
  "test_id": "API_TC_001",
  "name": "Create User - Valid Input",
  "priority": "P0",
  "risk_level": "HIGH",
  "endpoint": "/users",
  "method": "POST",

  "headers": {
    "Authorization": "Bearer {{TOKEN}}",
    "Content-Type": "application/json"
  },

  "request_body": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  },

  "expected": {
    "status_code": 201,
    "response_time_ms": "< 1000",
    "schema_validation": true,
    "body_contains": {
      "id": "not null",
      "email": "john@example.com"
    }
  }
}
```

**Fields:**

| Field | Type | Description |
|---|---|---|
| `test_id` | string | Unique identifier for the test case |
| `name` | string | Short description of what is being tested |
| `priority` | string | Test priority (`P0` = critical, `P1`, `P2`, etc.) |
| `risk_level` | string | Business risk if this test fails (`HIGH`, `MEDIUM`, `LOW`) |
| `endpoint` | string | API path relative to `base_url` |
| `method` | string | HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) |
| `headers` | object | Request headers including auth tokens |
| `request_body` | object | JSON payload sent with the request |
| `expected.status_code` | number | Expected HTTP response status code |
| `expected.response_time_ms` | string | Maximum acceptable response time |
| `expected.schema_validation` | boolean | Whether to validate the response against a schema |
| `expected.body_contains` | object | Key-value pairs that must appear in the response body |

---

## 3. Negative Test Template

Use this template to verify the API correctly rejects invalid input.

```json
{
  "test_id": "API_TC_002",
  "name": "Create User - Invalid Email",
  "priority": "P0",
  "risk_level": "HIGH",
  "endpoint": "/users",
  "method": "POST",

  "request_body": {
    "name": "John Doe",
    "email": "invalid-email",
    "password": "SecurePass123"
  },

  "expected": {
    "status_code": 400,
    "error_message": "Invalid email format"
  }
}
```

**Fields:**

| Field | Type | Description |
|---|---|---|
| `test_id` | string | Unique identifier for the test case |
| `name` | string | Description naming the invalid condition being tested |
| `priority` | string | Test priority |
| `risk_level` | string | Business risk level |
| `endpoint` | string | API path relative to `base_url` |
| `method` | string | HTTP method |
| `request_body` | object | Payload containing the invalid or malformed data |
| `expected.status_code` | number | Expected error status code (e.g. `400`, `422`) |
| `expected.error_message` | string | Exact or partial error message expected in the response |

---

## 4. Auth Test Template

Use this template to verify that protected endpoints reject unauthenticated requests.

```json
{
  "test_id": "API_TC_003",
  "name": "Access Protected Endpoint Without Token",
  "priority": "P0",
  "risk_level": "HIGH",

  "endpoint": "/users/profile",
  "method": "GET",

  "headers": {},

  "expected": {
    "status_code": 401,
    "error_message": "Unauthorized"
  }
}
```

**Fields:**

| Field | Type | Description |
|---|---|---|
| `test_id` | string | Unique identifier for the test case |
| `name` | string | Description of the auth scenario being tested |
| `priority` | string | Test priority |
| `risk_level` | string | Business risk level |
| `endpoint` | string | Protected API path relative to `base_url` |
| `method` | string | HTTP method |
| `headers` | object | Pass an empty object `{}` to simulate a missing token |
| `expected.status_code` | number | Expected auth failure code (`401` = Unauthorized, `403` = Forbidden) |
| `expected.error_message` | string | Error message expected in the response |

---

## 5. Response Validation Rules

Defines how the agent must validate every API response.

```json
{
  "validation_rules": {
    "status_code": "must match expected",
    "response_time": "must be under threshold",
    "schema": "must match OpenAPI spec",
    "data_types": "strict validation",
    "required_fields": "must not be null",
    "no_extra_fields": false
  }
}
```

**Rules:**

| Rule | Description |
|---|---|
| `status_code` | Response HTTP status must exactly match `expected.status_code` |
| `response_time` | Response duration must not exceed `expected.response_time_ms` |
| `schema` | Response structure must conform to the OpenAPI specification |
| `data_types` | All field types in the response must match the schema exactly — no coercion |
| `required_fields` | Any field marked required must be present and non-null |
| `no_extra_fields` | Set to `true` to fail on unexpected fields; `false` allows additional fields |

---

## 6. Risk-Based Prioritization Model

Maps risk levels to test areas, coverage targets, and automation requirements.

```json
{
  "risk_matrix": {
    "HIGH": {
      "areas": ["payments", "authentication", "transactions"],
      "test_coverage": "100%",
      "automation": "mandatory"
    },
    "MEDIUM": {
      "areas": ["user profile", "search"],
      "test_coverage": "70%",
      "automation": "recommended"
    },
    "LOW": {
      "areas": ["static content"],
      "test_coverage": "40%",
      "automation": "optional"
    }
  }
}
```

**Risk Levels:**

| Level | Areas | Coverage Target | Automation |
|---|---|---|---|
| `HIGH` | payments, authentication, transactions | 100% | Mandatory — must be automated |
| `MEDIUM` | user profile, search | 70% | Recommended — automate where feasible |
| `LOW` | static content | 40% | Optional — manual testing acceptable |

---

## 7. Test Execution Workflow

The ordered sequence of steps the agent must follow for every test run.

```json
{
  "execution_flow": [
    "load_environment",
    "set_base_url",
    "authenticate_if_required",
    "execute_request",
    "validate_status_code",
    "validate_response_body",
    "validate_schema",
    "log_results",
    "retry_on_failure_if_configured"
  ]
}
```

**Steps:**

| Step | Description |
|---|---|
| `load_environment` | Load the target environment config (`dev`, `staging`, `production`) |
| `set_base_url` | Set `base_url` from the Project Config for the active environment |
| `authenticate_if_required` | Obtain and attach the auth token if the endpoint requires authentication |
| `execute_request` | Send the HTTP request with the specified method, headers, and body |
| `validate_status_code` | Compare actual status code against `expected.status_code` — fail immediately on mismatch |
| `validate_response_body` | Assert that all `body_contains` fields are present and match expected values |
| `validate_schema` | Validate the full response structure against the OpenAPI spec |
| `log_results` | Write the full request, response, and pass/fail outcome to the test log |
| `retry_on_failure_if_configured` | Retry up to `retry_count` times only for network-related failures |

---

## 8. AI Agent Rules

Core behavioral rules the agent must follow at all times.

```json
{
  "agent_rules": [
    "Always prioritize P0 and HIGH risk tests first",
    "Fail test immediately if status code mismatch",
    "Log full request and response for every failure",
    "Validate both positive and negative scenarios",
    "Do not skip schema validation",
    "Retry only for network-related failures",
    "Flag any response time above threshold as warning",
    "Ensure test data is unique where required",
    "Do not hardcode environment-specific values"
  ]
}
```

**Rules explained:**

| Rule | Rationale |
|---|---|
| Prioritize P0 and HIGH risk tests first | Catches critical failures early before investing time in lower-priority tests |
| Fail immediately on status code mismatch | A wrong status code invalidates all further validation — do not proceed |
| Log full request and response on failure | Provides complete context for debugging without needing to re-run the test |
| Validate both positive and negative scenarios | Ensures the API accepts valid input and correctly rejects invalid input |
| Do not skip schema validation | Schema drift causes silent bugs in consumers — always enforce the contract |
| Retry only for network-related failures | Retrying logic errors masks bugs; only transient network issues warrant a retry |
| Flag response time above threshold as warning | Slow responses may not fail a test but indicate a performance regression |
| Ensure test data is unique where required | Duplicate data causes false failures on endpoints that enforce uniqueness |
| Do not hardcode environment-specific values | All environment values must come from config — keeps tests portable |

---

## 9. Automation Config (CI/CD)

Configuration for running the test suite in a CI/CD pipeline.

```json
{
  "ci_execution": {
    "tool": "Newman",
    "command": "newman run collection.json -e env.json",
    "triggers": ["pull_request", "deployment"],
    "report_format": ["html", "json"],
    "fail_build_on": ["P0 failure", "HIGH risk failure"]
  }
}
```

**Fields:**

| Field | Description |
|---|---|
| `tool` | Test runner used to execute the collection (Newman runs Postman collections in CLI) |
| `command` | Full shell command to invoke; `-e env.json` injects environment variables |
| `triggers` | Pipeline events that kick off a test run |
| `report_format` | Output formats generated after each run (`html` for humans, `json` for tooling) |
| `fail_build_on` | Conditions that cause the pipeline to fail and block the deployment |

---

## 10. Recommended Folder Structure

Organize all API testing assets using this directory layout.

```
/api-testing
  /collections      # Postman or Newman collection files (.json)
  /environments     # Environment variable files per target (dev, staging, prod)
  /test-data        # Static or generated request payloads and fixtures
  /reports          # Test run output — HTML and JSON reports
  /scripts          # Helper scripts for setup, teardown, and CI integration
```

**Guidelines:**
- Never store real credentials in `/environments` — use secret manager references or CI secrets.
- Keep `/test-data` files environment-agnostic; inject environment-specific values at runtime.
- Archive `/reports` per run with a timestamp so results are traceable over time.

---

## Agent Instructions

When using these templates:

1. **Replace all `{{TOKEN}}` placeholders** with the actual token value before executing a test.
2. **Prepend `base_url`** from the Project Config to each `endpoint` to form the full request URL.
3. **Follow the execution workflow** in section 7 for every test — do not skip steps.
4. **Apply validation rules** from section 5 to every response.
5. **Use the risk matrix** in section 6 to determine test order and coverage requirements.
6. **Enforce all agent rules** in section 8 without exception.
7. **Use `test_id`** to uniquely reference and report on each test case.
8. **Run P0 and HIGH risk tests first** — they must pass before lower-priority tests execute.

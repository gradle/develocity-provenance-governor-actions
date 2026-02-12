<br>

<img src="https://raw.githubusercontent.com/gradle/develocity-provenance-governor-actions/cf78bf3e54d43cf9806a3ee3bbc7e2a4683ff786/src/policy/policy-header.svg" alt="Policy Evaluator" width="100%" height="auto">

# Policy Scan Evaluation - ⛔ Error

**Policy Scan:** `security-scan`

**Subject:** `pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3`

**Digest:** `c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b`

**Error:** Policy Scan Not Found

> The requested policy scan 'security-scan' was not found in the system

**Type:** about:blank

<details><summary>Raw Error Response</summary>

```json
{
  "request": {
    "uri": "http://localhost:8080/test-eval/policy-scans/test",
    "pkg": {
      "type": "oci",
      "name": "java-payment-calculator",
      "version": "1.0.0-SNAPSHOT-16152750186-3"
    },
    "criteria": {
      "sha256": "c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b",
      "repositoryUrl": "develocitytia.jfrog.io/docker-trial"
    },
    "policyScanName": "test"
  },
  "title": "Policy Scan Not Found",
  "detail": "The requested policy scan 'security-scan' was not found in the system",
  "status": 404,
  "type": "about:blank"
}
```

</details>

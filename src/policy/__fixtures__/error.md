<br>

<img src="https://raw.githubusercontent.com/gist/rnett/38fcc9ed1bafaa96934a788630148884/raw/52411f8f4910ba25dd44d7434644ec8dd9e79ad6/policy-header.svg" alt="Policy Evaluator" width="100%" height="auto">

# Policy Scan Evaluation - ⛔ Error

**Policy Scan:** `security-scan`

**Enforcement Point:** `test-enforcement-point`

**Subject:** `pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3`

**Digest:** `c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b`


**Error:** Policy Scan Not Found

> The requested policy scan 'security-scan' was not found in the system

**Type:** about:blank

<details><summary>Raw Error Response</summary>

```json
{
  "request": {
    "uri": "http://localhost:8080/local-tenant/policy/scans/security-scan/evaluations",
    "tenant": {
      "name": "default",
      "develocityInstances": [
        "sdlc-demo"
      ],
      "artifactoryInstances": [
        "develocity-tia"
      ]
    },
    "pkg": {
      "type": "oci",
      "name": "java-payment-calculator",
      "version": "1.0.0-SNAPSHOT-16152750186-3"
    },
    "criteria": {
      "sha256": "c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b",
      "repositoryUrl": "develocitytia.jfrog.io/docker-trial",
      "policyScanName": "security-scan"
    }
  },
  "title": "Policy Scan Not Found",
  "detail": "The requested policy scan 'security-scan' was not found in the system",
  "status": 404,
  "type": "about:blank"
}
```
</details>


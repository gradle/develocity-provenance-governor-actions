<br>

<img src="https://raw.githubusercontent.com/gradle/develocity-provenance-governor-actions/cf78bf3e54d43cf9806a3ee3bbc7e2a4683ff786/src/policy/policy-header.svg" alt="Policy Evaluator" width="100%" height="auto">

# Policy Scan Evaluated - ❌ UNSATISFIED

**Policy Scan:** `security-scan`

**Subject:** `pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3`

**Digest:** `c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b`


**Result:** ❌ UNSATISFIED

<table><tr><th>Policy</th><th>Type</th><th>Status</th><th>Attestations Passed / Evaluated</th><th>Description</th><th>Remediation</th><th>Failure Details</th></tr><tr><td>

`jvm-verification`
</td><td>

`Jvm`
</td><td>❌</td><td>0 / 1</td><td><td><td>

[Link](#user-content-policy-detail-0)
</td></tr><tr><td>

`repo-source-check`
</td><td>

`Repository`
</td><td>❌</td><td>0 / 1</td><td>Repository source verification</td><td>Ensure the repository is from a trusted source</td><td>

[Link](#user-content-policy-detail-1)
</td></tr><tr><td>

`build-scan-verification`
</td><td>

`BuildScan`
</td><td>✅</td><td>1 / 1</td><td>Build scan verification</td><td><td></tr></table>


# Failed Policies

## <a name="policy-detail-0"></a> Policy `jvm-verification`

**Type:** `Jvm`

**Labels:**

- `category` = `verification`
- `severity` = `medium`


<table><tr><th>Attestation</th><th>Status</th><th>Details</th><th>Build Scan</th></tr><tr><td>

`ZG9ja2VyLXRyaWFsLy5ldmlkZW5jZS8zMjYzN2Y1ZDQyNTNhNDk0MWZkZDE3YjRjYjExOTdlMmUxZjRkZjQyNDBjZmU2ZjNiN2ViNjJlYWM4YmJlMjc0LzczNTJhYTNlNTA1MWMzZWYyNmFhNTI3N2ZkMzBhNTFiMzQxNTA0NDFkOWU5NTU0YzlhOTk2MWU4YjQ0OTc1ZDIvZ3JhZGxlLWJ1aWxkLXRvb2wtMTc2NTIyMDE4Njk0My0xMjYwYTgwZS5qc29u`
</td><td>❌</td><td><td>

[Build Scan](http://localhost:24300/s/wyqqaj64qu73k)
</td></tr></table>


## <a name="policy-detail-1"></a> Policy `repo-source-check`

**Type:** `Repository`

**Description:** Repository source verification

**Remediation:** Ensure the repository is from a trusted source

<table><tr><th>Attestation</th><th>Status</th><th>Details</th><th>Build Scan</th></tr><tr><td>

`ZG9ja2VyLXRyaWFsLy5ldmlkZW5jZS8zMjYzN2Y1ZDQyNTNhNDk0MWZkZDE3YjRjYjExOTdlMmUxZjRkZjQyNDBjZmU2ZjNiN2ViNjJlYWM4YmJlMjc0LzczNTJhYTNlNTA1MWMzZWYyNmFhNTI3N2ZkMzBhNTFiMzQxNTA0NDFkOWU5NTU0YzlhOTk2MWU4YjQ0OTc1ZDIvZ3JhZGxlLWJ1aWxkLXRvb2wtMTc2NTIyMDE4Njk0My0xMjYwYTgwZS5qc29u`
</td><td>❌</td><td><td>

[Build Scan](http://localhost:24300/s/wyqqaj64qu73k)
</td></tr></table>



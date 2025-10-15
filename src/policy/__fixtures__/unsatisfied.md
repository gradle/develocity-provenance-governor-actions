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


<table><tr><th>Attestation</th><th>Status</th><th>Details</th><th>Build Scan</th><th>Download Link</th></tr><tr><td>

`gradle-java-toolchain-1759959918012-eda0f750.jsonnull`
</td><td>❌</td><td><td>

[Build Scan](http://localhost:24300/s/wyqqaj64qu73k)
</td><td>

[Download Link](https://develocitytia.jfrog.io/artifactory/docker-trial/.evidence/c35e1a4fecb35e4f7a829b2ae3d4bea93ad66247a062dda4b3301df79d73f5f8/3f6cabfb527d740e79e0f49e2f4e564279d8c74a0bfc4481fc3a44e6b085fe91/gradle-java-toolchain-1759959918012-eda0f750.jsonnull)
</td></tr></table>


## <a name="policy-detail-1"></a> Policy `repo-source-check`

**Type:** `Repository`

**Description:** Repository source verification

**Remediation:** Ensure the repository is from a trusted source

<table><tr><th>Attestation</th><th>Status</th><th>Details</th><th>Build Scan</th><th>Download Link</th></tr><tr><td>

`gradle-java-toolchain-1759959918012-eda0f750.jsonnull`
</td><td>❌</td><td><td>

[Build Scan](http://localhost:24300/s/wyqqaj64qu73k)
</td><td>

[Download Link](https://develocitytia.jfrog.io/artifactory/docker-trial/.evidence/c35e1a4fecb35e4f7a829b2ae3d4bea93ad66247a062dda4b3301df79d73f5f8/3f6cabfb527d740e79e0f49e2f4e564279d8c74a0bfc4481fc3a44e6b085fe91/gradle-java-toolchain-1759959918012-eda0f750.jsonnull)
</td></tr></table>



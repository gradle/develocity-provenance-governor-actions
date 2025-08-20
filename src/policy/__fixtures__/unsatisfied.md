<br>

<img src="https://raw.githubusercontent.com/gist/rnett/38fcc9ed1bafaa96934a788630148884/raw/52411f8f4910ba25dd44d7434644ec8dd9e79ad6/policy-header.svg" alt="Policy Evaluator" width="100%" height="auto">

# Policy Scan Evaluated - ❌ UNSATISFIED

**Policy Scan:** `security-scan`

**Subject:** `pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3`

**Digest:** `c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b`


**Result:** ❌ UNSATISFIED

<table><tr><th>Attestation</th><th>Status</th><th>Predicate Type</th><th>Build Scan</th><th>Satisfied Policies</th><th>Unsatisfied Policies</th><th>Details</th></tr><tr><td>

`gradle-attestations-resolved-dependencies-1755182830781-304dd5f5.json`
</td><td>❌</td><td>

`https://gradle.com/attestations/repository/v1`
</td><td>

https://develocity.grdev.net/s/u4cqaqnytbwga
</td><td>1</td><td>1</td><td>

[Link](#user-content-attestation-detail-0)
</td></tr></table>

# Details



## <a name="attestation-detail-0"></a> Attestation `gradle-attestations-resolved-dependencies-1755182830781-304dd5f5.json`

**Predicate Type:** `https://gradle.com/attestations/repository/v1`

**Build Scan:** https://develocity.grdev.net/s/u4cqaqnytbwga

**Attestation Store:** `https://develocitytia.jfrog.io/attestation/`

<details>
<summary>Attestation Details</summary>

Attestation URI: `https://develocitytia.jfrog.io/artifactory/docker-trial/.evidence/ed0870faabc4387c5fee46e3b26ab0262610764cc6a708d37dc84a54e90652f6/a30f98e704871a244ac3f28c2ada5c120afe756e981438f221e21fff3042a11b/gradle-attestations-resolved-dependencies-1755182830781-304dd5f5.json`

Envelope:

```json
{
  "payload": {
    "_type": "https://in-toto.io/Statement/v1",
    "predicateType": "https://gradle.com/attestations/repository/v1",
    "subject": [
      {
        "name": "pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3",
        "digest": {
          "sha256": "c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b"
        }
      }
    ],
    "predicate": {
      "buildScanUri": "https://develocity.grdev.net/s/u4cqaqnytbwga",
      "uri": "https://repo.maven.apache.org/maven2/"
    }
  }
}
```

</details>

**Policy Results:**

<table><tr><th>Policy</th><th>Status</th><th>Description</th><th>Remediation</th><th>Labels</th><th>Details</th></tr><tr><td>

`repo-source-check`
</td><td>❌</td><td>Repository source verification failed</td><td>Ensure the repository is from a trusted source</td><td>

```json
{
  "category": "security",
  "severity": "high"
}
```
</td><td>

```json
{
  "description": "Repository source verification failed",
  "remediation": "Ensure the repository is from a trusted source"
}
```
</td></tr><tr><td>

`build-scan-verification`
</td><td>✅</td><td>Build scan verification passed</td><td><td>

```json
{
  "category": "verification",
  "severity": "medium"
}
```
</td><td>

```json
{
  "description": "Build scan verification passed"
}
```
</td></tr><tr><td>

`jvm-verification`
</td><td>N/A</td><td><td><td><td>Not applicable to this predicate type</td></tr></table>


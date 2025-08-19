<br>

<img src="https://raw.githubusercontent.com/gist/rnett/38fcc9ed1bafaa96934a788630148884/raw/52411f8f4910ba25dd44d7434644ec8dd9e79ad6/policy-header.svg" alt="Policy Evaluator" width="100%" height="auto">

# Policy Scan Evaluated - ❌ UNSATISFIED

**Policy Scan:** `security-scan`

**Subject:** `pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3`

**Digest:** `c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b`


**Result:** ❌ UNSATISFIED



## Unsatisfactory Attestation `gradle-attestations-resolved-dependencies-1755182830781-304dd5f5.json`

**Predicate Type:** `https://gradle.com/attestations/repository/v1`

**Build Scan:** https://develocity.grdev.net/s/u4cqaqnytbwga

<details><summary>Attestation Envelope</summary>

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

### Unsatisfied policy `https://policies.example.com/repo-source-check`

**Description:** Repository source verification failed

**Remediation:** Ensure the repository is from a trusted source

**Labels:**
 * `category` = `security`
 * `severity` = `high`

<details><summary>Policy Details</summary>

```json
{
  "description": "Repository source verification failed",
  "remediation": "Ensure the repository is from a trusted source"
}
```
</details>



## Full results

<details>
<summary>Expand to see all results</summary>


### Attestation `gradle-attestations-resolved-dependencies-1755182830781-304dd5f5.json`

**Predicate Type:** `https://gradle.com/attestations/repository/v1`

**Build Scan:** https://develocity.grdev.net/s/u4cqaqnytbwga

<details><summary>Envelope</summary>

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

<table><tr><th>Policy</th><th>Status</th><th>Description</th></tr><tr><td>

`https://policies.example.com/repo-source-check`
</td><td>❌</td><td>Repository source verification failed</td></tr><tr><td>

`https://policies.example.com/build-scan-verification`
</td><td>✅</td><td>Build scan verification passed</td></tr></table>

</details>

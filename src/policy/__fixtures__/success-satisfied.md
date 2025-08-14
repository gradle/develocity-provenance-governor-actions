<br>

<img src="https://gist.githubusercontent.com/bdemers/18c7a0fc36b0b1c0c88260fd9e228ad1/raw/db71e3a9b8220a9ea5e855be28711990b1afdcbe/attestation-header.svg" alt="Policy Evaluation" width="100%" height="auto">

# Policy Scan Evaluated - ✅ SATISFIED

**Policy Scan:** security-scan

**Subject:** pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3

**Digest:** `c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b`


**Result:** ✅ SATISFIED

## Full results

<details>
<summary>Expand to see all results</summary>


### Attestation https://develocitytia.jfrog.io/attestation/1

**Predicate Type:** https://gradle.com/attestations/repository/v1

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

<table><tr><th>Policy</th><th>Status</th><th>Description</th></tr><tr><td>https://policies.example.com/repo-source-check</td><td>✅</td><td>Repository source verification passed</td></tr><tr><td>https://policies.example.com/build-scan-verification</td><td>✅</td><td>Build scan verification passed</td></tr></table>

</details>

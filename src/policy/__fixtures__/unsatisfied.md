<br>

<img src="https://raw.githubusercontent.com/gist/rnett/38fcc9ed1bafaa96934a788630148884/raw/52411f8f4910ba25dd44d7434644ec8dd9e79ad6/policy-header.svg" alt="Policy Evaluator" width="100%" height="auto">

# Policy Scan Evaluated - ❌ UNSATISFIED

**Policy Scan:** `security-scan`

**Subject:** `pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3`

**Digest:** `c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b`


**Result:** ❌ UNSATISFIED

<table><tr><th>Policy</th><th>Status</th><th>Attestations Passed / Evaluated</th><th>Description</th><th>Remediation</th><th>Failure Details</th></tr><tr><td>

`build-scan-verification`
</td><td>✅</td><td>1 / 1</td><td>Build scan verification</td><td><td></tr><tr><td>

`jvm-verification`
</td><td>N/A</td><td>0 / 0</td><td><td><td></tr><tr><td>

`repo-source-check`
</td><td>❌</td><td>0 / 1</td><td>Repository source verification</td><td>Ensure the repository is from a trusted source</td><td>

[Link](#user-content-policy-detail-2)
</td></tr></table>


# Failed Policies

## <a name="policy-detail-2"></a> Policy: `repo-source-check`

**Description:** Repository source verification

**Remediation:** Ensure the repository is from a trusted source

**Labels:**

```json
{
  "category": "security",
  "severity": "high"
}
```

<table><tr><th>Attestation</th><th>Status</th><th>Details</th><th>Envelope</th></tr><tr><td>

`gradle-attestations-resolved-dependencies-1755182830781-304dd5f5.json`
</td><td>❌</td><td><td>

<details>

<summary>Envelope</summary>



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
</td></tr></table>



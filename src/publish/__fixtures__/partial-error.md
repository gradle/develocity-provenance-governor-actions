<br>

<img src="https://raw.githubusercontent.com/gradle/develocity-provenance-governor-actions/cf78bf3e54d43cf9806a3ee3bbc7e2a4683ff786/src/publish/publish-header.svg" alt="Attestation Publisher" width="100%" height="auto">

# Attestations Publishing Failed

**Error:** Internal Server Error

> Failed to publish some attestations, see errors for details

**Type:** about:blank

<details><summary>Raw Error Response</summary>

```json
{
  "type": "about:blank",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "Failed to publish some attestations, see errors for details",
  "instance": "/default/packages/oci/java-payment-calculator/1.0.0-SNAPSHOT-16152750186/attestations",
  "request": {
    "uri": "http://localhost:8080/packages/oci/java-payment-calculator/1.0.0-SNAPSHOT-16152750186/attestations",
    "pkg": {
      "type": "oci",
      "name": "java-payment-calculator",
      "version": "1.0.0-SNAPSHOT-16152750186"
    },
    "criteria": {
      "sha256": "1a6b2bf83435f2a9ccd33519ad3e817bf79aee6af1c7a15d26d8a256bfa9cc94",
      "repositoryUrl": "develocitytia.jfrog.io/docker-trial",
      "buildScan": {
        "ids": [
          "eo5xxyg3drtoc"
        ]
      }
    }
  },
  "successes": [
    {
      "storeType": "artifactory",
      "storeUri": "https://develocitytia.jfrog.io",
      "storeRequest": {
        "uri": "https://develocitytia.jfrog.io/evidence/api/v1/subject/docker-trial/java-payment-calculator/1.0.0-SNAPSHOT-16152750186-3/manifest.json",
        "body": {
          "payload": "eyJfdHlwZSI6Imh0dHBzOi8vaW4tdG90by5pby9TdGF0ZW1lbnQvdjEiLCJzdWJqZWN0IjpbeyJuYW1lIjoicGtnOm9jaS9qYXZhLXBheW1lbnQtY2FsY3VsYXRvckBmOWIyZDI3ZmJlY2EyMDhjZDcxNDMwZmZhZTgxMzk4MDI0NjdjZjZkYjU2Yjc2YTI3MzljMmQ1ZTEzMzkwODRmP3JlcG9zaXRvcnlfdXJsPWRldmVsb2NpdHl0aWEuamZyb2cuaW8lMkZkb2NrZXItdHJpYWwmdGFnPTEuMC4wLVNOQVBTSE9ULTk5ODU5MjUwOTIiLCJkaWdlc3QiOnsic2hhMjU2IjoiZjliMmQyN2ZiZWNhMjA4Y2Q3MTQzMGZmYWU4MTM5ODAyNDY3Y2Y2ZGI1NmI3NmEyNzM5YzJkNWUxMzM5MDg0ZiJ9fV0sInByZWRpY2F0ZVR5cGUiOiJodHRwczovL2dyYWRsZS5jb20vYXR0ZXN0YXRpb25zL3JlcG9zaXRvcnkvdjEiLCJwcmVkaWNhdGUiOnsiYnVpbGRTY2FuVXJpIjoiaHR0cHM6Ly9kZXZlbG9jaXR5LmdyZGV2Lm5ldC9zL3U0Y3FhcW55dGJ3Z2EiLCJ1cmkiOiJodHRwczovL3JlcG8ubWF2ZW4uYXBhY2hlLm9yZy9tYXZlbjIvIn0sImNyZWF0ZWRBdCI6IjIwMjUtMDctMTBUMTg6MTE6MzEuOTYyWiIsImNyZWF0ZWRCeSI6InVzZXIifQ==",
          "payloadType": "application/vnd.in-toto+json",
          "signatures": [
            {}
          ]
        }
      },
      "storeResponse": {
        "name": "gradle-attestations-repository-1752171092262-dc7d228c.json",
        "sha256": "c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b",
        "path": "java-payment-calculator/1.0.0-SNAPSHOT-16152750186-3/manifest.json",
        "predicate_category": "Custom",
        "created_at": "2025-07-10T18:11:31.962Z",
        "predicate_slug": "gradle-attestations-repository",
        "uri": "docker-trial/.evidence/aa2fa444849b0384f9ec5e8c70fd4c536ace38b3b83173eb295f3d848edadf7a/f9b2d27fbeca208cd71430ffae8139802467cf6db56b76a2739c2d5e1339084f/gradle-attestations-repository-1752171092262-dc7d228c.json",
        "predicate_type": "https://gradle.com/attestations/repository/v1",
        "created_by": "user",
        "repository": "docker-trial",
        "verified": false
      }
    }
  ],
  "errors": [
    {
      "storeType": "artifactory",
      "storeUri": "https://develocitytia.jfrog.io",
      "storeRequest": {
        "uri": "https://develocitytia.jfrog.io/evidence/api/v1/subject/docker-trial/java-payment-calculator/1.0.0-SNAPSHOT-16152750186/manifest.json",
        "body": {
          "payload": "eyJfdHlwZSI6Imh0dHBzOi8vaW4tdG90by5pby9TdGF0ZW1lbnQvdjEiLCJzdWJqZWN0IjpbeyJuYW1lIjoicGtnOm9jaS9qYXZhLXBheW1lbnQtY2FsY3VsYXRvckAxYTZiMmJmODM0MzVmMmE5Y2NkMzM1MTlhZDNlODE3YmY3OWFlZTZhZjFjN2ExNWQyNmQ4YTI1NmJmYTljYzk0P3JlcG9zaXRvcnlfdXJsPWRldmVsb2NpdHl0aWEuamZyb2cuaW8lMkZkb2NrZXItdHJpYWwmdGFnPTEuMC4wLVNOQVBTSE9ULTE2MTUyNzUwMTg2IiwiZGlnZXN0Ijp7InNoYTI1NiI6IjFhNmIyYmY4MzQzNWYyYTljY2QzMzUxOWFkM2U4MTdiZjc5YWVlNmFmMWM3YTE1ZDI2ZDhhMjU2YmZhOWNjOTQifX1dLCJwcmVkaWNhdGVUeXBlIjoiaHR0cHM6Ly9ncmFkbGUuY29tL2F0dGVzdGF0aW9ucy9idWlsZC10b29sL3YxIiwicHJlZGljYXRlIjp7ImJ1aWxkSWQiOiJlbzV4eHlnM2RydG9jIiwiYnVpbGRTY2FuVXJpIjoiaHR0cHM6Ly9kZXZlbG9jaXR5LnNkbGMtZGVtby5ncmFkbGUuY29tL3MvZW81eHh5ZzNkcnRvYyIsInRvb2xUeXBlIjoibWF2ZW4iLCJ0b29sVmVyc2lvbiI6IjMuOS45IiwiYWdlbnRWZXJzaW9uIjoiMS4yMyJ9LCJjcmVhdGVkQXQiOiIyMDI1LTA3LTE4VDIxOjM1OjQ4LjY2NFoiLCJjcmVhdGVkQnkiOiJwdWJsaXNoZXIifQ==",
          "payloadType": "application/vnd.in-toto+json",
          "signatures": [
            {}
          ]
        }
      },
      "storeResponse": {
        "status": 404,
        "message": "404 Not Found from POST https://develocitytia.jfrog.io/evidence/api/v1/subject/docker-trial/java-payment-calculator/1.0.0-SNAPSHOT-16152750186/manifest.json",
        "headers": {
          "Date": [
            "Fri, 18 Jul 2025 21:35:48 GMT"
          ],
          "Content-Type": [
            "application/json; charset=utf-8"
          ],
          "Content-Length": [
            "306"
          ],
          "Connection": [
            "keep-alive"
          ],
          "Strict-Transport-Security": [
            "max-age=31536000; includeSubDomains"
          ],
          "X-Jfrog-Node-Id": [
            "jfrog-saas-prod-2-use1-mt-evidence-6b4594b5b8-2gnmv"
          ],
          "X-Jfrog-Service-Id": [
            "jfevd@0000"
          ]
        },
        "body": {
          "errors": [
            {
              "message": "request: GET http://localhost:8046/artifactory/api/storage/docker-trial/java-payment-calculator/1.0.0-SNAPSHOT-16152750186/manifest.json?sourceRepo, status code: 404, response body: {\n  \"errors\" : [ {\n    \"status\" : 404,\n    \"message\" : \"Unable to find item\"\n  } ]\n}"
            }
          ]
        }
      }
    }
  ]
}
```
</details>

**Subject:** <a href="https://develocitytia.jfrog.io/ui/repos/tree/General/docker-trial/java-payment-calculator/1.0.0-SNAPSHOT-16152750186-3/manifest.json">pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3</a>

**Digest:** `c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b`

<table><tr><th>Type</th><th>Published</th><th>Details</th></tr><tr><td>

`https://gradle.com/attestations/build-tool/v1`</td><td>❌</td><td>404 Not Found from POST https://develocitytia.jfrog.io/evidence/api/v1/subject/docker-trial/java-payment-calculator/1.0.0-SNAPSHOT-16152750186/manifest.json</td></tr><tr><td>

`https://gradle.com/attestations/repository/v1`</td><td>✅</td><td>


<details open>

<summary>Attestation</summary>

```json
{
  "buildScanUri": "https://develocity.grdev.net/s/u4cqaqnytbwga",
  "uri": "https://repo.maven.apache.org/maven2/"
}
```


</details>

[Download](https://develocitytia.jfrog.io/ui/api/v1/download/docker-trial/.evidence/aa2fa444849b0384f9ec5e8c70fd4c536ace38b3b83173eb295f3d848edadf7a/f9b2d27fbeca208cd71430ffae8139802467cf6db56b76a2739c2d5e1339084f/gradle-attestations-repository-1752171092262-dc7d228c.json)
</td></tr></table>


# Develocity Provenance Governor Actions

GitHub Actions to make [Develocity Provenance Governor](https://gradle.com/develocity/product/provenance-governor/) part
of your GitHub workflows.

---

## Publishing

```yaml
uses: gradle/develocity-provenance-governor-actions/publish@main
with:
  attestation-publisher-url: 'https://develocity-provenance-governor.example.com'
  build-scan-ids: eo5xxyg3drtoc
  build-scan-queries: 'value:"CI run=${{ github.run_id }}"'
  subject-type: oci
  subject-name: java-payment-calculator
  subject-version: 1.2.3
  subject-digest: 1a6b2bf83435f2a9ccd33519ad3e817bf79aee6af1c7a15d26d8a256bfa9cc94
  subject-repository-url: develocitytia.jfrog.io/docker-trial
  annotations: |
    github.repository.id=${{ github.repository_id }}
    github.run.id=${{ github.run_id }}
```

Requires a GitHub OIDC token.

One of `build-scan-ids` or `build-scan-queries` must be provided.
Multiple IDs and queries may be specified, one per line.
Queries use
the [Develocity advanced query syntax](https://docs.gradle.com/develocity/api-manual/#advanced_search_syntax).

There is also a `subject-namespace` field that can be used with subject types that require it.

> [!TIP]
> You can use the Common Custom User Data plugins
> ([Gradle](https://github.com/gradle/common-custom-user-data-gradle-plugin),
> [Maven](https://github.com/gradle/common-custom-user-data-maven-extension),
> [Sbt](https://github.com/gradle/common-custom-user-data-sbt-plugin))
> to automatically add GitHub-related custom values to Build Scans,
> like the `CI run` value used in the example configuration.

The `annotations` field attaches `key=value` metadata to the publish request, one pair per line.
Provenance Governor stores annotations on the attestation subject and uses them to select
[Fact Connector](https://docs.develocity.ai/provenance-governor/current/fact-connector/) policies.
Keys must not begin with the reserved `request.` prefix.

## Enforcement

```yaml
uses: gradle/develocity-provenance-governor-actions/enforce@main
with:
  policy-evaluator-url: 'https://develocity-provenance-governor.example.com'
  subject-type: oci
  subject-name: java-payment-calculator
  subject-version: 1.2.3
  subject-digest: 1a6b2bf83435f2a9ccd33519ad3e817bf79aee6af1c7a15d26d8a256bfa9cc94
  subject-repository-url: develocitytia.jfrog.io/docker-example-repo
  policy-scan: ci-enforcement
```

Requires a GitHub OIDC token.

There is also a `subject-namespace` field that can be used with subject types that require it.

# Develocity Provenance Governor Actions - BETA

---

## Publishing

```yaml
uses: gradle/develocity-provenance-governor-actions/publish@main
with:
  attestation-publisher-url: 'https://cavendish.sdlc-demo.gradle.com'
  tenant: default
  build-scan-ids: eo5xxyg3drtoc
  build-scan-queries: 'value:"CI run=${{ github.run_id }}"'
  subject-type: oci
  subject-name: java-payment-calculator
  subject-version: 1.0.0-SNAPSHOT-16152750186-4
  subject-digest: 1a6b2bf83435f2a9ccd33519ad3e817bf79aee6af1c7a15d26d8a256bfa9cc94
  subject-repository-url: develocitytia.jfrog.io/docker-trial
```

Requires a GitHub ID token with `write` permissions.

One of `build-scan-ids` or `build-scan-queries` must be provided.
Multiple IDs and queries may be specified, one per line.
Queries use
the[Develocity advanced query syntax](https://docs.gradle.com/develocity/api-manual/#advanced_search_syntax).

There is also a `subject-namespace` field that can be used with subject types that require it.

> [!TIP]
> You can use the Common Custom User Data plugins
> ([Gradle](https://github.com/gradle/common-custom-user-data-gradle-plugin),
> [Maven](https://github.com/gradle/common-custom-user-data-maven-extension),
> [Sbt](https://github.com/gradle/common-custom-user-data-sbt-plugin))
> to automatically add GitHub-related custom values to build scan,
> like the `CI run` value used in the example configuration.

## Enforcement

```yaml
uses: gradle/develocity-provenance-governor-actions/enforce@main
with:
  policy-evaluator-url: 'https://cavendish.sdlc-demo.gradle.com'
  tenant: default
  subject-type: oci
  subject-name: java-payment-calculator
  subject-version: 1.0.0-SNAPSHOT-16152750186-4
  subject-digest: 1a6b2bf83435f2a9ccd33519ad3e817bf79aee6af1c7a15d26d8a256bfa9cc94
  subject-repository-url: develocitytia.jfrog.io/docker-trial
  policy-scan: ci-enforcement
```

All properties are required. There is also a `subject-namespace` field that can
be used with subject types that require it.

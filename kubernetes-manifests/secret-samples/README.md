# Secret Samples

This folder contains example Kubernetes Secret manifests for the demo environment.

These files are intended to illustrate:

- which secret keys are required by the demo setup
- expected field names and manifest structure
- how to keep actual values out of source control

## Included files

- `strapi-credentials.yaml` — sample secret for Strapi application credentials and encryption keys
- `pg-user-credentials.yaml` — sample PostgreSQL user credentials for the demo database

## Important usage notes

- These manifests contain placeholder values only.
- Do not use them as actual production credentials.
- Replace all placeholder values such as `<your-app-keys>`, `<your-admin-jwt-secret>`, and `<your-encryption-key>` before applying.
- Keep real secret material in a secure store (Vault, Sealed Secrets, external secrets, etc.) or create Kubernetes Secrets at deploy time.

## How to use

1. Copy the sample manifest to a safe location.
2. Replace placeholder values with your own secrets.
3. Apply the manifest only after verifying the values are correct:

```bash
kubectl apply -f kubernetes-manifests/secret-samples/strapi-credentials.yaml
kubectl apply -f kubernetes-manifests/secret-samples/pg-user-credentials.yaml
```

## Security guidance

- Keep this folder under version control, but never commit real secret values.
- Use `stringData` for convenience in examples; for production, you may prefer `data` with base64-encoded values.
- If you need a deploy-time secret workflow, prefer tools that integrate with your CI/CD or secret management system.

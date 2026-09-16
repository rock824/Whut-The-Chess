# Whit the Chess? deployment

The frontend is hosted by GitHub Pages at `chess.whitplex.com`. Player accounts and progress are served from the k3s cluster at `chess-api.whitplex.com`.

## 1. Commit and push

```bash
git add .
git commit -m "Add player recovery, themes, difficulty, and strategy lessons"
git push
```

The `Build Chess API` workflow publishes `ghcr.io/rock824/whut-the-chess-api:latest`. After its first successful run, make the package public in GitHub package settings or configure an image pull secret in the `whit-chess` namespace.

## 2. Cloudflare DNS

Create these DNS routes:

- `chess.whitplex.com` points to `rock824.github.io` for GitHub Pages. Keep it DNS-only until GitHub finishes validating the custom domain; Cloudflare proxying can be enabled afterward.
- `chess-api.whitplex.com` routes through the existing Cloudflare Tunnel to the Traefik service for the k3s cluster.

In GitHub **Settings → Pages**, confirm the custom domain is `chess.whitplex.com` and enable HTTPS after validation completes.

## 3. Create the namespace and secret

Generate the values on the control-plane node. The database password must be URL-safe because it is also embedded in `database-url`.

```bash
kubectl apply -f k8s/base/namespace.yaml

POSTGRES_PASSWORD="$(openssl rand -hex 24)"
SESSION_SECRET="$(openssl rand -hex 48)"
read -rsp "Choose the private family invitation code: " REGISTRATION_CODE
echo

kubectl -n whit-chess create secret generic whit-chess-secrets \
  --from-literal=postgres-password="$POSTGRES_PASSWORD" \
  --from-literal=database-url="postgresql://whit_chess:${POSTGRES_PASSWORD}@postgres.whit-chess.svc.cluster.local:5432/whit_chess" \
  --from-literal=session-secret="$SESSION_SECRET" \
  --from-literal=registration-code="$REGISTRATION_CODE"

unset POSTGRES_PASSWORD SESSION_SECRET REGISTRATION_CODE
```

Do not commit the generated Secret. `k8s/secret.example.yaml` documents the required keys only.

## 4. Configure recovery email

PIN recovery uses SMTP. The included example is configured for Resend, but any SMTP provider that supports TLS works.

1. In Resend, add and verify a sending subdomain such as `updates.whitplex.com`.
2. Add the DNS records Resend supplies to the `whitplex.com` zone in Cloudflare.
3. Create a Resend API key after the domain shows as verified.
4. Create the Kubernetes Secret without saving the API key in Git:

```bash
read -rsp "Resend API key: " RESEND_API_KEY
echo

kubectl -n whit-chess create secret generic whit-chess-email \
  --from-literal=smtp-host=smtp.resend.com \
  --from-literal=smtp-username=resend \
  --from-literal=smtp-password="$RESEND_API_KEY" \
  --from-literal='smtp-from=Whit the Chess <accounts@updates.whitplex.com>' \
  --dry-run=client -o yaml | kubectl apply -f -

unset RESEND_API_KEY
```

`k8s/email-secret.example.yaml` documents these keys. Never put the real API key in that file or commit it.

## 5. Deploy through Argo CD

Apply the included Argo CD Application, or test the manifests directly first:

```bash
kubectl apply -f k8s/argocd-application.yaml

# Direct validation alternative:
kubectl apply -k k8s/base
kubectl -n whit-chess rollout status statefulset/postgres
kubectl -n whit-chess rollout status deployment/whit-chess-api
kubectl -n whit-chess get pods
kubectl -n whit-chess get svc,ingress,pvc
```

Wait for the GitHub Actions **Build Chess API** job to turn green. Because the deployment uses the moving `latest` image tag, restart it once after that workflow finishes so both replicas pull the new backend image:

```bash
kubectl -n whit-chess rollout restart deployment/whit-chess-api
kubectl -n whit-chess rollout status deployment/whit-chess-api
kubectl -n whit-chess get pods -w
```

Health check from inside the cluster:

```bash
kubectl run whit-chess-health \
  -n whit-chess \
  --rm -it \
  --restart=Never \
  --image=curlimages/curl \
  -- curl -fsS http://whit-chess-api/health
```

Expected result: `{"status":"ok"}`.

## 6. Test account recovery

1. Sign in at `https://chess.whitplex.com`.
2. Open the player profile, add a name and email address, and select **Save profile**.
3. Open the verification link from the email.
4. Sign out, choose **Forgot your PIN?**, and request a reset using the same username and verified email.

If email does not arrive, inspect the API log without printing the Secret:

```bash
kubectl -n whit-chess logs deployment/whit-chess-api --tail=100
kubectl -n whit-chess get secret whit-chess-email
```

## 7. Backups

Create `/tank/backups/whit-the-chess` on the NFS server and update the server IP in `k8s/optional/postgres-backup-nfs.yaml.example`. Save the configured copy as `k8s/optional/postgres-backup-nfs.yaml`, then apply it:

```bash
kubectl apply -f k8s/optional/postgres-backup-nfs.yaml
```

The CronJob runs at 03:17 daily and retains 30 days of compressed PostgreSQL dumps.

## 8. First player

Open the profile button in the game, choose **Create an invited player**, and enter the private invitation code created in step 3. Returning players need only their username and six-digit PIN.

## Troubleshooting

```bash
kubectl -n whit-chess logs deployment/whit-chess-api --tail=100
kubectl -n whit-chess logs statefulset/postgres --tail=100
kubectl -n whit-chess describe ingress whit-chess-api
kubectl -n whit-chess get events --sort-by=.lastTimestamp | tail -30
```

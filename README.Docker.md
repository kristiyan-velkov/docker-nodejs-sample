# Docker Node.js Sample — Deployment Guide

Production-oriented Node.js todo app: Express 5 API, React 19 (Vite) client, PostgreSQL 16.

## Quick start

### Development (API + Vite + Postgres)

```bash
git clone <repository-url>
cd docker-nodejs-sample
cp .env.example .env

docker compose up --build
# or with Compose Watch:
docker compose up app-dev --build --watch
```

| Service | URL / port |
|--------|------------|
| API (Express) | http://localhost:3000 (override with `APP_PORT`) |
| Frontend (Vite HMR) | http://localhost:5173 (`VITE_PORT`) |
| Node inspector | `localhost:9229` (`DEBUG_PORT`) |
| Health | http://localhost:3000/health |

The `db` service has **no profile**; it starts with `app-dev` when you run `docker compose up`.

### Production (single port — built client + API)

```bash
docker compose --profile prod up --build -d
```

| Access | URL / port |
|--------|------------|
| App (same origin for UI + `/api`) | http://localhost:8080 (`PROD_PORT`, maps to container `3000`) |
| Health | http://localhost:8080/health |

**Important:** There is **no Vite dev server** in production (`:5173` is dev-only). The UI is static files from `dist/client` served by Express.

Set `ALLOWED_ORIGINS` in `.env` for local prod testing, e.g. `http://localhost:8080`, or the browser may block CORS when origins do not match.

### Tests (Vitest in Docker)

```bash
docker compose --profile test run --rm --build app-test
```

Uses `Dockerfile.test`; requires `db` (Compose starts profile services together if you use `up`, or ensure `db` is running).

---

## Dockerfiles (repository root)

| File | Purpose |
|------|---------|
| **`Dockerfile`** | Production: `builder` → `runner`, `npm ci`, `npm run build`, `npm prune --omit=dev`, `USER node`, `ENTRYPOINT ["node","dist/server.js"]` |
| **`Dockerfile.development`** | Dev dependencies; runs as **root** so bind-mounted `vite.config.ts` etc. stay writable (Vite writes `*.timestamp-*.mjs` beside the config) |
| **`Dockerfile.test`** | Full install; `CMD npm run test:coverage` for CI/Compose |

Default Node base: **`ARG NODE_VERSION=24.22.1-alpine`** (override with `docker build --build-arg NODE_VERSION=...`).

---

## Docker Compose

### Services

- **`app-dev`** — development image, bind mounts for `src` (read-only) and config files (writable for Vite).
- **`app-prod`** — **profile `prod`**, production image, `tmpfs` on `/tmp`.
- **`app-test`** — **profile `test`**, test image.
- **`db`** — PostgreSQL 16, named volume `todoapp-postgres-data`.

### Networks

Compose defines `todoapp-network` **without** a fixed Docker network `name`, so the network is project-scoped (avoids clashes when the project directory name changes).

### Useful commands

```bash
docker compose logs -f app-dev
docker compose logs -f app-prod
docker compose --profile prod down
docker volume rm todoapp-postgres-data   # destructive: wipes DB data
```

---

## GitHub Actions (`.github/workflows/main.yml`)

Triggers: `push` / `pull_request` to `main`.

| Step | Behavior |
|------|----------|
| Build `Dockerfile.test`, load image, run container with `--network host` against job service Postgres | **All pushes & PRs** |
| Login to Docker Hub + build/push `Dockerfile` (`linux/amd64`, `linux/arm64`) | **Only** `push` to `main` |

**Secrets** (repository settings):

- `DOCKER_USERNAME`
- `DOCKERHUB_TOKEN` (PAT with push access)
- `DOCKERHUB_PROJECT_NAME` (Docker Hub repo name, e.g. `docker-nodejs-sample`)

QEMU is configured so **arm64** images build on GitHub’s amd64 runners.

Forks without secrets will still run tests; push steps are skipped when not on `main` push.

---

## Kubernetes (`nodejs-sample-kubernetes.yaml`)

- **Image:** replace `ghcr.io/your-username/docker-nodejs-sample:latest` with your pushed production image.
- **Security:** `runAsUser` / `fsGroup` **1000** (matches `node` in the official image). `readOnlyRootFilesystem` is **false** so the Node process can use writable paths (aligned with Compose).
- **Env:** ConfigMap supplies `HOST`, `PORT`, `HOME`, `TMPDIR`, DB settings, `ALLOWED_ORIGINS` — adjust for your cluster and domain.
- **Ingress / TLS:** update `yourdomain.com` and cert-manager issuer to match your environment.

```bash
kubectl apply -f nodejs-sample-kubernetes.yaml
kubectl get pods,svc -n todoapp
```

---

## Environment variables (`.env`)

See `.env.example` for `APP_PORT`, `VITE_PORT`, `PROD_PORT`, `DB_PORT`, Postgres credentials, and `ALLOWED_ORIGINS`.

---

## Taskfile

See `Taskfile.yml` for `task dev`, `task build`, `task compose:up:prod`, `task k8s:deploy`, etc.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| **401 pulling `node:*` from Docker Hub** | `docker logout docker.io` then pull again, or `docker login`; fix Docker Desktop Hub login. |
| **Vite EACCES on `vite.config.ts.timestamp-*`** | Dev image runs as root; ensure `vite.config.ts` mount is **not** `:ro` (see `compose.yml`). |
| **Prod works in container but not on host** | Use **published** port: default **8080** → container **3000** (`PROD_PORT`). |
| **Compose network warning** | Old global `todoapp-network` from another project: `docker network rm todoapp-network` if unused, or ignore after switching to project-scoped networks. |
| **DB data reset** | `docker compose down` does not remove named volume by default; remove volume explicitly if you need a clean DB. |

---

## Security notes

- **Production image** runs as **`USER node`** (non-root).
- **Development image** runs as **root** intentionally for bind-mount permissions; do not use it for production deployment.
- Keep base images and `npm audit` up to date for production.

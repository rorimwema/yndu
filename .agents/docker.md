# Docker Swarm Deployment Guide

## Scope

- This guide is for **full Docker Swarm** deployment of Yndu.
- Stack file: `docker-stack.yml`
- Stack name used below: `yndu`

## 1. Initialize Swarm

```bash
docker swarm init
```

For a multi-node cluster, join worker/manager nodes with the tokens from:

```bash
docker swarm join-token worker
docker swarm join-token manager
```

## 2. Build and Push Images (required for Swarm)

`docker stack deploy` does not build images. Build and push first.

```bash
export REGISTRY=ghcr.io/<your-org-or-user>
export IMAGE_NAME=yndu
export TAG=2026-02-21

docker build -f Dockerfile.deno -t $REGISTRY/$IMAGE_NAME/backend:$TAG .
docker build -f Dockerfile.nuxt -t $REGISTRY/$IMAGE_NAME/frontend:$TAG .
docker build -f gateway/Dockerfile -t $REGISTRY/$IMAGE_NAME/gateway:$TAG gateway
docker build -f services/users/Dockerfile -t $REGISTRY/$IMAGE_NAME/users:$TAG services/users
docker build -f services/inventory/Dockerfile -t $REGISTRY/$IMAGE_NAME/inventory:$TAG services/inventory
docker build -f services/orders/Dockerfile -t $REGISTRY/$IMAGE_NAME/orders:$TAG services/orders

docker push $REGISTRY/$IMAGE_NAME/backend:$TAG
docker push $REGISTRY/$IMAGE_NAME/frontend:$TAG
docker push $REGISTRY/$IMAGE_NAME/gateway:$TAG
docker push $REGISTRY/$IMAGE_NAME/users:$TAG
docker push $REGISTRY/$IMAGE_NAME/inventory:$TAG
docker push $REGISTRY/$IMAGE_NAME/orders:$TAG
```

## 3. Create Swarm Secrets

Create secrets once per cluster (or rotate as needed).

```bash
./scripts/swarm/create-secrets.sh
```

Manual equivalent:

```bash
docker secret create yndu_postgres_password secrets/prod/postgres_password.txt
docker secret create yndu_database_password secrets/prod/database_password.txt
docker secret create yndu_redis_password secrets/prod/redis_password.txt
docker secret create yndu_jwt_secret secrets/prod/jwt_secret.txt
docker secret create yndu_hashpay_api_key secrets/prod/hashpay_api_key.txt
docker secret create yndu_hashpay_account_id secrets/prod/hashpay_account_id.txt
docker secret create yndu_nuxt_session_password secrets/prod/nuxt_session_password.txt
```

Verify:

```bash
docker secret ls | rg '^.*yndu_'
```

## 4. Deploy the Stack

```bash
export REGISTRY=ghcr.io/<your-org-or-user>
export IMAGE_NAME=yndu
export TAG=2026-02-21
export CORS_ORIGIN=https://your-domain.example

docker stack deploy -c docker-stack.yml yndu
```

NPM helpers:

```bash
npm run swarm:init
npm run swarm:deploy
npm run swarm:services
npm run swarm:ps
npm run swarm:rm
```

## 5. Operate and Verify

```bash
docker stack services yndu
docker stack ps yndu
docker service ls | rg 'yndu_'
docker service logs -f yndu_nginx
```

Health checks:

- Backend: `GET /health` (through nginx/public URL)
- Gateway: `/graphql` via nginx
- Frontend: `/`

## 6. Update / Roll Forward

Push a new tag, then redeploy with new `TAG`.

```bash
export TAG=2026-02-22
docker stack deploy -c docker-stack.yml yndu
```

## 7. Secret Rotation

Swarm secrets are immutable. Use versioned names, update stack mapping, then redeploy.

Example (JWT):

```bash
docker secret create yndu_jwt_secret_v2 secrets/prod/jwt_secret.txt
```

Then in `docker-stack.yml` change:

- `secrets.jwt_secret.name` from `yndu_jwt_secret` to `yndu_jwt_secret_v2`

Redeploy:

```bash
docker stack deploy -c docker-stack.yml yndu
```

Remove old secret after all tasks are off it:

```bash
docker secret rm yndu_jwt_secret
```

## 8. Rollback

Rollback a single service:

```bash
docker service rollback yndu_backend
```

Or redeploy an older image tag:

```bash
export TAG=<older-tag>
docker stack deploy -c docker-stack.yml yndu
```

## 9. Remove Stack

```bash
docker stack rm yndu
```

## Notes

- `docker-stack.yml` uses **external Swarm secrets** (`yndu_*`).
- Backend supports `*_FILE` env variables and reads secrets from `/run/secrets/*`.
- Frontend session secret is read at container start from `/run/secrets/nuxt_session_password`.
- If you run multiple manager/worker nodes, local bind mounts like `./nginx/ssl` must exist on nodes
  where tasks can be scheduled, or replace with configs/secrets/volumes distributed across nodes.

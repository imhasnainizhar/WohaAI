## For Windows

docker network create microservices_net_01

docker compose `
  -f ../compose/client/compose.frontend.yml `
  -f ../compose/shared/compose.db.yml `
  -f ../compose/services/compose.ms.yml `
  -f ../compose/infra/nginx/compose.nginx.yml `
  -f ../compose/shared/compose.cache.yml `
  -f ../compose/shared/compose.queue.yml `
  --env-file ../../.env `
  --env-file ../../.env.docker `
  up --build

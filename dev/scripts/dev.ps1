## For Windows

docker network create microservices_net_01

docker compose `
  -f ../compose/compose.shared.yml `
  -f ../compose/compose.utility.yml `
  -f ../compose/compose.db.yml `
  -f ../compose/compose.auth.yml `
  -f ../compose/compose.gateway.yml `
  --env-file ../../.env `
  up --build

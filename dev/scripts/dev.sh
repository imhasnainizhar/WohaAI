## For Linuux and MacOS

docker compose \
  -f ../compose/client/compose.frontend.yml \
  -f ../compose/shared/compose.db.yml \
  -f ../compose/shared/compose.utility.yml \
  -f ../compose/services/compose.ms.yml \
  -f ../compose/infra/ngnix/compose.ngnix.yml \
  -f ../compose/shared/compose.cache.yml \
  -f ../compose/shared/compose.queue.yml \
  -f ../compose/mcp/compose.mcp.yml \
  -f ../compose/agents/compose.agents.yml \
  --env-file ../../.env \
  --env-file ../../.env.docker \
  up --build
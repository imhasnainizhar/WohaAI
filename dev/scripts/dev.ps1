## For Windows

docker compose `
  -f ../compose/client/compose.frontend.yml `
  -f ../compose/shared/compose.db.yml `
  -f ../compose/shared/compose.store.yml `
  -f ../compose/shared/compose.cache.yml `
  -f ../compose/shared/compose.queue.yml `
  -f ../compose/services/compose.ms.yml `
  -f ../compose/infra/nginx/compose.nginx.yml `
  -f ../compose/mcp/compose.mcp.yml `
  -f ../compose/agents/compose.ai.agents.yml `
  --env-file ../../.env `
  up --build
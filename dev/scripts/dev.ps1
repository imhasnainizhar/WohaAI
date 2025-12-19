## For Windows

# Create required Docker networks if they don't exist
$networks = @("mcp_net", "woahai_data_net", "microservices_net")
foreach ($network in $networks) {
    $exists = docker network ls --format "{{.Name}}" | Select-String -Pattern "^$network$"
    if (-not $exists) {
        docker network create $network
        Write-Host "Created network: $network"
    } else {
        Write-Host "Network already exists: $network"
    }
}

docker compose `
  -f ../compose/client/compose.frontend.yml `
  -f ../compose/shared/compose.db.yml `
  -f ../compose/services/compose.ms.yml `
  -f ../compose/infra/nginx/compose.nginx.yml `
  -f ../compose/shared/compose.cache.yml `
  -f ../compose/shared/compose.queue.yml `
  -f ../compose/mcp/compose.mcp.yml `
  -f ../compose/agents/compose.agents.yml `
  --env-file ../../.env `
  --env-file ../../.env.docker `
  up --build


docker compose `
  -f ../compose/shared/compose.db.yml `
  -f ../compose/shared/compose.store.yml `
  --env-file ../../.env `
  --env-file ../../.env.docker `
  up --build
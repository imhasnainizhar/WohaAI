use log::debug;
use mailer_service::config::env::init_env;
use mailer_service::config::env::Env;
use mailer_service::server::server_init;

#[tokio::main]
async fn main() {
    // This step is necessary for local development to load env from project root.
    init_env();
    env_logger::init();

    let port: u16 = Env::load()
        .auth_mailer_service_port
        .parse()
        .expect("Failed to parse AUTH_MAILER_SERVICE_PORT");

    server_init(port).await;

    debug!("Auth Mailer Service running on port! {}", port);
}

use std::env;
use std::path::Path;

use dotenvy::from_path;
use tracing::{debug, info};

pub fn init_env() {
    // Detect Docker
    let is_docker = Path::new("/.dockerenv").exists();

    // Detect production mode
    let is_production = matches!(env::var("NODE_ENV"), Ok(v) if v == "production");

    if !is_production {
        let env_path = if is_docker {
            // For docker development
            Path::new("/app/.env")
        } else {
            // For local development
            Path::new("../../../../../.env")
        };

        match from_path(env_path) {
            Ok(_) => {
                debug!("Loaded environment from: {}", env_path.display());
            }
            Err(err) => {
                debug!("Did not load env file '{}': {}", env_path.display(), err);
            }
        }
    } else {
        info!("Running in production — skipping .env load");
    }
}

pub struct Env {
    pub auth_mailer_service_port: String,
    pub mailer_host: String,
    pub mailer_port: String,
    pub mailer_user_email: String,
    pub mailer_user_password: String,
    pub mailer_email_from: String,
    pub mailer_secure: String,
    pub fluvio_api_uri: String,
}

impl Env {
    pub fn load() -> Self {
        Self {
            auth_mailer_service_port: env::var("AUTH_MAILER_SERVICE_PORT")
                .expect("AUTH_MAILER_SERVICE_PORT env var not set"),
            mailer_host: env::var("MAILER_HOST").expect("MAILER_HOST env var not set"),
            mailer_port: env::var("MAILER_PORT").expect("MAILER_PORT env var not set"),
            mailer_user_email: env::var("MAILER_USER_EMAIL")
                .expect("MAILER_USER_EMAIL env var not set"),
            mailer_user_password: env::var("MAILER_USER_PASSWORD")
                .expect("MAILER_USER_PASSWORD env var not set"),
            mailer_email_from: env::var("MAILER_EMAIL_FROM").expect("MAIL_FROM env var not set"),
            mailer_secure: env::var("MAILER_SECURE").expect("MAILER_SECURE env var not set"),
            fluvio_api_uri: env::var("FLUVIO_API_URI").expect("FLUVIO_API_URI env var not set"),
        }
    }

    pub fn set_env(key: &str, value: &str) {
        env::set_var(key, value);
    }
}
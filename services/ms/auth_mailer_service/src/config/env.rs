use std::env;

pub struct Env {
    pub email: String,
    pub password: String,
    pub provider_port: String,
    pub provider_host: String,
}

impl Env {
    pub fn load() -> Self {
        Self {
            email: env::var("EMAIL").expect("EMAIL env var not set"),
            password: env::var("PASSWORD").expect("PASSWORD env var not set"),
            provider_port: env::var("PROVIDER_PORT").expect("PROVIDER_PORT env var not set"),
            provider_host: env::var("PROVIDER_HOST").expect("PROVIDER_HOST env var not set"),
        }
    }
}

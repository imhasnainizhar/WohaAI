pub mod domain {
    pub mod app_state;
    pub mod email {
        pub mod verification;
    }
    pub mod queue {
        pub mod consumer;
    }
    pub mod types;
}

pub mod utils {
    pub mod response;
}

pub mod config {
    pub mod env;
}

pub mod services {
    pub mod email;
}

pub mod routes;
pub mod server;
pub mod handlers {
    pub mod verification_email;
}

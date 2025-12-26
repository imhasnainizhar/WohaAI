use log::{debug};

const PORT: u16 = 9090;

fn main() {
    env_logger::init();
    
    debug!("Auth Mailer Service running on port! {}", PORT);
}

use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub fluvio_topic: String,
}

pub fn state() -> Arc<AppState> {
    let state = Arc::new(AppState {
        fluvio_topic: "email-verification-topic".to_string(),
    });
    state
}

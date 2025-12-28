use axum::{routing::post, Router};
use crate::handlers::verification_email::send_verification_email_handler;
use crate::domain::app_state::state;

pub fn create_app() -> Router {
    Router::new()
        .route("/send-verification-email", post(send_verification_email_handler))
        .with_state(state())
}
use crate::domain::app_state::AppState;
use crate::services::email::auth_email_service;
use axum::{
    extract::{Json as JsonExtract, State},
    http::StatusCode,
    response::Json as JsonResponse,
};
use serde::Deserialize;
use serde_json::json;
use serde_json::Value;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct EmailRequest {
    pub email: String,
}

pub async fn send_verification_email_handler(
    State(_state): State<Arc<AppState>>,
    JsonExtract(payload): JsonExtract<EmailRequest>,
) -> Result<JsonResponse<Value>, (StatusCode, String)> {
    let _email = payload.email;

    let _ = auth_email_service().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Error in Auth Mailer Service: {}", e),
        )
    })?;

    Ok(JsonResponse(json!({
        "success": true,
        "message": "Verification email sent successfully"
    })))
}

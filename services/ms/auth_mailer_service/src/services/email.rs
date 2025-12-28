use crate::domain::queue::consumer::get_verification_email_data;
use crate::domain::email::verification::send_verification_email;
use anyhow::Result;

pub async fn auth_email_service() -> Result<()> {
    // Get verification email data from Fluvio Queue
    let code = get_verification_email_data().await?;

    // Send email
    send_verification_email(code.email, code.first_name, code.last_name, code.verification_token).await?;

    Ok(())
}
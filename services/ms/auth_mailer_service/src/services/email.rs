use crate::email::verification::sendVerificationEmail;
use crate::queue::consumer::getVerificationEmailData;
use anyhow::Result;

pub async fn auth_email_service() -> Result<()> {
    // Get verification email data from Fluvio Queue
    let code = getVerificationEmailData().await?;

    // Send email
    sendVerificationEmail(code.email, code.firstName, code.lastName, code.verification_token).await?;

    Ok(())
}
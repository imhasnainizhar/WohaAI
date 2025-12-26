use crate::config::env::Env;
use lazy_static::lazy_static;
use lettre::AsyncTransport;
use lettre::{
    Message,
    AsyncSmtpTransport,
    Tokio1Executor,
    transport::smtp::authentication::Credentials
};

lazy_static! {
    static ref ENV: Env = Env::load();
}

pub async fn sendVerificationEmail(
    email: String,
    firstName: String,
    lastName: String,
    verificationToken: String
) -> Result<(), anyhow::Error> {
    let email_addr = ENV.email.clone();
    let password = ENV.password.clone();
    let provider_port = ENV.provider_port.clone();
    let provider_host = ENV.provider_host.clone();

    let email_msg = Message::builder()
        .from(email_addr.parse()?)
        .to(email.parse()?)
        .subject("Your Verification Code")
        .body(format!("Your verification code is: {}", verificationToken))?;

    let creds = Credentials::new(email_addr, password);

    let mailer = AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&provider_host)?
        .port(provider_port.parse()?)
        .credentials(creds)
        .build();

    mailer.send(email_msg).await?;
    Ok(())
}


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

pub async fn send_verification_email(
    email: String,
    first_name: String,
    last_name: String,
    verification_token: String
) -> Result<(), anyhow::Error> {
    let email_addr = ENV.mailer_user_email.clone();
    let password = ENV.mailer_user_password.clone();
    let provider_port = ENV.mailer_port.clone();
    let provider_host = ENV.mailer_host.clone();

    let email_msg = Message::builder()
        .from(email_addr.parse()?)
        .to(email.parse()?)
        .subject("Your Verification Code")
        .body(format!("Hello {} {}, your verification code is: {}", first_name, last_name, verification_token))?;

    let creds = Credentials::new(email_addr, password); 

    let mailer = AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&provider_host)?
        .port(provider_port.parse()?)
        .credentials(creds)
        .build();

    mailer.send(email_msg).await?;
    Ok(())
}
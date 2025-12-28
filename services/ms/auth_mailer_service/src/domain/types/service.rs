use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct VerificationEmail {
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub verification_token: String,
}

#[derive(Deserialize)]
pub struct EmailRequest {
    pub email: String,
}

use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct VerificationEmail {
    pub email: String,
    pub firstName: String,
    pub lastName: String,
    pub verification_token: String,
}
use axum_extra::extract::cookie::Cookie as AxumCookie;
use axum_extra::extract::cookie::SameSite as AxumSameSite;
use cookie::time::Duration;
use serde::{Serialize, Serializer};

// Your custom Cookie struct
#[derive(Clone, Debug, Serialize)]
pub struct Cookie {
    pub name: String,
    pub value: String,
    pub http_only: bool,
    pub secure: bool,
    #[serde(serialize_with = "serialize_same_site")] // Add this line
    pub same_site: AxumSameSite,
    pub path: String,
    pub max_age: Option<i64>, // seconds
}


impl Cookie {
    pub fn into_axum(self) -> AxumCookie<'static> {
        let mut cookie = AxumCookie::new(self.name, self.value);

        cookie.set_path(self.path);
        cookie.set_secure(self.secure);
        cookie.set_http_only(self.http_only);
        cookie.set_same_site(self.same_site);

        if let Some(max_age) = self.max_age {
            cookie.set_max_age(Duration::seconds(max_age));
        }

        cookie
    }
}

#[derive(Serialize)]
pub struct ServiceResponse<T> {
    pub success: bool,
    pub status_code: u16,
    pub message: String,
    pub data: Option<T>,
    pub cookies: Option<Vec<Cookie>>,
    pub error_type: Option<String>,
    pub errors: Option<std::collections::HashMap<String, Vec<String>>>,
}

impl<T> ServiceResponse<T>
where
    T: Serialize,
{
    pub fn success(
        status_code: u16,
        message: impl Into<String>,
        data: Option<T>,
        cookies: Option<Vec<Cookie>>,
    ) -> Self {
        Self {
            success: true,
            status_code,
            message: message.into(),
            data,
            cookies,
            error_type: None,
            errors: None,
        }
    }

    pub fn error(
        status_code: u16,
        message: impl Into<String>,
        error_type: Option<String>,
        errors: Option<std::collections::HashMap<String, Vec<String>>>
    ) -> Self {
        Self {
            success: false,
            status_code,
            message: message.into(),
            data: None,
            cookies: None,
            error_type,
            errors,
        }
    }
}

// This helper function added to handle the serialization
fn serialize_same_site<S>(same_site: &AxumSameSite, s: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    match same_site {
        AxumSameSite::Strict => s.serialize_str("Strict"),
        AxumSameSite::Lax => s.serialize_str("Lax"),
        AxumSameSite::None => s.serialize_str("None"),
    }
}

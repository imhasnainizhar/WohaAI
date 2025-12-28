use crate::config::env::Env;
use crate::domain::types::service::VerificationEmail;
use anyhow::{anyhow, Result};
use fluvio::consumer::PartitionConsumer;
use fluvio::FluvioConfig;
use fluvio::{Fluvio, Offset};
use futures_lite::StreamExt;
use serde_json::{from_slice, to_string};
use tokio::time::{timeout, Duration};

pub async fn get_verification_email_data() -> Result<VerificationEmail> {
    let env = Env::load();
    let fluvio_api_uri = &env.fluvio_api_uri;
    std::env::set_var("FLUVIO_SC", fluvio_api_uri);

    // Connect to Fluvio
    let fluvio = Fluvio::connect().await?;

    // Create a partition consumer for topic "verification-emails", partition 0
    let consumer: PartitionConsumer = fluvio.partition_consumer("verification-emails", 0).await?;

    // Stream the latest message (Offset::from_end(1) gets last sent message)
    let mut stream = consumer
        .stream(Offset::from_end(1))
        .await
        .map_err(|e| anyhow!("Stream error: {}", e))?;

    // Wait max 5 seconds for a message
    let record_result = timeout(Duration::from_secs(5), stream.next())
        .await
        .map_err(|_| anyhow!("Timed out waiting for verification email on topic"))?;

    match record_result {
        Some(Ok(record)) => {
            let data: VerificationEmail = from_slice(record.value())
                .map_err(|e| anyhow!("Failed to deserialize VerificationEmail: {}", e))?;
            Ok(data)
        }
        Some(Err(e)) => Err(anyhow!("Fluvio stream error: {}", e)),
        None => Err(anyhow!("Stream closed unexpectedly")),
    }
}

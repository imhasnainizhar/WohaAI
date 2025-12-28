use crate::domain::types::service::VerificationEmail;
use anyhow::{anyhow, Result};
use fluvio::{Fluvio, Offset};
use fluvio::consumer::ConsumerConfigExtBuilder;
use fluvio::consumer::PartitionConsumer;
use futures_lite::StreamExt;
use serde_json::from_slice;
use tokio::time::{timeout, Duration};

pub async fn get_verification_email_data() -> Result<VerificationEmail> {
    let fluvio = Fluvio::connect().await?;
    
    // 1. Create a partition-specific consumer
    let consumer = fluvio.partition_consumer("verification-emails", 0).await?;

    // 2. Start stream from the very end (waiting for new) 
    // or Offset::from_end(1) to get the last sent message
    let mut stream = consumer
        .stream(Offset::end()) 
        .await
        .map_err(|e| anyhow!("Stream error: {}", e))?;

    // 3. Use timeout to prevent hanging the test/service
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

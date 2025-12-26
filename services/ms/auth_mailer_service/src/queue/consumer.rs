use fluvio::Fluvio;
use fluvio::Offset;
use fluvio::consumer::ConsumerConfig;
use futures_lite::StreamExt;
use serde::Deserialize;
use tokio::time::{timeout, Duration};
use anyhow::{Result, anyhow};
use crate::domain::types::email::VerificationEmail;


pub async fn getVerificationEmailData() -> Result<VerificationEmail> {
    let fluvio = Fluvio::connect().await?;
    let consumer = fluvio.partition_consumer("verification-emails", 0).await?;
    let mut stream = consumer.stream(Offset::end()).await?;
    
    if let Some(Ok(record)) = timeout(Duration::from_secs(5), stream.next()).await.map_err(|_| anyhow!("Timeout waiting for message"))? {
        let data: VerificationEmail = serde_json::from_slice(record.value())?;
        Ok(data)
    } else {
        Err(anyhow!("No message received from queue"))
    }
}
use crate::routes::create_app;
use std::net::SocketAddr;
use tokio::net::TcpListener;

pub async fn server_init(port: u16) {
    let app = create_app();
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    println!("Server running at http://{}", addr);

    let listener = TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app.into_make_service())
        .await
        .unwrap();
}

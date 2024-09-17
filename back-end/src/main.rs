use axum::{
    extract::Path,
    routing::get,
    Router,
};

use tower_http::cors::{
    CorsLayer,
    Any
};

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(vec!["GET".parse().unwrap(), "POST".parse().unwrap()])
        .allow_headers(vec![axum::http::header::ACCEPT]);

    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/hello/:name", get(|Path(name): Path<String>| async move {
            return match name.as_str() {
                "hardeol" => format!("Hello, {}! You are the best!", name),
                "Clément" => format!("Hello, {}! Python c'est nul", name),
                _ => format!("Hello, {}!", name),
            }
        }))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("localhost:3000").await.unwrap();
    println!("Listening on: http://{}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap();
}

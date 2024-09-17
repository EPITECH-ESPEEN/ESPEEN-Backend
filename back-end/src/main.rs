use axum::{
    extract::Path,
    routing::get,
    Router,
    response::IntoResponse,
    http::StatusCode,
};
use reqwest::Client;
use tower_http::cors::{
    CorsLayer,
    Any
};

async fn fetch_tips() -> impl IntoResponse {
    let client = Client::new();
    let url = "https://api.weatherapi.com/v1/current.json?q=Nice&lang=fr&key=01590aafbbae4766954122808241709";
    let api_key = "01590aafbbae4766954122808241709";

    let response = client.get(url)
            .header("Authorization", format!("Bearer {api_key}"))
            .send()
            .await;

    match response {
        Ok(response) => {
            match response.text().await {
                Ok(body) => (StatusCode::OK, body),
                Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Error parsing response body".into()),
            }
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Request failed".into()),
    }
}

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
            } }))
        .route("/stack", get(|| async { "Rust, Vue et Directus/MariaDB" }))
        .route("/tips", get(fetch_tips))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("localhost:3000").await.unwrap();
    println!("Listening on: http://{}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap();
}

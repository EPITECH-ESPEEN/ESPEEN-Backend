use std::time::Duration;
use axum::{extract::{Path, Extension}, routing::get, routing::post, Json, Router, response::IntoResponse, http::StatusCode, http::Method};
use reqwest::{Client};
use tower_http::cors::{
    CorsLayer,
    Any
};
use dotenv::dotenv;
use serde_json::json;
use sqlx_mysql::{MySqlPool, MySqlPoolOptions};

#[derive(serde::Deserialize)]
struct LoginForm {
    username: String,
    password: String,
}

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

async fn login(Json(payload): Json<LoginForm>, Extension(pool): Extension<MySqlPool>) -> impl IntoResponse {
    let username = &payload.username;
    let password = &payload.password;

    let result = sqlx::query("SELECT * FROM Users WHERE username = ? AND password = ?")
        .bind(username)
        .bind(password)
        .fetch_optional(&pool)
        .await;
    match result {
        Ok(None) => Json(json!({"message": "Invalid credentials"})).into_response(),
        Ok(_) => Json(json!({"message": "Login successful"})).into_response(),
        Err(_) => Json(json!({"message": "Invalid credentials"})).into_response(),
    }

}

async fn github_webhook(Json(payload): Json<serde_json::Value>) -> Json<serde_json::Value> {
    println!("Received GitHub webhook: {:?}", payload);

    // let image_url = call_r34_api(&client).await;

    Json(json!({
        "status": "success",
    }))
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = MySqlPoolOptions::new()
        .max_connections(20)
        .acquire_timeout(Duration::from_secs(2))
        .connect(&database_url)
        .await
        .unwrap();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(vec![Method::GET, Method::POST])
        .allow_headers(vec![axum::http::header::ACCEPT, axum::http::header::CONTENT_TYPE]);

    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/hello/:name", get(|Path(name): Path<String>| async move {
            return match name.as_str() {
                "hardeol" => format!("Hello, {}! You are the best!", name),
                "Clément" => format!("Hello, {}! Python c'est nul", name),
                _ => format!("Hello, {}!", name),
            } }))
        .route("/stack", get(|| async { "Rust, React et Directus/MariaDB" }))
        .route("/tips", get(fetch_tips))
        .route("/login", post({
            move |payload| login(payload, Extension(pool.clone()))
        }))
        .route("/github-webhook", post(github_webhook))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("localhost:3000").await.unwrap();
    println!("Listening on: http://{}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap(); //test
}

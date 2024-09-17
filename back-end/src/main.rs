use axum::{extract::{Path, Extension}, routing::get, routing::post, Json, Router, response::IntoResponse, http::StatusCode};
use reqwest::{Client};
use tower_http::cors::{
    CorsLayer,
    Any
};
use dotenv::dotenv;
use serde_json::json;
use sqlx_mysql::MySqlPool;

#[derive(serde::Deserialize)]
struct LoginForm {
    username: String,
    password: String,
}

// async fn authenticate_user(username: &str, password: &str, pool: &MySqlPool) -> Result<bool, sqlx::Error> {
//     let row = sqlx::query("SELECT * FROM users WHERE username = ? AND password = ?")
//         .bind(username)
//         .bind(password)
//         .await?;
//
//     let caca = row.fetch_one(pool).await;
//
//     match caca {
//         Ok(_) => Ok(true),
//         Err(_) => Ok(false),
//     }
// }

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
    // match authenticate_user(&form.username, &form.password, &pool).await {
    //     Ok(true) => Json("Login successful".to_string()),
    //     Ok(false) => Json("Invalid credentials".to_string()),
    //     Err(_) => Json("An error occurred".to_string()),
    // }

    let username = &payload.username;
    let password = &payload.password;

    let result = sqlx::query("SELECT * FROM users WHERE username = ? AND password = ?")
        .bind(username)
        .bind(password)
        .fetch_optional(&pool)
        .await;
    println!("{:?}, {:?}, {:?}", result, username, password);
    match result {
        Ok(_) => Json(json!({"message": "Login successful"})).into_response(),
        Err(_) => Json(json!({"message": "Invalid credentials"})).into_response(),
    }

}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = match MySqlPool::connect(&database_url).await {
        Ok(pool) => pool,
        Err(e) => {
            eprintln!("Failed to connect to the database: {}", e);
            return;
        }
    };

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
        // .route("/login", post({
        //     move |payload| login(payload, Extension(pool.clone()))
        // }))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("localhost:3000").await.unwrap();
    println!("Listening on: http://{}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap();
}

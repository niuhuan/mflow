// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tokio::time::{sleep, Duration};
use std::path::PathBuf;
use std::path::Path;

mod config;

#[tauri::command]
async fn load_account(name: String) -> Result<String, ()> {
    println!("后台日志: 正在加载账号 '{}'...", name);
    sleep(Duration::from_secs(1)).await;
    Ok(format!("账号 \"{}\" 已加载。", name))
}

#[tauri::command]
async fn save_account(name: String) -> Result<String, ()> {
    println!("后台日志: 正在保存账号 '{}'...", name);
    sleep(Duration::from_secs(1)).await;
    Ok(format!("账号 \"{}\" 已保存。", name))
}

#[tauri::command]
async fn daily_mission() -> Result<String, ()> {
    println!("后台日志: 正在执行每日任务...");
    sleep(Duration::from_secs(2)).await;
    Ok("每日任务已完成。".to_string())
}

#[tauri::command]
async fn simulated_universe() -> Result<String, ()> {
    println!("后台日志: 正在执行模拟宇宙...");
    sleep(Duration::from_secs(5)).await;
    Ok("模拟宇宙已完成。".to_string())
}

#[tauri::command]
async fn chudadi() -> Result<String, ()> {
    println!("后台日志: 正在锄大地...");
    sleep(Duration::from_secs(3)).await;
    Ok("锄大地已完成。".to_string())
}

#[tauri::command]
async fn app_data_path() -> Result<String, ()> {
    let data = std::env::var("APPDATA").unwrap_or_default();
    Ok(join_paths(vec![
        data.as_str(),
        "opensource",
        "mflow",
    ]))
}

#[tauri::command]
async fn exists(path: String) -> Result<bool, ()> {
    Ok(Path::new(&path).exists())
}

#[tauri::command]
async fn mkdir(path: String) -> Result<(), ()> {
    std::fs::create_dir_all(path).unwrap();
    Ok(())
}

#[tauri::command]
async fn write_text_file(path: String, content: String) -> Result<(), ()> {
    std::fs::write(path, content).unwrap();
    Ok(())
}

#[tauri::command]
async fn read_text_file(path: String) -> Result<String, ()> {
    let content = std::fs::read_to_string(path).unwrap();
    Ok(content)
}

#[tauri::command]
async fn load_backend_config() -> Result<config::BackendConfig, ()> {
    let config = config::load_config().await.unwrap();
    Ok(config)
}

#[tauri::command]
async fn save_backend_config(config: config::BackendConfig) -> Result<(), ()> {
    config::save_config(config).await.unwrap();
    Ok(())
}

pub(crate) fn join_paths<P: AsRef<Path>>(paths: Vec<P>) -> String {
    match paths.len() {
        0 => String::default(),
        _ => {
            let mut path: PathBuf = PathBuf::new();
            for x in paths {
                path = path.join(x);
            }
            return path.to_str().unwrap().to_string();
        }
    }
}

fn main() {

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            load_account,
            save_account,
            daily_mission,
            simulated_universe,
            chudadi,
            app_data_path,
            exists,
            mkdir,
            write_text_file,
            read_text_file,
            load_backend_config,
            save_backend_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

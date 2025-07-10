// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tokio::time::{sleep, Duration};

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
            chudadi
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

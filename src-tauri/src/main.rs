// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tokio::time::{sleep, Duration};
use std::path::PathBuf;
use std::path::Path;
use winreg::enums::*;
use winreg::RegKey;

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
async fn refresh_stamina() -> Result<String, ()> {
    println!("后台日志: 正在刷体力...");
    sleep(Duration::from_secs(3)).await;
    Ok("刷体力已完成。".to_string())
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

#[tauri::command]
async fn farming() -> Result<(), ()> {
    println!("后台日志: 正在锄大地...");
    sleep(Duration::from_secs(3)).await;
    Ok(())
}

#[tauri::command]
async fn close_game() -> Result<(), ()> {
    println!("后台日志: 正在关闭游戏...");
    sleep(Duration::from_secs(1)).await;
    Ok(())
}

#[tauri::command]
async fn get_account_uid() -> Result<i64, ()> {
    println!("后台日志: 正在读取账号UID...");
    
    // 打开 HKEY_CURRENT_USER
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    
    // 打开崩坏：星穹铁道的注册表项
    let key_path = r"Software\miHoYo\崩坏：星穹铁道";
    let key = match hkcu.open_subkey(key_path) {
        Ok(key) => key,
        Err(e) => {
            println!("打开注册表项失败: {}", e);
            return Err(());
        }
    };
    
    // 读取 App_LastUserID_h2841727341 值
    let value_name = "App_LastUserID_h2841727341";
    match key.get_raw_value(value_name) {
        Ok(raw_value) => {
            println!("读取到原始值: {:?}", raw_value);
            
            // 检查值类型
            match raw_value.vtype {
                REG_DWORD => {
                    // REG_DWORD 是 4 字节的 DWORD
                    if raw_value.bytes.len() == 4 {
                        // 将字节数组转换为 u32 (小端序)
                        let uid_u32 = u32::from_le_bytes([
                            raw_value.bytes[0],
                            raw_value.bytes[1], 
                            raw_value.bytes[2],
                            raw_value.bytes[3]
                        ]);
                        let uid_i64 = uid_u32 as i64;
                        println!("成功读取账号UID: {} (从REG_DWORD)", uid_i64);
                        Ok(uid_i64)
                    } else {
                        println!("REG_DWORD 值长度不正确: {}", raw_value.bytes.len());
                        Err(())
                    }
                }
                REG_QWORD => {
                    // REG_QWORD 是 8 字节的 QWORD
                    if raw_value.bytes.len() == 8 {
                        // 将字节数组转换为 u64 (小端序)
                        let uid_u64 = u64::from_le_bytes([
                            raw_value.bytes[0],
                            raw_value.bytes[1],
                            raw_value.bytes[2],
                            raw_value.bytes[3],
                            raw_value.bytes[4],
                            raw_value.bytes[5],
                            raw_value.bytes[6],
                            raw_value.bytes[7]
                        ]);
                        let uid_i64 = uid_u64 as i64;
                        println!("成功读取账号UID: {} (从REG_QWORD)", uid_i64);
                        Ok(uid_i64)
                    } else {
                        println!("REG_QWORD 值长度不正确: {}", raw_value.bytes.len());
                        Err(())
                    }
                }
                _ => {
                    println!("不支持的注册表值类型: {:?}", raw_value.vtype);
                    Err(())
                }
            }
        }
        Err(e) => {
            println!("读取注册表值失败: {}", e);
            Err(())
        }
    }
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
            refresh_stamina,
            simulated_universe,
            chudadi,
            app_data_path,
            exists,
            mkdir,
            write_text_file,
            read_text_file,
            load_backend_config,
            save_backend_config,
            farming,
            close_game,
            get_account_uid,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

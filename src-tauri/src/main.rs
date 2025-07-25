// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::Engine;
use std::collections::HashMap;
use std::path::Path;
use std::path::PathBuf;
use std::process::Stdio;
use tokio::io::AsyncWriteExt;
use tokio::process::Command;
use winreg::enums::*;
use winreg::RegKey;

mod config;

// if release
// #[cfg(not(debug_assertions))]
mod win;

const VERSION: &str = env!("CARGO_PKG_VERSION");

async fn lastest_release_version() -> Result<Option<String>, String> {
    let repo = option_env!("GITHUB_REPOSITORY");
    tracing::info!("仓库: {:?}", repo);
    if repo.is_none() {
        return Ok(None);
    }
    let repo = repo.unwrap();
    let url = format!("https://api.github.com/repos/{}/releases/latest", repo);
    let client = reqwest::ClientBuilder::new()
        .user_agent("mflow-tauri-app")
        .build()
        .map_err(|e| e.to_string())?;
    let response = client.get(url).send().await.map_err(|e| e.to_string())?;
    let body = response.text().await.map_err(|e| e.to_string())?;
    tracing::trace!("body: {}", body);
    let json: serde_json::Value = serde_json::from_str(&body).map_err(|e| e.to_string())?;
    let tag_name = json["tag_name"].as_str().map(|s| s.to_string());
    tracing::info!("最新版本: {:?}", tag_name);
    Ok(tag_name)
}

#[tauri::command]
async fn get_new_version() -> Option<String> {
    let current_version = VERSION.to_string();
    tracing::info!("当前版本: {}", current_version);
    let lastest_version = lastest_release_version().await;
    let lastest_version = match lastest_version {
        Ok(Some(lastest_version)) => lastest_version,
        Ok(None) => {
            return None;
        }
        Err(e) => {
            tracing::error!("获取最新版本失败: {}", e);
            return None;
        }
    };
    let reg = regex::Regex::new(r"^(\d+)\.(\d+)\.(\d+)$").unwrap();
    if reg.is_match(&lastest_version) && reg.is_match(&current_version) {
        let lastest_version = reg.captures(&lastest_version).unwrap()[0].to_string();
        let current_version = reg.captures(&current_version).unwrap()[0].to_string();
        let current_main_version = current_version
            .split(".")
            .nth(0)
            .unwrap()
            .parse::<i32>()
            .unwrap();
        let current_sub_version = current_version
            .split(".")
            .nth(1)
            .unwrap()
            .parse::<i32>()
            .unwrap();
        let current_third_version = current_version
            .split(".")
            .nth(2)
            .unwrap()
            .parse::<i32>()
            .unwrap();
        let new_main_version = lastest_version
            .split(".")
            .nth(0)
            .unwrap()
            .parse::<i32>()
            .unwrap();
        let new_sub_version = lastest_version
            .split(".")
            .nth(1)
            .unwrap()
            .parse::<i32>()
            .unwrap();
        let new_third_version = lastest_version
            .split(".")
            .nth(2)
            .unwrap()
            .parse::<i32>()
            .unwrap();
        let new_version = format!(
            "{}.{}.{}",
            new_main_version, new_sub_version, new_third_version
        );
        if new_main_version > current_main_version {
            Some(new_version)
        } else if new_sub_version > current_sub_version {
            Some(new_version)
        } else if new_third_version > current_third_version {
            Some(new_version)
        } else {
            None
        }
    } else {
        None
    }
}

#[tauri::command]
async fn get_version() -> Result<String, String> {
    Ok(VERSION.to_string())
}

#[tauri::command]
async fn daily_mission() -> Result<(), String> {
    tracing::info!("后台日志: 正在执行每日任务...");
    run_m7f_command("daily").await
}

#[tauri::command]
async fn refresh_stamina() -> Result<(), String> {
    tracing::info!("后台日志: 正在刷体力...");
    run_m7f_command("power").await
}

#[tauri::command]
async fn simulated_universe() -> Result<(), String> {
    tracing::info!("后台日志: 正在执行模拟宇宙...");
    run_m7f_command("universe").await
}

#[tauri::command]
async fn farming() -> Result<(), String> {
    tracing::info!("后台日志: 正在锄大地...");
    run_m7f_command("fight").await
}

#[tauri::command]
async fn app_data_path() -> Result<String, String> {
    let data = std::env::var("APPDATA").unwrap_or_default();
    Ok(join_paths(vec![data.as_str(), "opensource", "mflow"]))
}

#[tauri::command]
async fn exists(path: String) -> Result<bool, String> {
    Ok(Path::new(&path).exists())
}

#[tauri::command]
async fn mkdir(path: String) -> Result<(), String> {
    std::fs::create_dir_all(path).unwrap();
    Ok(())
}

#[tauri::command]
async fn write_text_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(path, content).unwrap();
    Ok(())
}

#[tauri::command]
async fn read_text_file(path: String) -> Result<String, String> {
    let content = std::fs::read_to_string(path).unwrap();
    Ok(content)
}

#[tauri::command]
async fn load_backend_config() -> Result<config::BackendConfig, String> {
    let config = config::load_config().await.unwrap();
    Ok(config)
}

#[tauri::command]
async fn save_backend_config(config: config::BackendConfig) -> Result<(), String> {
    config::save_config(config).await.unwrap();
    Ok(())
}

async fn run_m7f_command(command: &str) -> Result<(), String> {
    let config = config::load_config().await?;
    let work_dir = config.m7_path;
    let bin = "March7th Assistant.exe";
    tracing::info!("后台日志: 正在运行命令... {} {} {}", work_dir, bin, command);
    let mut cmd = tokio::process::Command::new("cmd");
    cmd.arg("/c");
    cmd.arg(bin);
    cmd.arg(command);
    cmd.current_dir(work_dir);
    cmd.kill_on_drop(true);
    cmd.stdin(Stdio::piped());
    let mut child = cmd.spawn().map_err(|e| format!("运行命令失败: {}", e))?;
    let mut std_in = child.stdin.take().expect("获取标准输入失败");
    // u8 \n 1024
    let buf = vec![b'\n'; 1024];
    let _result = std_in.write_all(&buf).await;
    child
        .wait()
        .await
        .map_err(|e| format!("等待命令执行失败: {}", e))?;
    Ok(())
}

#[tauri::command]
async fn run_m7_launcher() -> Result<(), String> {
    let config = config::load_config().await?;
    let work_dir = config.m7_path;
    let bin_name = "March7th Launcher.exe";
    let mut cmd = tokio::process::Command::new("cmd");
    cmd.arg("/c");
    cmd.arg(bin_name);
    cmd.current_dir(work_dir);
    let _ = cmd.spawn().map_err(|e| format!("运行命令失败: {}", e))?;
    Ok(())
}

#[tauri::command]
async fn run_better_gi_gui() -> Result<(), String> {
    let config = config::load_config().await?;
    let work_dir = config.better_gi_path;
    let bin_name = "BetterGI.exe";
    let mut cmd = tokio::process::Command::new("cmd");
    cmd.arg("/c");
    cmd.arg(bin_name);
    cmd.current_dir(work_dir);
    let _ = cmd.spawn().map_err(|e| format!("运行命令失败: {}", e))?;
    Ok(())
}

#[tauri::command]
async fn run_zzzod_gui() -> Result<(), String> {
    let config = config::load_config().await?;
    let work_dir = config.zzzod_path;
    if win::where_wt_exe() {
        let mut cmd = tokio::process::Command::new("wt");
        cmd.arg("cmd");
        cmd.arg("/c");
        cmd.arg(format!("{}\\{}", work_dir, "app.bat"));
        cmd.current_dir(work_dir);
        let _ = cmd.spawn().map_err(|e| format!("运行命令失败: {}", e))?;
    } else {
        let mut cmd = tokio::process::Command::new("cmd");
        cmd.arg("/c");
        cmd.arg("app.bat");
        cmd.current_dir(work_dir);
        let _ = cmd.spawn().map_err(|e| format!("运行命令失败: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
async fn close_game() -> Result<(), String> {
    taskkill("StarRail.exe").await
}

async fn taskkill(exe_name: &str) -> Result<(), String> {
    tracing::info!("后台日志: 正在关闭游戏... {}", exe_name);
    let mut cmd = tokio::process::Command::new("taskkill");
    cmd.arg("/f").arg("/im").arg(exe_name);
    let _output = cmd
        .output()
        .await
        .map_err(|e| format!("关闭任务失败: {}", e))?;
    Ok(())
}

#[tauri::command]
async fn get_account_uid() -> Result<i64, String> {
    tracing::info!("后台日志: 正在读取账号UID...");

    // 打开 HKEY_CURRENT_USER
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);

    // 打开崩坏：星穹铁道的注册表项
    let key_path = r"Software\miHoYo\崩坏：星穹铁道";
    let key = match hkcu.open_subkey(key_path) {
        Ok(key) => key,
        Err(e) => {
            tracing::info!("打开注册表项失败: {}", e);
            return Err("打开注册表项失败".to_string());
        }
    };

    // 读取 App_LastUserID_h2841727341 值
    let value_name = "App_LastUserID_h2841727341";
    match key.get_raw_value(value_name) {
        Ok(raw_value) => {
            tracing::info!("读取到原始值: {:?}", raw_value);

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
                            raw_value.bytes[3],
                        ]);
                        let uid_i64 = uid_u32 as i64;
                        tracing::info!("成功读取账号UID: {} (从REG_DWORD)", uid_i64);
                        Ok(uid_i64)
                    } else {
                        tracing::info!("REG_DWORD 值长度不正确: {}", raw_value.bytes.len());
                        Err("REG_DWORD 值长度不正确".to_string())
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
                            raw_value.bytes[7],
                        ]);
                        let uid_i64 = uid_u64 as i64;
                        tracing::info!("成功读取账号UID: {} (从REG_QWORD)", uid_i64);
                        Ok(uid_i64)
                    } else {
                        tracing::info!("REG_QWORD 值长度不正确: {}", raw_value.bytes.len());
                        Err("REG_QWORD 值长度不正确".to_string())
                    }
                }
                _ => {
                    tracing::info!("不支持的注册表值类型: {:?}", raw_value.vtype);
                    Err("不支持的注册表值类型".to_string())
                }
            }
        }
        Err(e) => {
            tracing::info!("读取注册表值失败: {}", e);
            Err("读取注册表值失败".to_string())
        }
    }
}

#[tauri::command]
async fn list_accounts() -> Result<Vec<String>, String> {
    let config = config::load_config().await?;
    let m7_path = config.m7_path;
    let account_folder = format!("{}/m7f_accounts", m7_path);
    let mut accounts = Vec::new();
    let mut rd = tokio::fs::read_dir(account_folder)
        .await
        .map_err(|e| e.to_string())?;
    while let Some(entry) = rd.next_entry().await.map_err(|e| e.to_string())? {
        let path = entry.path();
        if path.is_dir() {
            accounts.push(path.file_name().unwrap().to_str().unwrap().to_string());
        }
    }
    Ok(accounts)
}

#[tauri::command]
async fn load_account(name: String) -> Result<(), String> {
    tracing::info!("后台日志: 正在加载账号 '{}'...", name);
    let config = config::load_config().await?;

    let m7_path = config.m7_path;
    let src_config_path = format!("{}/config.yaml", m7_path);

    let account_folder = format!("{}/m7f_accounts/{}", m7_path, name);
    let config_path = format!("{}/config.yaml", account_folder);
    let reg_path = format!("{}/account.reg", account_folder);

    tokio::fs::copy(config_path, src_config_path)
        .await
        .map_err(|e| {
            tracing::info!("复制配置文件失败: {:?}", e);
            "复制配置文件失败".to_string()
        })?;
    import_reg(reg_path.as_str()).await?;
    Ok(())
}

#[tauri::command]
async fn save_account(name: String) -> Result<(), String> {
    tracing::info!("后台日志: 正在保存账号 '{}'...", name);
    export_account_a(name, "".to_owned(), "".to_owned()).await
}

#[tauri::command]
async fn export_account(
    account_name: String,
    username: String,
    password: String,
) -> Result<(), String> {
    export_account_a(account_name, username, password).await
}

async fn export_account_a(
    account_name: String,
    username: String,
    password: String,
) -> Result<(), String> {
    let uid = get_account_uid()
        .await
        .map_err(|_| "获取账号UID失败".to_string())?;
    let config = config::load_config().await?;
    let m7_path = config.m7_path;
    let account_folder = format!("{}/m7f_accounts/{}", m7_path, account_name);
    tokio::fs::create_dir_all(&account_folder)
        .await
        .map_err(|_| "创建账号文件夹失败".to_string())?;
    let reg_path = format!("{}/account.reg", account_folder);
    export_reg(
        "HKEY_CURRENT_USER\\SOFTWARE\\miHoYo\\崩坏：星穹铁道",
        reg_path.as_str(),
    )
    .await
    .map_err(|_| "导出注册表失败".to_string())?;
    let src_config_path = format!("{}/config.yaml", m7_path);
    let config_path = format!("{}/config.yaml", account_folder);
    tokio::fs::copy(src_config_path, config_path)
        .await
        .map_err(|_| "复制配置文件失败".to_string())?;
    if username.len() > 0 && password.len() > 0 {
        let data_dir = format!("{}/settings/accounts", m7_path);
        let data_reg_path = format!("{}/{}.reg", data_dir, uid);
        tokio::fs::copy(reg_path, data_reg_path)
            .await
            .map_err(|_| "复制账号注册表失败".to_string())?;
        let password_base64 = xor_encrypt_to_base64(format!("{username},{password}"));
        let data_password_path = format!("{}/{}.acc", data_dir, uid);
        tokio::fs::write(data_password_path, password_base64)
            .await
            .map_err(|_| "写入账号密码失败".to_string())?;
        let name_path = format!("{}/{}.name", data_dir, uid);
        tokio::fs::write(name_path, account_name)
            .await
            .map_err(|_| "写入账号名称失败".to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn export_gi_account(account_name: String) -> Result<(), String> {
    let config = config::load_config().await?;
    let better_gi_path = config.better_gi_path;
    let account_folder = format!("{}/m7f_accounts/{}", better_gi_path, account_name);
    tokio::fs::create_dir_all(&account_folder)
        .await
        .map_err(|_| "创建账号文件夹失败".to_string())?;
    let reg_path = format!("{}/account.reg", account_folder);
    export_reg(
        "HKEY_CURRENT_USER\\SOFTWARE\\miHoYo\\原神",
        reg_path.as_str(),
    )
    .await
    .map_err(|_| "导出注册表失败".to_string())?;
    let src_config_path = format!("{}/User", better_gi_path);
    let config_path = format!("{}/User.zip", account_folder);
    zip_dir(&src_config_path, &config_path)
        .await
        .map_err(|_| "复制配置文件失败".to_string())?;
    Ok(())
}

#[tauri::command]
async fn import_gi_account(account_name: String) -> Result<(), String> {
    let config = config::load_config().await?;
    let better_gi_path = config.better_gi_path;
    let account_folder = format!("{}/m7f_accounts/{}", better_gi_path, account_name);
    let config_path = format!("{}/User.zip", account_folder);
    unzip_file(config_path.as_str(), better_gi_path.as_str())
        .await
        .map_err(|_| "解压文件失败".to_string())?;
    let reg_path = format!("{}/account.reg", account_folder);
    import_reg(reg_path.as_str()).await?;
    Ok(())
}

async fn zip_dir(src_path: &str, dest_path: &str) -> Result<(), String> {
    let mut cmd = tokio::process::Command::new("powershell");
    cmd.arg("Compress-Archive")
        .arg("-Path")
        .arg(src_path)
        .arg("-DestinationPath")
        .arg(dest_path)
        .arg("-Force");
    let output = cmd
        .output()
        .await
        .map_err(|e| format!("压缩文件夹失败: {}", e))?;
    tracing::info!("{}", String::from_utf8_lossy(&output.stdout));
    tracing::info!("{}", String::from_utf8_lossy(&output.stderr));
    if output.status.success() {
        Ok(())
    } else {
        Err("压缩文件夹失败".to_string())
    }
}

async fn unzip_file(zip_path: &str, dest_path: &str) -> Result<(), String> {
    let mut cmd = tokio::process::Command::new("powershell");
    cmd.arg("Expand-Archive")
        .arg("-Path")
        .arg(zip_path)
        .arg("-DestinationPath")
        .arg(dest_path)
        .arg("-Force");
    let output = cmd
        .output()
        .await
        .map_err(|e| format!("解压文件失败: {}", e))?;
    tracing::info!("{}", String::from_utf8_lossy(&output.stdout));
    tracing::info!("{}", String::from_utf8_lossy(&output.stderr));
    if output.status.success() {
        Ok(())
    } else {
        Err("解压文件失败".to_string())
    }
}

fn xor_encrypt_to_base64(plaintext: String) -> String {
    let xor_key = "TI4ftRSDaP63kBxxoLoZ5KpVmRBz00JikzLNweryzZ4wecWJxJO9tbxlH9YDvjAr";
    let xor_key_bytes = xor_key.as_bytes();
    let plaintext_bytes = plaintext.as_bytes();
    let mut encrypted_bytes = Vec::new();
    for i in 0..plaintext_bytes.len() {
        let byte_plaintext = plaintext_bytes[i];
        let byte_key = xor_key_bytes[i % xor_key_bytes.len()];
        let encrypted_byte = byte_plaintext ^ byte_key;
        encrypted_bytes.push(encrypted_byte);
    }
    base64::prelude::BASE64_STANDARD.encode(encrypted_bytes)
}

/*
def xor_encrypt_to_base64(plaintext: str) -> str:
    secret_key = "TI4ftRSDaP63kBxxoLoZ5KpVmRBz00JikzLNweryzZ4wecWJxJO9tbxlH9YDvjAr"
    plaintext_bytes = plaintext.encode('utf-8')
    key_bytes = secret_key.encode('utf-8')

    encrypted_bytes = bytearray()
    for i in range(len(plaintext_bytes)):
        byte_plaintext = plaintext_bytes[i]
        byte_key = key_bytes[i % len(key_bytes)]
        encrypted_byte = byte_plaintext ^ byte_key
        encrypted_bytes.append(encrypted_byte)

    base64_encoded = base64.b64encode(encrypted_bytes).decode('utf-8')
    return base64_encoded
*/

async fn export_reg(vp: &str, reg_path: &str) -> Result<(), String> {
    // "REG", "EXPORT", "HKEY_CURRENT_USER\\SOFTWARE\\miHoYo\\崩坏：星穹铁道", path, "/y
    let mut cmd = tokio::process::Command::new("REG");
    cmd.arg("EXPORT").arg(vp).arg(reg_path).arg("/y");
    let output = cmd
        .output()
        .await
        .map_err(|e| format!("导出注册表失败: {}", e))?;
    tracing::info!("{}", String::from_utf8_lossy(&output.stdout));
    tracing::info!("{}", String::from_utf8_lossy(&output.stderr));
    if output.status.success() {
        Ok(())
    } else {
        Err("导出注册表失败".to_string())
    }
}

async fn import_reg(reg_path: &str) -> Result<(), String> {
    // "REG", "IMPORT", path
    let mut cmd = tokio::process::Command::new("REG");
    cmd.arg("IMPORT").arg(reg_path);
    let output = cmd
        .output()
        .await
        .map_err(|e| format!("导入注册表失败: {}", e))?;
    tracing::info!("{}", String::from_utf8_lossy(&output.stdout));
    tracing::info!("{}", String::from_utf8_lossy(&output.stderr));
    if output.status.success() {
        Ok(())
    } else {
        Err("导入注册表失败".to_string())
    }
}

#[tauri::command]
async fn clear_game_reg() -> Result<(), String> {
    // reg delete "HKEY_CURRENT_USER\SOFTWARE\miHoYo\崩坏：星穹铁道" /f
    let mut cmd = tokio::process::Command::new("reg");
    cmd.arg("delete")
        .arg("HKEY_CURRENT_USER\\SOFTWARE\\miHoYo\\崩坏：星穹铁道")
        .arg("/f");
    let output = cmd
        .output()
        .await
        .map_err(|e| format!("清除游戏注册表失败: {}", e))?;
    if output.status.success() {
        Ok(())
    } else {
        let stderr = decode_gbk(output.stderr).map_err(|e| e.to_string())?;
        Err(format!("清除游戏注册表失败: {}", stderr))
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

fn decode_gbk(bytes: Vec<u8>) -> Result<String, String> {
    let (cow, _, had_errors) = encoding_rs::GBK.decode(&bytes);
    if had_errors {
        Err("Failed to decode GBK".to_string())
    } else {
        Ok(cow.into_owned())
    }
}

#[tauri::command]
async fn run_better_gi() -> Result<(), String> {
    let config = config::load_config().await?;
    let better_gi_path = config.better_gi_path;
    if better_gi_path.is_empty() {
        return Err("BetterGI路径为空".to_string());
    }
    let mut cmd = tokio::process::Command::new(better_gi_path + "\\BetterGI.exe");
    cmd.arg("startOneDragon");
    cmd.spawn()
        .map_err(|e| format!("启动BetterGI失败: {}", e))?;
    tracing::info!("启动BetterGI成功");
    let start_time = std::time::Instant::now();
    while start_time.elapsed() < std::time::Duration::from_secs(60 * 60) {
        tokio::time::sleep(std::time::Duration::from_secs(100)).await;
        let task_exists = task_exists("BetterGI.exe").await;
        match task_exists {
            Ok(true) => {
                tracing::info!("BetterGI仍在运行");
                continue;
            }
            Ok(false) => {
                tracing::info!("BetterGI已停止");
                break;
            }
            Err(e) => {
                tracing::error!("检查BetterGI状态失败: {}", e);
                break;
            }
        }
    }
    taskkill("BetterGI.exe").await?;
    taskkill("YuanShen.exe").await?;
    Ok(())
}

#[tauri::command]
async fn run_better_gi_by_config(config_name: String) -> Result<(), String> {
    let config = config::load_config().await?;
    let better_gi_path = config.better_gi_path;
    if better_gi_path.is_empty() {
        return Err("BetterGI路径为空".to_string());
    }
    let mut cmd = tokio::process::Command::new(better_gi_path + "\\BetterGI.exe");
    cmd.arg("startOneDragon");
    cmd.arg(config_name.as_str());
    cmd.spawn()
        .map_err(|e| format!("启动BetterGI失败: {}", e))?;
    tracing::info!("启动BetterGI成功，使用配置文件: {}", config_name);
    let start_time = std::time::Instant::now();
    while start_time.elapsed() < std::time::Duration::from_secs(60 * 60) {
        tokio::time::sleep(std::time::Duration::from_secs(100)).await;
        let task_exists = task_exists("BetterGI.exe").await;
        match task_exists {
            Ok(true) => {
                tracing::info!("BetterGI仍在运行");
                continue;
            }
            Ok(false) => {
                tracing::info!("BetterGI已停止");
                break;
            }
            Err(e) => {
                tracing::error!("检查BetterGI状态失败: {}", e);
                break;
            }
        }
    }
    taskkill("BetterGI.exe").await?;
    taskkill("YuanShen.exe").await?;
    Ok(())
}

#[tauri::command]
async fn run_zzzod() -> Result<(), String> {
    let config = config::load_config().await?;
    let work_dir = config.zzzod_path;

    let env_dir = work_dir.clone() + "\\.install";
    let python_path = work_dir.clone() + "\\src";
    let py_exe = work_dir.clone() + "\\.venv\\scripts\\python.exe";
    let py_app = work_dir.clone() + "\\src\\zzz_od\\application\\zzz_one_dragon_app.py";

    let envs = HashMap::from([("PYTHONPATH", python_path), ("ENV_DIR", env_dir)]);

    let your_command = format!("{} {} -o -c", py_exe, py_app);

    let mut _child = Command::new("cmd")
    .arg("/C")
    .arg(your_command)
    .envs(&envs)
    .kill_on_drop(true)
    .spawn()
    .map_err(|e| format!("启动绝区零一条龙失败: {}", e))?;

    // cmd.stdin(Stdio::inherit());
    // cmd.stdout(Stdio::inherit());
    // cmd.stderr(Stdio::inherit());
    // cmd.kill_on_drop(true);
    // cmd.spawn().map_err(|e| format!("启动绝区零一条龙失败: {}", e))?;
    tracing::info!("启动绝区零一条龙成功");
    let start_time = std::time::Instant::now();
    while start_time.elapsed() < std::time::Duration::from_secs(30 * 60) {
        tokio::time::sleep(std::time::Duration::from_secs(100)).await;
        let task_exists: Result<bool, String> = task_exists("ZenlessZoneZero.exe").await;
        match task_exists {
            Ok(true) => {
                tracing::info!("绝区零一条龙仍在运行");
                continue;
            }
            Ok(false) => {
                tracing::info!("绝区零一条龙已停止");
                break;
            }
            Err(e) => {
                tracing::error!("检查绝区零一条龙状态失败: {}", e);
                break;
            }
        }
    }
    taskkill("ZenlessZoneZero.exe").await?;
    let _ = _child.kill().await;
    Ok(())
}

async fn task_exists(exe_name: &str) -> Result<bool, String> {
    let mut cmd = tokio::process::Command::new("tasklist");
    cmd.arg("/fi").arg(format!("imagename eq {}", exe_name));
    let output = cmd
        .output()
        .await
        .map_err(|e| format!("检查任务状态失败: {}", e))?;
    let std = decode_gbk(output.stdout).unwrap();
    Ok(std
        .to_ascii_lowercase()
        .contains(exe_name.to_ascii_lowercase().as_str()))
}

#[tauri::command]
async fn close_gi() -> Result<(), String> {
    taskkill("YuanShen.exe").await
}

#[tauri::command]
async fn clear_gi_reg() -> Result<(), String> {
    let mut cmd = tokio::process::Command::new("reg");
    cmd.arg("delete")
        .arg("HKEY_CURRENT_USER\\SOFTWARE\\miHoYo\\原神")
        .arg("/f");
    let output = cmd
        .output()
        .await
        .map_err(|e| format!("清除原神注册表失败: {}", e))?;
    if output.status.success() {
        Ok(())
    } else {
        let stderr = decode_gbk(output.stderr).map_err(|e| e.to_string())?;
        Err(format!("清除原神注册表失败: {}", stderr))
    }
}

#[tauri::command]
async fn list_gi_accounts() -> Result<Vec<String>, String> {
    let config = config::load_config().await?;
    let better_gi_path = config.better_gi_path;
    let account_folder = format!("{}/m7f_accounts", better_gi_path);
    let mut accounts = Vec::new();
    let mut rd = tokio::fs::read_dir(account_folder)
        .await
        .map_err(|e| e.to_string())?;
    while let Some(entry) = rd.next_entry().await.map_err(|e| e.to_string())? {
        let path = entry.path();
        if path.is_dir() {
            accounts.push(path.file_name().unwrap().to_str().unwrap().to_string());
        }
    }
    Ok(accounts)
}

#[tauri::command]
async fn open_release_page() -> Result<(), String> {
    let repo = option_env!("GITHUB_REPOSITORY");
    if repo.is_none() {
        return Err("仓库为空".to_string());
    }
    let url = format!("https://github.com/{}/releases", repo.unwrap());
    opener::open(url.as_str()).map_err(|e| format!("打开浏览器失败: {}", e))?;
    Ok(())
}

#[tauri::command]
async fn run_better_gi_scheduler(groups: String) -> Result<(), String> {
    let config = config::load_config().await?;
    let better_gi_path = config.better_gi_path;
    if better_gi_path.is_empty() {
        return Err("BetterGI路径为空".to_string());
    }
    let mut cmd = tokio::process::Command::new(better_gi_path.clone() + "\\BetterGI.exe");
    cmd.arg("--startGroups");
    for group in groups.split_whitespace() {
        cmd.arg(group);
    }
    cmd.spawn()
        .map_err(|e| format!("启动BetterGI调度器失败: {}", e))?;
    tracing::info!("启动BetterGI调度器成功，任务组: {}", groups);
    let start_time = std::time::Instant::now();
    while start_time.elapsed() < std::time::Duration::from_secs(60 * 60 * 5) {
        tokio::time::sleep(std::time::Duration::from_secs(100)).await;
        let task_exists = task_exists("BetterGI.exe").await;
        match task_exists {
            Ok(true) => {
                tracing::info!("BetterGI仍在运行");
                continue;
            }
            Ok(false) => {
                tracing::info!("BetterGI已停止");
                break;
            }
            Err(e) => {
                tracing::error!("检查BetterGI状态失败: {}", e);
                break;
            }
        }
    }
    taskkill("BetterGI.exe").await?;
    taskkill("YuanShen.exe").await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_task_exists() {
        let result = task_exists("BetterGI.exe").await;
        println!("{:?}", result);
    }

    #[tokio::test]
    async fn test_zip_dir() {
        let result = zip_dir(
            "D:\\Repositories\\BetterGI\\User",
            "D:\\Repositories\\BetterGI\\1\\User.zip",
        )
        .await;
        println!("{:?}", result);
    }

    #[tokio::test]
    async fn test_unzip_file() {
        let result = unzip_file(
            "D:\\Repositories\\BetterGI\\1\\User.zip",
            "D:\\Repositories\\BetterGI",
        )
        .await;
        println!("{:?}", result);
    }
}

fn main() {
    #[cfg(not(debug_assertions))]
    {
        if !win::is_elevated() {
            win::run_as_admin();
            return;
        }
    }

    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_test_writer()
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_version,
            get_new_version,
            load_account,
            save_account,
            daily_mission,
            refresh_stamina,
            simulated_universe,
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
            export_account,
            clear_game_reg,
            run_better_gi,
            close_gi,
            export_gi_account,
            import_gi_account,
            clear_gi_reg,
            list_accounts,
            list_gi_accounts,
            open_release_page,
            run_m7_launcher,
            run_better_gi_gui,
            run_zzzod,
            run_zzzod_gui,
            run_better_gi_by_config,
            run_better_gi_scheduler,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

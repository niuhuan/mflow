// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::Engine;
use std::path::Path;
use std::path::PathBuf;
use std::process::Stdio;
use tokio::io::AsyncWriteExt;
use winreg::enums::*;
use winreg::RegKey;

mod config;

// if release
#[cfg(not(debug_assertions))]
mod win;

#[tauri::command]
async fn daily_mission() -> Result<(), ()> {
    tracing::info!("后台日志: 正在执行每日任务...");
    run_m7f_command("daily").await
}

#[tauri::command]
async fn refresh_stamina() -> Result<(), ()> {
    tracing::info!("后台日志: 正在刷体力...");
    run_m7f_command("power").await
}

#[tauri::command]
async fn simulated_universe() -> Result<(), ()> {
    tracing::info!("后台日志: 正在执行模拟宇宙...");
    run_m7f_command("universe").await
}

#[tauri::command]
async fn farming() -> Result<(), ()> {
    tracing::info!("后台日志: 正在锄大地...");
    run_m7f_command("fight").await
}

#[tauri::command]
async fn app_data_path() -> Result<String, ()> {
    let data = std::env::var("APPDATA").unwrap_or_default();
    Ok(join_paths(vec![data.as_str(), "opensource", "mflow"]))
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

async fn run_m7f_command(command: &str) -> Result<(), ()> {
    let config = config::load_config().await?;
    let work_dir = config.m7_source_path;
    let python_cmd = if config.python_path.is_empty() {
        "python.exe"
    } else {
        config.python_path.as_str()
    };
    let python_script = "main.py";
    let mut cmd = tokio::process::Command::new(python_cmd);
    cmd.arg(python_script);
    cmd.arg(command);
    cmd.current_dir(work_dir);
    cmd.stdin(Stdio::piped());
    let mut child = cmd.spawn().unwrap();
    let mut std_in = child.stdin.take().unwrap();
    // u8 \n 1024
    let buf = vec![b'\n'; 1024];
    let _result = std_in.write_all(&buf).await;
    child.wait().await.unwrap();
    Ok(())
}

#[tauri::command]
async fn close_game() -> Result<(), ()> {
    tracing::info!("后台日志: 正在关闭游戏...");
    // "cmd", "/c", "TASKKILL", "/f", "/im", "StarRail.exe"
    let mut cmd = tokio::process::Command::new("cmd");
    cmd.arg("/c").arg("TASKKILL").arg("/f").arg("/im").arg("StarRail.exe");
    let output = cmd.output().await.map_err(|_| ())?;
    tracing::info!("{}", String::from_utf8_lossy(&output.stdout));
    tracing::info!("{}", String::from_utf8_lossy(&output.stderr));
    Ok(())
}

#[tauri::command]
async fn get_account_uid() -> Result<i64, ()> {
    tracing::info!("后台日志: 正在读取账号UID...");

    // 打开 HKEY_CURRENT_USER
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);

    // 打开崩坏：星穹铁道的注册表项
    let key_path = r"Software\miHoYo\崩坏：星穹铁道";
    let key = match hkcu.open_subkey(key_path) {
        Ok(key) => key,
        Err(e) => {
            tracing::info!("打开注册表项失败: {}", e);
            return Err(());
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
                            raw_value.bytes[7],
                        ]);
                        let uid_i64 = uid_u64 as i64;
                        tracing::info!("成功读取账号UID: {} (从REG_QWORD)", uid_i64);
                        Ok(uid_i64)
                    } else {
                        tracing::info!("REG_QWORD 值长度不正确: {}", raw_value.bytes.len());
                        Err(())
                    }
                }
                _ => {
                    tracing::info!("不支持的注册表值类型: {:?}", raw_value.vtype);
                    Err(())
                }
            }
        }
        Err(e) => {
            tracing::info!("读取注册表值失败: {}", e);
            Err(())
        }
    }
}

#[tauri::command]
async fn load_account(name: String) -> Result<(), ()> {
    tracing::info!("后台日志: 正在加载账号 '{}'...", name);
    let config = config::load_config().await?;

    let m7_source_path = config.m7_source_path;
    let src_config_path = format!("{}/config.yaml", m7_source_path);

    let account_folder = format!("{}/m7f_accounts/{}", m7_source_path, name);
    let config_path = format!("{}/config.yaml", account_folder);
    let reg_path = format!("{}/account.reg", account_folder);

    tokio::fs::copy(config_path, src_config_path)
        .await
        .map_err(|e| {
            tracing::info!("复制配置文件失败: {:?}", e);
            ()
        })?;
    import_reg(reg_path.as_str()).await?;
    Ok(())
}

#[tauri::command]
async fn save_account(name: String) -> Result<(), ()> {
    tracing::info!("后台日志: 正在保存账号 '{}'...", name);
    export_account_a(name, "".to_owned(), "".to_owned()).await
}

#[tauri::command]
async fn export_account(
    account_name: String,
    username: String,
    password: String,
) -> Result<(), ()> {
    export_account_a(account_name, username, password).await
}

async fn export_account_a(
    account_name: String,
    username: String,
    password: String,
) -> Result<(), ()> {
    let uid = get_account_uid().await?;
    let config = config::load_config().await?;
    let m7_source_path = config.m7_source_path;
    let account_folder = format!("{}/m7f_accounts/{}", m7_source_path, account_name);
    tokio::fs::create_dir_all(&account_folder)
        .await
        .map_err(|_| ())?;
    let reg_path = format!("{}/account.reg", account_folder);
    export_reg(reg_path.as_str()).await?;
    let src_config_path = format!("{}/config.yaml", m7_source_path);
    let config_path = format!("{}/config.yaml", account_folder);
    tokio::fs::copy(src_config_path, config_path)
        .await
        .map_err(|_| ())?;
    if username.len() > 0 && password.len() > 0 {
        let data_dir = format!("{}/settings/accounts", m7_source_path);
        let data_reg_path = format!("{}/{}.reg", data_dir, uid);
        tokio::fs::copy(reg_path, data_reg_path)
            .await
            .map_err(|_| ())?;
        let password_base64 = xor_encrypt_to_base64(format!("{username},{password}"));
        let data_password_path = format!("{}/{}.acc", data_dir, uid);
        tokio::fs::write(data_password_path, password_base64)
            .await
            .map_err(|_| ())?;
        let name_path = format!("{}/{}.name", data_dir, uid);
        tokio::fs::write(name_path, account_name)
            .await
            .map_err(|_| ())?;
    }
    Ok(())
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

async fn export_reg(reg_path: &str) -> Result<(), ()> {
    // "REG", "EXPORT", "HKEY_CURRENT_USER\\SOFTWARE\\miHoYo\\崩坏：星穹铁道", path, "/y
    let mut cmd = tokio::process::Command::new("REG");
    cmd.arg("EXPORT")
        .arg(format!(
            "HKEY_CURRENT_USER\\SOFTWARE\\miHoYo\\崩坏：星穹铁道"
        ))
        .arg(reg_path)
        .arg("/y");
    let output = cmd.output().await.map_err(|_| ())?;
    tracing::info!("{}", String::from_utf8_lossy(&output.stdout));
    tracing::info!("{}", String::from_utf8_lossy(&output.stderr));
    if output.status.success() {
        Ok(())
    } else {
        Err(())
    }
}

async fn import_reg(reg_path: &str) -> Result<(), ()> {
    // "REG", "IMPORT", path
    let mut cmd = tokio::process::Command::new("REG");
    cmd.arg("IMPORT").arg(reg_path);
    let output = cmd.output().await.map_err(|_| ())?;
    tracing::info!("{}", String::from_utf8_lossy(&output.stdout));
    tracing::info!("{}", String::from_utf8_lossy(&output.stderr));
    if output.status.success() {
        Ok(())
    } else {
        Err(())
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

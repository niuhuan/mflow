use serde_derive::{Deserialize, Serialize};
use crate::join_paths;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BackendConfig {
    #[serde(default)]
    pub m7_path: String,
    #[serde(default)]
    pub better_gi_path: String,
    #[serde(default)]
    pub zzzod_path: String,
    #[serde(default)]
    pub genshin_auto_login_path: String,
    #[serde(default)]
    pub ok_ww_path: String,

    // 各任务超时时间（单位：分钟），超时后强制结束任务
    #[serde(default = "default_full_run_timeout_minutes")]
    pub full_run_timeout_minutes: u64,
    #[serde(default = "default_daily_mission_timeout_minutes")]
    pub daily_mission_timeout_minutes: u64,
    #[serde(default = "default_refresh_stamina_timeout_minutes")]
    pub refresh_stamina_timeout_minutes: u64,
    #[serde(default = "default_simulated_universe_timeout_minutes")]
    pub simulated_universe_timeout_minutes: u64,
    #[serde(default = "default_farming_timeout_minutes")]
    pub farming_timeout_minutes: u64,
    #[serde(default = "default_better_gi_timeout_minutes")]
    pub better_gi_timeout_minutes: u64,
    #[serde(default = "default_better_gi_scheduler_timeout_minutes")]
    pub better_gi_scheduler_timeout_minutes: u64,
    #[serde(default = "default_zzzod_timeout_minutes")]
    pub zzzod_timeout_minutes: u64,
    #[serde(default = "default_ok_ww_timeout_minutes")]
    pub ok_ww_timeout_minutes: u64,
}

fn default_full_run_timeout_minutes() -> u64 { 60 }
fn default_daily_mission_timeout_minutes() -> u64 { 60 }
fn default_refresh_stamina_timeout_minutes() -> u64 { 60 }
fn default_simulated_universe_timeout_minutes() -> u64 { 120 }
fn default_farming_timeout_minutes() -> u64 { 360 }
fn default_better_gi_timeout_minutes() -> u64 { 60 }
fn default_better_gi_scheduler_timeout_minutes() -> u64 { 300 }
fn default_zzzod_timeout_minutes() -> u64 { 60 }
fn default_ok_ww_timeout_minutes() -> u64 { 60 }

impl Default for BackendConfig {
    fn default() -> Self {
        BackendConfig {
            m7_path: String::new(),
            better_gi_path: String::new(),
            zzzod_path: String::new(),
            genshin_auto_login_path: String::new(),
            ok_ww_path: String::new(),
            full_run_timeout_minutes: default_full_run_timeout_minutes(),
            daily_mission_timeout_minutes: default_daily_mission_timeout_minutes(),
            refresh_stamina_timeout_minutes: default_refresh_stamina_timeout_minutes(),
            simulated_universe_timeout_minutes: default_simulated_universe_timeout_minutes(),
            farming_timeout_minutes: default_farming_timeout_minutes(),
            better_gi_timeout_minutes: default_better_gi_timeout_minutes(),
            better_gi_scheduler_timeout_minutes: default_better_gi_scheduler_timeout_minutes(),
            zzzod_timeout_minutes: default_zzzod_timeout_minutes(),
            ok_ww_timeout_minutes: default_ok_ww_timeout_minutes(),
        }
    }
}

pub async fn load_config() -> Result<BackendConfig, String> {
    let app_dir = crate::app_data_path().await.unwrap();
    let config_file = join_paths(vec![app_dir.as_str(), "backend_config.json"]);
    let config = if crate::exists(config_file.clone()).await.unwrap() {
        let config_str = std::fs::read_to_string(config_file).map_err(|e| e.to_string())?;
        serde_json::from_str(&config_str).map_err(|e| e.to_string())?
    } else {
        BackendConfig::default()
    };
    Ok(config)
}

pub async fn save_config(config: BackendConfig) -> Result<(), String> {
    let app_dir = crate::app_data_path().await.unwrap();
    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    let config_file = join_paths(vec![app_dir.as_str(), "backend_config.json"]);
    std::fs::write(config_file, serde_json::to_string(&config).map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
    Ok(())
}


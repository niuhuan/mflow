use serde_derive::{Deserialize, Serialize};
use crate::join_paths;

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct BackendConfig {
    pub m7_source_path: String,
    pub python_path: String,
}

pub async fn load_config() -> Result<BackendConfig, ()> {
    let app_dir = crate::app_data_path().await.unwrap();
    let config_file = join_paths(vec![app_dir.as_str(), "backend_config.json"]);
    let config = if crate::exists(config_file.clone()).await.unwrap() {
        let config_str = std::fs::read_to_string(config_file).unwrap();
        serde_json::from_str(&config_str).unwrap()
    } else {
        BackendConfig::default()
    };
    Ok(config)
}

pub async fn save_config(config: BackendConfig) -> Result<(), ()> {
    let app_dir = crate::app_data_path().await.unwrap();
    std::fs::create_dir_all(&app_dir).unwrap();
    let config_file = join_paths(vec![app_dir.as_str(), "backend_config.json"]);
    std::fs::write(config_file, serde_json::to_string(&config).unwrap()).unwrap();
    Ok(())
}


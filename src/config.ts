import { invoke } from "@tauri-apps/api/core";
import { exists, mkdir, readTextFile, writeTextFile } from "./fromTauri";

const configFileName = 'frontend_config.json'

export const frontendConfig = {
    lastFile: '',
}

export async function loadConfig() {
    const appDataPath = await invoke('app_data_path') as string;
    console.log("appDataPath", appDataPath);
    if (!await exists(appDataPath)) {
        await mkdir(appDataPath);
    }
    const configFilePath = appDataPath + '/' + configFileName;
    if (await exists(configFilePath)) {
        const configPath = await readTextFile(configFilePath);
        var a = JSON.parse(configPath);
        if (a.lastFile) {
            frontendConfig.lastFile = a.lastFile;
        }
    }
}

export async function saveConfig() {
    const appDataPath = await invoke('app_data_path') as string;
    if (!await exists(appDataPath)) {
        await mkdir(appDataPath);
    }
    const configFilePath = appDataPath + '/' + configFileName;
    await writeTextFile(configFilePath, JSON.stringify(frontendConfig));
}

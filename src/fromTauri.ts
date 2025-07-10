import { invoke } from "@tauri-apps/api/core";

export async function exists(path: string) {
    return await invoke('exists', { path });
}

export async function mkdir(path: string) {
    return await invoke('mkdir', { path });
}

export async function writeTextFile(path: string, content: string) {
    return await invoke('write_text_file', { path, content });
}

export async function readTextFile(path: string) {
    return await invoke('read_text_file', { path }) as string;
}   

export async function load_backend_config() {
    return await invoke('load_backend_config') as BackendConfig;
}

export async function save_backend_config(config: BackendConfig) {
    return await invoke('save_backend_config', { config });
}   

export interface BackendConfig {
    m7_source_path: string;
    python_path: string;
}

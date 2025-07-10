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

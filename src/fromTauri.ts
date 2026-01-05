import { invoke } from "@tauri-apps/api/core";

export async function get_version() {
    return await invoke('get_version') as string;
}

export async function get_new_version() {
    return await invoke('get_new_version') as string | null;
}

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
    m7_path: string;
    better_gi_path: string;
    zzzod_path: string;
    genshin_auto_login_path: string;
    ok_ww_path: string;
}

export async function get_account_uid() {
    return await invoke('get_account_uid') as number;
}

export async function export_account(accountName: string, username: string, password: string) {
    return await invoke('export_account', { accountName, username, password });
}

export async function clear_game_reg() {
    return await invoke('clear_game_reg');
}

export async function run_better_gi() {
    return await invoke('run_better_gi');
}

export async function run_better_gi_by_config(configName: string) {
    return await invoke('run_better_gi_by_config', { configName });
}

export async function close_gi() {
    return await invoke('close_gi');
}

export async function export_gi_account(accountName: string) {
    return await invoke('export_gi_account', { accountName });
}

export async function import_gi_account(accountName: string) {
    return await invoke('import_gi_account', { accountName });
}

export async function clear_gi_reg() {
    return await invoke('clear_gi_reg');
}

export async function list_accounts() {
    return await invoke('list_accounts') as string[];
}

export async function list_gi_accounts() {
    return await invoke('list_gi_accounts') as string[];
}

export async function open_release_page() {
    return await invoke('open_release_page');
}

export async function run_m7_launcher() {
    return await invoke('run_m7_launcher');
}

export async function run_better_gi_gui() {
    return await invoke('run_better_gi_gui');
}

export async function run_zzzod() {
    return await invoke('run_zzzod');
}

export async function run_zzzod_gui() {
    return await invoke('run_zzzod_gui');
}

export async function run_better_gi_scheduler(groups: string) {
    return await invoke('run_better_gi_scheduler', { groups });
}

export async function export_zzz_account(accountName: string) {
    return await invoke('export_zzz_account', { accountName });
}

export async function import_zzz_account(accountName: string) {
    return await invoke('import_zzz_account', { accountName });
}

export async function list_zzz_accounts() {
    return await invoke('list_zzz_accounts') as string[];
}

export async function clear_zzz_reg() {
    return await invoke('clear_zzz_reg');
}

export async function close_zzz() {
    return await invoke('close_zzz');
}

export async function get_auto_run_file() {
    return await invoke('get_auto_run_file') as string | null;
}

export async function genshin_auto_login(accountName: string) {
    return await invoke('genshin_auto_login', { accountName });
}


use std::env;
use std::process;

use winapi::um::processthreadsapi::OpenProcessToken;
use winapi::um::processthreadsapi::GetCurrentProcess;
use winapi::um::winnt::{TOKEN_QUERY, TOKEN_ELEVATION, TokenElevation};
use winapi::um::securitybaseapi::GetTokenInformation;
use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;
use std::ptr;
use winapi::um::shellapi::ShellExecuteW;
use winapi::um::winuser::SW_SHOW;


fn is_elevated() -> bool {
    unsafe {
        let mut token_handle = std::ptr::null_mut();
        if OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &mut token_handle) != 0 {
            let mut elevation = TOKEN_ELEVATION { TokenIsElevated: 0 };
            let mut ret_len = 0;
            let res = GetTokenInformation(
                token_handle,
                TokenElevation,
                &mut elevation as *mut _ as *mut _,
                std::mem::size_of::<TOKEN_ELEVATION>() as u32,
                &mut ret_len,
            );
            if res != 0 {
                return elevation.TokenIsElevated != 0;
            }
        }
        false
    }
}


fn to_wide(s: &str) -> Vec<u16> {
    OsStr::new(s).encode_wide().chain(Some(0)).collect()
}

fn run_as_admin() {
    let exe_path = env::current_exe().unwrap();
    let mut exe_str = exe_path.to_str().unwrap();
    let mut args: Vec<String> = env::args().skip(1).collect();
    if where_wt_exe() {
        args.insert(0, exe_str.to_string());
        exe_str = "wt.exe";
    }
    let args_joined = args.join(" ");

    let operation = to_wide("runas");
    let file = to_wide(exe_str);
    let parameters = to_wide(&args_joined);

    unsafe {
        ShellExecuteW(
            ptr::null_mut(),               // hwnd
            operation.as_ptr(),            // lpOperation: "runas"
            file.as_ptr(),                 // lpFile: exe 路径
            if args_joined.is_empty() {
                ptr::null()
            } else {
                parameters.as_ptr()        // lpParameters
            },
            ptr::null(),                   // lpDirectory
            SW_SHOW,
        );
    }
}

fn where_wt_exe() -> bool {
    let mut cmd = process::Command::new("where");
    cmd.arg("wt.exe");
    cmd.stdin(process::Stdio::inherit());
    cmd.stdout(process::Stdio::inherit());
    cmd.stderr(process::Stdio::inherit());
    let mut child = cmd.spawn().expect("failed to spawn process");
    let status = child.wait().expect("failed to wait on child");
    status.success()
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let elevated = is_elevated();
    if !elevated {
        run_as_admin();
        return;
    }

    let is_dev_mode = args.iter().any(|arg| arg == "--dev");
    
    // 检查是否有 --auto-run 参数
    let auto_run_file = args.iter()
        .position(|arg| arg == "--auto-run")
        .and_then(|pos| args.get(pos + 1))
        .map(|s| s.clone());

    let mut cmd_args: Vec<String> = if is_dev_mode {
        println!("开发模式");
        vec!["yarn".to_string(), "tauri".to_string(), "dev".to_string()]
    } else {
        vec!["mflow-tauri-app.exe".to_string()]
    };

    // 如果有 --auto-run 参数，添加到命令中
    if let Some(file_path) = auto_run_file {
        println!("自动运行文件: {}", file_path);
        cmd_args.push("--".to_string());
        cmd_args.push("--".to_string());
        cmd_args.push("--".to_string());
        cmd_args.push("--auto-run".to_string());
        cmd_args.push(file_path);
    }

    println!("cmd_args: {:?}", cmd_args);

    let mut cmd = process::Command::new("cmd.exe");
    cmd.arg("/c");
    for arg in cmd_args {
        cmd.arg(arg);
    }
    cmd.stdin(process::Stdio::inherit());
    cmd.stdout(process::Stdio::inherit());
    cmd.stderr(process::Stdio::inherit());
    let status = cmd.status().expect("failed to execute process");
    println!("status: {:?}", status);
    if status.success() {
        process::exit(0);
    } else {
        loop {
            std::thread::sleep(std::time::Duration::from_secs(100));
        }
    }
}

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


pub fn is_elevated() -> bool {
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

pub fn run_as_admin() {
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

pub fn where_wt_exe() -> bool {
    let mut cmd = process::Command::new("where");
    cmd.arg("wt.exe");
    cmd.stdin(process::Stdio::inherit());
    cmd.stdout(process::Stdio::inherit());
    cmd.stderr(process::Stdio::inherit());
    let mut child = cmd.spawn().expect("failed to spawn process");
    let status = child.wait().expect("failed to wait on child");
    status.success()
}

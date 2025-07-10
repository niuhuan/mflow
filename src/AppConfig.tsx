import { useEffect, useState } from "react";
import { BackendConfig, load_backend_config, save_backend_config } from "./fromTauri";


export function AppConfig({ backToEditor }: { backToEditor: () => void }) {

    const [backendConfig, setBackendConfig] = useState<BackendConfig>({
        m7_source_path: '',
        python_path: '',
    });

    useEffect(() => {
        load_backend_config().then((config) => {
            setBackendConfig(config);
        });
    }, []);

    return (
        <div>
            <h1>App Config</h1>
            <div>
                <label>三月七小助手源代码路径</label>
                <input type="text" value={backendConfig.m7_source_path} onChange={(e) => setBackendConfig({ ...backendConfig, m7_source_path: e.target.value })} />
            </div>
            <div>
                <label>Python路径(不填写则默认使用python.exe)</label>
                <input type="text" value={backendConfig.python_path} onChange={(e) => setBackendConfig({ ...backendConfig, python_path: e.target.value })} />
            </div>
            <div>
                <button onClick={async () => {
                    await save_backend_config(backendConfig);
                    backToEditor();
                }}>Save</button>
            </div>
        </div>
    )

}

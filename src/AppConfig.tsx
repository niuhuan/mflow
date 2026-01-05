import { useEffect, useState } from "react";
import { BackendConfig, load_backend_config, save_backend_config } from "./fromTauri";
import "./AppConfig.css";

export function AppConfig({ backToEditor }: { backToEditor: () => void }) {

    const [backendConfig, setBackendConfig] = useState<BackendConfig>({
        m7_path: '',
        better_gi_path: '',
        zzzod_path: '',
        genshin_auto_login_path: '',
        ok_ww_path: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        load_backend_config().then((config) => {
            setBackendConfig(config);
        });
    }, []);

    const handleInputChange = (field: keyof BackendConfig, value: string) => {
        setBackendConfig({ ...backendConfig, [field]: value });
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await save_backend_config(backendConfig);
            setHasChanges(false);
            backToEditor();
        } catch (error) {
            console.error('保存配置失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (hasChanges) {
            if (confirm('您有未保存的更改，确定要取消吗？')) {
                backToEditor();
            }
        } else {
            backToEditor();
        }
    };

    return (
        <div className="config-container">
            <div className="config-card">
                <div className="config-header">
                    <svg className="config-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <h1 className="config-title">应用配置</h1>
                </div>

                <div className="config-form">
                    <div className="form-group">
                        <label className="form-label">
                            <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10,9 9,9 8,9"/>
                            </svg>
                            三月七小助手路径
                        </label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={backendConfig.m7_path} 
                            onChange={(e) => handleInputChange('m7_path', e.target.value)}
                            placeholder="请输入三月七小助手路径..."
                        />
                        <div className="input-hint">指定三月七小助手路径</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4"/>
                                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                                <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"/>
                                <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"/>
                            </svg>
                            BetterGI路径
                        </label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={backendConfig.better_gi_path} 
                            onChange={(e) => handleInputChange('better_gi_path', e.target.value)}
                            placeholder="留空则使用默认BetterGI.exe"
                        />
                        <div className="input-hint">指定BetterGI路径，用于原神自动化操作</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4"/>
                                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                                <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"/>
                                <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"/>
                            </svg>
                            ZZZOD路径
                        </label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={backendConfig.zzzod_path} 
                            onChange={(e) => handleInputChange('zzzod_path', e.target.value)}
                            placeholder="绝区零一条龙文件夹路径"
                        />
                        <div className="input-hint">指定绝区零一条龙文件夹路径，用于绝区零自动化操作</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4"/>
                                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                                <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"/>
                                <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"/>
                            </svg>
                            原神自动登录器文件夹
                        </label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={backendConfig.genshin_auto_login_path} 
                            onChange={(e) => handleInputChange('genshin_auto_login_path', e.target.value)}
                            placeholder="原神自动登录器文件夹路径"
                        />
                        <div className="input-hint">指定原神自动登录器文件夹路径，用于原神自动登录功能</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10,9 9,9 8,9"/>
                            </svg>
                            OK-WW路径
                        </label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={backendConfig.ok_ww_path} 
                            onChange={(e) => handleInputChange('ok_ww_path', e.target.value)}
                            placeholder="ok-ww文件夹路径"
                        />
                        <div className="input-hint">指定ok-ww文件夹路径，用于运行ok-ww</div>
                    </div>

                </div>

                <div className="config-actions">
                    <button 
                        className="action-button cancel-button"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        <span>取消</span>
                    </button>
                    
                    <button 
                        className="action-button save-button"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <svg className="loading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12a9 9 0 11-6.219-8.56"/>
                            </svg>
                        ) : (
                            <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                <polyline points="17,21 17,13 7,13 7,21"/>
                                <polyline points="7,3 7,8 15,8"/>
                            </svg>
                        )}
                        <span>{isLoading ? '保存中...' : '保存配置'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

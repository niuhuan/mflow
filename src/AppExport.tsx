import { useEffect, useState } from "react";
import { get_account_uid, export_account } from "./fromTauri";
import "./AppExport.css";

export function AppExport({ backToOpenSaveProject }: { backToOpenSaveProject: () => void }) {

    const [uid, setUid] = useState<string>('');
    const [accountName, setAccountName] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        var a = async () => {
            try {
                const uid = await get_account_uid();
                setUid(uid.toString());
            } catch (error) {
                setMessage('读取账号UID失败');
            }
        };
        a();
    }, []);

    const handleSubmit = async () => {
        if (!accountName.trim()) {
            setMessage('请输入账号名称');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            await export_account(accountName.trim(), username, password);
            setMessage('账号导出成功！');
            // 清空表单
            setAccountName('');
            setUsername('');
            setPassword('');
        } catch (error) {
            setMessage('账号导出失败，请检查配置');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="export-container">
            <div className="export-card">
                <div className="export-header">
                    <svg className="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                        <path d="M12 3v12"/>
                    </svg>
                    <h1 className="export-title">导出账号</h1>
                </div>

                <div className="export-form">
                    <div className="form-group">
                        <label className="form-label">
                            <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            账号UID
                        </label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={uid}
                            disabled={true}
                            placeholder="正在读取..."
                        />
                        <div className="input-hint">当前登录的游戏账号UID</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            账号名称 *
                        </label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            placeholder="请输入账号名称"
                            disabled={isLoading}
                        />
                        <div className="input-hint">用于标识和管理账号的名称</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            用户名
                        </label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="可选：用于恢复登录"
                            disabled={isLoading}
                        />
                        <div className="input-hint">可选填写，用于恢复登录时自动输入用户名</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            密码
                        </label>
                        <input 
                            type="password" 
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="可选：用于恢复登录"
                            disabled={isLoading}
                        />
                        <div className="input-hint">可选填写，用于恢复登录时自动输入密码</div>
                    </div>
                </div>

                {message && (
                    <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <div className="export-actions">
                    <button 
                        className="action-button cancel-button"
                        onClick={backToOpenSaveProject}
                        disabled={isLoading}
                    >
                        <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        <span>取消</span>
                    </button>
                    
                    <button 
                        className="action-button export-button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <svg className="loading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12a9 9 0 11-6.219-8.56"/>
                            </svg>
                        ) : (
                            <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                                <path d="M12 3v12"/>
                            </svg>
                        )}
                        <span>{isLoading ? '导出中...' : '导出账号'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

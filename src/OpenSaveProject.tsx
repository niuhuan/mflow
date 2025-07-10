import { open, save } from '@tauri-apps/plugin-dialog';
import './OpenSaveProject.css';

function OpenSaveProject({ goSetting, initFromPath }: { goSetting: () => void, initFromPath: (path: string) => void }) {
    return (
        <div className="open-save-container">
            <div className="button-group">
                <button 
                    className="action-button open-button"
                    onClick={async () => {
                        const path = await open({
                            filters: [
                                {
                                    name: 'Blockly XML',
                                    extensions: ['m7f']
                                }
                            ]
                        })
                        if (path) {
                            initFromPath(path);
                        }
                    }}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span>打开项目</span>
                </button>
                
                <button 
                    className="action-button save-button"
                    onClick={async () => {
                        const path = await save({
                            filters: [
                                {
                                    name: 'Blockly XML',
                                    extensions: ['m7f']
                                }
                            ]
                        })
                        if (path) {
                            initFromPath(path);
                        }
                    }}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17,21 17,13 7,13 7,21"/>
                        <polyline points="7,3 7,8 15,8"/>
                    </svg>
                    <span>使用模板创建项目</span>
                </button>
            </div>
            
            <div className="button-group">
                <button 
                    className="action-button config-button"
                    onClick={goSetting}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    <span>设置</span>
                </button>
                
                <button 
                    className="action-button export-button"
                    onClick={() => { alert('导出账号功能待实现'); }}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                        <path d="M12 3v12"/>
                    </svg>
                    <span>导出账号</span>
                </button>
                
                <button 
                    className="action-button danger-button"
                    onClick={() => { alert('清除游戏注册表功能待实现'); }}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                    <span>清除游戏注册表</span>
                </button>
            </div>
        </div>
    );
}

export default OpenSaveProject;
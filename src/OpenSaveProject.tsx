import { open, save } from '@tauri-apps/plugin-dialog';
import './OpenSaveProject.css';

function OpenSaveProject({ initFromPath }: { initFromPath: (path: string) => void }) {
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
                    <span>创建项目</span>
                </button>
            </div>
        </div>
    );
}

export default OpenSaveProject;
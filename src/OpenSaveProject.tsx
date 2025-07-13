import { open, save } from '@tauri-apps/plugin-dialog';
import { useState } from 'react';
import './OpenSaveProject.css';

const blankXml = `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="start_flow" id="start" x="100" y="100"></block>
  </xml>`;

import mutilAccountXml from './assets/mutil-account.xml?raw';

function OpenSaveProject({ goSetting, goExport, openFromPath, initFromTemaplate, version, newVersion }: { goSetting: () => void, goExport: () => void, openFromPath: (path: string) => void, initFromTemaplate: (path: string, template: string) => void, version: string, newVersion: string }) {
    
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    
    const handleCreateFromTemplate = async (templateType: string) => {
        setShowTemplateModal(false);
        
        let selectedTemplate = '';
        let templateName = '';
        
        switch (templateType) {
            case 'blank':
                selectedTemplate = blankXml;
                templateName = '空白模板';
                break;
            case 'multi':
                selectedTemplate = mutilAccountXml;
                templateName = '多账户模板';
                break;
            default:
                return;
        }

        console.log(templateName);
        
        const path = await save({
            filters: [
                {
                    name: 'Blockly XML',
                    extensions: ['m7f']
                }
            ]
        });
        
        if (path) {
            initFromTemaplate(path, selectedTemplate);
        }
    };

    return (
        <div className="open-save-container">
            {showTemplateModal && (
                <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
                    <div className="template-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>选择模板</h2>
                            <button 
                                className="close-button"
                                onClick={() => setShowTemplateModal(false)}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="template-grid">
                            <div 
                                className="template-card"
                                onClick={() => handleCreateFromTemplate('blank')}
                            >
                                <div className="template-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14,2 14,8 20,8"/>
                                        <line x1="16" y1="13" x2="8" y2="13"/>
                                        <line x1="16" y1="17" x2="8" y2="17"/>
                                        <polyline points="10,9 9,9 8,9"/>
                                    </svg>
                                </div>
                                <h3>空白模板</h3>
                                <p>从零开始创建项目，只包含一个开始积木</p>
                                <div className="template-preview">
                                    <div className="preview-block start-block">开始</div>
                                </div>
                            </div>
                            
                            <div 
                                className="template-card"
                                onClick={() => handleCreateFromTemplate('multi')}
                            >
                                <div className="template-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                </div>
                                <h3>多账户模板</h3>
                                <p>包含完整的多账户工作流程和函数定义</p>
                                <div className="template-preview">
                                    <div className="preview-block start-block">开始</div>
                                    <div className="preview-block function-block">刷体力做每日</div>
                                    <div className="preview-block function-block">锄大地</div>
                                    <div className="preview-block loop-block">循环执行</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                            openFromPath(path);
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
                    onClick={() => setShowTemplateModal(true)}
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
                    onClick={goExport}
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

            <div className="version-info">
                {newVersion && (
                    <span style={{ color: 'white' }}>最新版本: {newVersion}</span>
                )}
                <span style={{ color: 'white' }}>当前版本: {version}</span>
            </div>
        </div>
    );
}

export default OpenSaveProject;
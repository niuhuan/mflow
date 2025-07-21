import { open, save } from '@tauri-apps/plugin-dialog';
import { useState } from 'react';
import './OpenSaveProject.css';
import { clear_game_reg, clear_gi_reg, export_gi_account, list_accounts, list_gi_accounts, open_release_page, run_better_gi_gui, run_m7_launcher, run_zzzod_gui } from './fromTauri';

const blankXml = `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="start_flow" id="start" x="100" y="100"></block>
  </xml>`;

import singleUserXml from './assets/single-user.xml?raw';
import mutilAccountXml from './assets/mutil-account.xml?raw';
import { invoke } from '@tauri-apps/api/core';

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
            case 'single':
                selectedTemplate = singleUserXml;
                templateName = '单个账号模板';
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

    const onExportGiAccount = async () => {
        // dialog input text
        let accountName = prompt('请输入原神账号名称');
        if (!accountName) {
            return;
        }
        accountName = accountName.trim();
        if (accountName === '') {
            alert('请输入原神账号名称');
        }
        if (accountName) {
            try {
                await export_gi_account(accountName);
                alert('导出原神账号成功');
            } catch (error) {
                alert(error);
            }
        }
    }

    const selectOne = async (list: string[]) => {
        return new Promise<string | null>((resolve) => {
            // 创建模态对话框
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;

            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background-color: white;
                border-radius: 8px;
                padding: 20px;
                min-width: 300px;
                max-width: 500px;
                max-height: 400px;
                overflow-y: auto;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            `;

            const title = document.createElement('h3');
            title.textContent = '请选择一个项目';
            title.style.cssText = `
                margin: 0 0 15px 0;
                color: #333;
            `;

            const listContainer = document.createElement('div');
            listContainer.style.cssText = `
                margin-bottom: 15px;
            `;

            // 创建选项列表
            list.forEach((item, _index) => {
                const option = document.createElement('div');
                option.textContent = item;
                option.style.cssText = `
                    padding: 10px;
                    margin: 5px 0;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                `;

                option.addEventListener('mouseenter', () => {
                    option.style.backgroundColor = '#f5f5f5';
                });

                option.addEventListener('mouseleave', () => {
                    option.style.backgroundColor = 'white';
                });

                option.addEventListener('click', () => {
                    resolve(item);
                    document.body.removeChild(modal);
                });

                listContainer.appendChild(option);
            });

            const cancelButton = document.createElement('button');
            cancelButton.textContent = '取消';
            cancelButton.style.cssText = `
                padding: 8px 16px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background-color: #f8f9fa;
                cursor: pointer;
                margin-right: 10px;
            `;

            cancelButton.addEventListener('click', () => {
                resolve(null);
                document.body.removeChild(modal);
            });

            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                text-align: right;
            `;
            buttonContainer.appendChild(cancelButton);

            dialog.appendChild(title);
            dialog.appendChild(listContainer);
            dialog.appendChild(buttonContainer);
            modal.appendChild(dialog);
            document.body.appendChild(modal);

            // 点击模态背景关闭
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    resolve(null);
                    document.body.removeChild(modal);
                }
            });

            // ESC键关闭
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    resolve(null);
                    document.body.removeChild(modal);
                    document.removeEventListener('keydown', handleKeyDown);
                }
            };
            document.addEventListener('keydown', handleKeyDown);
        });
    }

    const handleImportAccount = async () => {
        try {
            let list = await list_accounts();
            console.log(list);
            if (list.length === 0) {
                alert('没有星铁账号');
                return;
            }
            let accountName = await selectOne(list);
            if (!accountName) {
                return;
            }
            
            await invoke('load_account', { name: accountName });
            alert('导入星铁账号成功');
        } catch (error) {
            alert(error);
        }
    }

    const handleImportGiAccount = async () => {
        try {
            let list = await list_gi_accounts();
            console.log(list);
            if (list.length === 0) {
                alert('没有原神账号');
                return;
            }
            let accountName = await selectOne(list);
            if (!accountName) {
                return;
            }
            
            await invoke('import_gi_account', { accountName });
            alert('导入原神账号成功');
        } catch (error) {
            alert(error);
        }
    }

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
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
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
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14,2 14,8 20,8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10,9 9,9 8,9" />
                                    </svg>
                                </div>
                                <h3>空白</h3>
                                <p>从零开始创建项目，只包含一个开始积木</p>
                                <div className="template-preview">
                                    <div className="preview-block start-block">开始</div>
                                </div>
                            </div>

                            <div
                                className="template-card"
                                onClick={() => handleCreateFromTemplate('single')}
                            >
                                <div className="template-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M20.21 16.89A5 5 0 0 0 18 11h-1.26a8 8 0 1 0-11.62 9" />
                                        <polyline points="16 16 14 14 16 12" />
                                        <polyline points="8 16 10 14 8 12" />
                                    </svg>
                                </div>
                                <h3>原神星铁任务编排</h3>
                                <p>编排原神和星铁的自动化流程，不需要切换账号</p>
                                <div className="template-preview">
                                    <div className="preview-block start-block">开始</div>
                                    <div className="preview-block function-block">星铁自动化</div>
                                    <div className="preview-block function-block">原神自动化</div>
                                    <div className="preview-block loop-block">循环执行</div>
                                </div>
                            </div>

                            <div
                                className="template-card"
                                onClick={() => handleCreateFromTemplate('multi')}
                            >
                                <div className="template-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <h3>多游戏多账户</h3>
                                <p>包含完整的多游戏多账户工作流程和函数定义</p>
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
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7,10 12,15 17,10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>打开项目</span>
                </button>

                <button
                    className="action-button save-button"
                    onClick={() => setShowTemplateModal(true)}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17,21 17,13 7,13 7,21" />
                        <polyline points="7,3 7,8 15,8" />
                    </svg>
                    <span>使用模板创建项目</span>
                </button>
                <button
                    className="action-button config-button"
                    onClick={goSetting}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span>设置</span>
                </button>

            </div>

            <div className="button-group">  

            <button
                    className="action-button export-button"
                    onClick={goExport}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7,10 12,15 17,10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                        <path d="M12 3v12" />
                    </svg>
                    <span>导出星铁账号</span>
                </button>

                <button
                    className="action-button export-button"
                    onClick={handleImportAccount}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17,8 12,3 7,8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>导入星铁账号</span>
                </button>

                <button
                    className="action-button export-button"
                    onClick={run_m7_launcher}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5,3 19,12 5,21 5,3" />
                    </svg>
                    <span>启动三月七小助手</span>
                </button>

                <button
                    className="action-button danger-button"
                    onClick={async () => {
                        try {
                            await clear_game_reg();
                            alert('清除游戏注册表成功');
                        } catch (error) {
                            alert(error);
                        }
                    }}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                    <span>清除星铁游戏注册表</span>
                </button>


            </div>

            <div className="button-group">  

            <button
                    className="action-button export-button"
                    onClick={onExportGiAccount}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7,10 12,15 17,10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                        <path d="M12 3v12" />
                    </svg>
                    <span>导出原神账号</span>
                </button>

                
                <button
                    className="action-button export-button"
                    onClick={handleImportGiAccount}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17,8 12,3 7,8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>导入原神账号</span>
                </button>

                <button
                    className="action-button export-button"
                    onClick={run_better_gi_gui}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5,3 19,12 5,21 5,3" />
                    </svg>
                    <span>启动更好的原神</span>
                </button>

                <button
                    className="action-button danger-button"
                    onClick={async () => {
                        try {
                            await clear_gi_reg();
                            alert('清除原神注册表成功');
                        } catch (error) {
                            alert(error);
                        }
                    }}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                    <span>清除原神注册表</span>
                </button>
            </div>

            <div className="button-group">
                <button
                    className="action-button export-button"
                    onClick={async ()=>{
                        try {
                            await run_zzzod_gui();
                        } catch (error) {
                            alert(error);
                        }
                    }}
                >
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5,3 19,12 5,21 5,3" />
                    </svg>
                    <span>启动绝区零一条龙界面</span>
                </button>

                 
            </div>

            <div className="version-info" onClick={() => open_release_page()}>
                {newVersion && (
                    <div className="update-badge">
                        <svg className="update-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7,10 12,15 17,10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span className="update-text">有新版本</span>
                    </div>
                )}
                <span style={{ color: 'white' }}>当前版本: {version}</span>
            </div>
        </div>
    );
}

export default OpenSaveProject;
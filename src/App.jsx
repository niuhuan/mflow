import { useState, useEffect, useRef } from 'react';
import BlocklyComponent from './components/BlocklyComponent';
import './blocks/customBlocks';
import './blocks/generators';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import './App.css';
import { invoke } from '@tauri-apps/api/core';
import OpenSaveProject from './OpenSaveProject';
import { frontendConfig, loadConfig, saveConfig } from './config';
import { exists, get_account_uid, load_backend_config, readTextFile, writeTextFile, get_version, get_new_version, open_release_page, run_m7_launcher, run_better_gi_gui, run_zzzod_gui, export_gi_account, import_gi_account, export_zzz_account, import_zzz_account, close_zzz, list_accounts, list_gi_accounts, list_zzz_accounts, export_account, get_auto_run_file, genshin_auto_login } from './fromTauri';
import { AppConfig } from './AppConfig';
import { AppExport } from './AppExport';

import { getCurrentWindow } from '@tauri-apps/api/window';


function App() {

  const initialXml = `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="start_flow" id="start" x="100" y="100"></block>
  </xml>`;

  const toolboxXml = `
    <xml>
      <category name="星铁" colour="230">
        <block type="load_account">
          <value name="ACCOUNT_NAME">
            <shadow type="text">
              <field name="TEXT">默认账号</field>
            </shadow>
          </value>
        </block>
        <block type="save_account">
          <value name="SAVE_NAME">
            <shadow type="text">
              <field name="TEXT">默认账号</field>
            </shadow>
          </value>
        </block>
        <block type="daily_mission"></block>
        <block type="refresh_stamina"></block>
        <block type="simulated_universe"></block>
        <block type="farming"></block>
        <block type="close_game"></block>
      </category>
      <category name="原神" colour="30">
        <block type="run_better_gi"></block>
        <block type="run_better_gi_by_config">
          <value name="CONFIG_NAME">
            <shadow type="text">
              <field name="TEXT">配置文件</field>
            </shadow>
          </value>
        </block>
        <block type="run_better_gi_scheduler">
          <value name="GROUPS">
            <shadow type="text">
              <field name="TEXT">配置组名称1 配置组名称2 退出程序</field>
            </shadow>
          </value>
        </block>
        <block type="close_gi"></block>
        <block type="export_gi_account">
          <value name="ACCOUNT_NAME">
            <shadow type="text">
              <field name="TEXT">默认账号</field>
            </shadow>
          </value>
        </block>
        <block type="import_gi_account">
          <value name="ACCOUNT_NAME">
            <shadow type="text">
              <field name="TEXT">默认账号</field>
            </shadow>
          </value>
        </block>
        <block type="genshin_auto_login">
          <value name="ACCOUNT_NAME">
            <shadow type="text">
              <field name="TEXT">account1</field>
            </shadow>
          </value>
        </block>
      </category>
      <category name="ZZZ" colour="30">
        <block type="run_zzzod"></block>
        <block type="close_zzz"></block>
        <block type="export_zzz_account">
          <value name="ACCOUNT_NAME">
            <shadow type="text">
              <field name="TEXT">默认账号</field>
            </shadow>
          </value>
        </block>
        <block type="import_zzz_account">
          <value name="ACCOUNT_NAME">
            <shadow type="text">
              <field name="TEXT">默认账号</field>
            </shadow>
          </value>
        </block>
      </category>
      <category name="鸣潮" colour="30">
        <block type="start_ok_ww_daily"></block>
        <block type="start_ok_ww_weekly"></block>
        <block type="kill_ok_ww"></block>
      </category>
      <category name="通用" colour="80">
        <block type="wait_seconds">
          <field name="TIME_VALUE">10</field>
          <field name="TIME_UNIT">SECONDS</field>
        </block>
        <block type="wait_until_time">
          <field name="HOUR">4</field>
          <field name="MINUTE">10</field>
        </block>
        <block type="print_variable">
          <value name="VALUE">
            <shadow type="text">
              <field name="TEXT">变量名</field>
            </shadow>
          </value>
        </block>
        <block type="run_command">
          <value name="COMMAND">
            <shadow type="text">
              <field name="TEXT">echo Hello World</field>
            </shadow>
          </value>
        </block>
      </category>
      <category name="流程" colour="120">
        <block type="controls_whileUntil"></block>
        <block type="controls_repeat_ext">
          <value name="TIMES">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
        </block>
        <block type="controls_if"></block>
        <block type="controls_if_else"></block>
        <block type="controls_forEach"></block>
      </category>
      <category name="逻辑" colour="150">
        <block type="logic_boolean">
          <field name="BOOL">TRUE</field>
        </block>
        <block type="logic_operation">
          <value name="A">
            <shadow type="logic_boolean">
              <field name="BOOL">TRUE</field>
            </shadow>
          </value>
          <value name="B">
            <shadow type="logic_boolean">
              <field name="BOOL">FALSE</field>
            </shadow>
          </value>
        </block>
        <block type="logic_negate">
          <value name="BOOL">
            <shadow type="logic_boolean">
              <field name="BOOL">TRUE</field>
            </shadow>
          </value>
        </block>
        <block type="logic_compare">
          <value name="A">
            <shadow type="math_number">
              <field name="NUM">0</field>
            </shadow>
          </value>
          <value name="B">
            <shadow type="math_number">
              <field name="NUM">0</field>
            </shadow>
          </value>
        </block>
      </category>
       <category name="数值" colour="160">
        <block type="math_number">
          <field name="NUM">0</field>
        </block>
        <block type="current_hour_24"></block>
        <block type="current_time_minus_4h_day_of_week"></block>
        <block type="text"></block>
      </category>
      <sep></sep>
      <category name="变量" colour="%{BKY_VARIABLE_HUE}" custom="VARIABLE"></category>
      <category name="函数" colour="330">
        <block type="custom_function_def"></block>
        <block type="custom_function_call">
          <value name="ARGS">
            <shadow type="text">
              <field name="TEXT"></field>
            </shadow>
          </value>
        </block>
        <block type="custom_parameter">
          <field name="PARAM_NAME">param1</field>
        </block>
      </category>
      <category name="集合" colour="260">
        <block type="lists_create_with"></block>
      </category>
    </xml>
  `;

  const [version, setVersion] = useState('');
  const [newVersion, setNewVersion] = useState('');
  const [code, setCode] = useState('');
  const [consoleMessages, setConsoleMessages] = useState([]);
  const [init, setInit] = useState(0);
  const [filePath, setFilePath] = useState('');
  const [fileContent, setFileContent] = useState(initialXml);
  const [isRunning, setIsRunning] = useState(false);
  
  const [exitType, setExitType] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedXml, setLastSavedXml] = useState(initialXml);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const saveToFile = async (xmlContent) => {
    setLastSavedXml(xmlContent);
    setIsDirty(false);
    window.isDirty = false;
    if (filePath) {
      await writeTextFile(filePath, xmlContent);
      putConsoleMessage(`> 保存到文件: ${filePath}`);
    }
  }

  const saveFlow = async () => {
    const xml = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace());
    const xmlText = Blockly.Xml.domToText(xml);
    await saveToFile(xmlText);
  }

  const selectOne = async (list) => {
    return new Promise((resolve) => {
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
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
      list.forEach((item) => {
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
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          resolve(null);
          document.body.removeChild(modal);
          document.removeEventListener('keydown', handleKeyDown);
        }
      };
      document.addEventListener('keydown', handleKeyDown);
    });
  }

  const handleDropdownAction = async (action) => {
    setShowDropdown(false);
    try {
      switch (action) {
        case 'm7_launcher':
          await run_m7_launcher();
          break;
        case 'better_gi_gui':
          await run_better_gi_gui();
          break;
        case 'zzzod_gui':
          await run_zzzod_gui();
          break;
        case 'export_gi_account':
          const accountName = prompt('请输入原神账号名称');
          if (accountName && accountName.trim()) {
            await export_gi_account(accountName.trim());
            alert('导出原神账号成功');
          }
          break;
        case 'import_gi_account':
          const giList = await list_gi_accounts();
          if (giList.length === 0) {
            alert('没有原神账号');
            return;
          }
          const giAccountName = await selectOne(giList);
          if (giAccountName) {
            await import_gi_account(giAccountName);
            alert('导入原神账号成功');
          }
          break;
        case 'import_account':
          const list = await list_accounts();
          if (list.length === 0) {
            alert('没有星铁账号');
            return;
          }
          const accountName2 = await selectOne(list);
          if (accountName2) {
            await invoke('load_account', { name: accountName2 });
            alert('导入星铁账号成功');
          }
          break;
        case 'export_account':
          const accountName3 = prompt('请输入星铁账号名称');
          if (accountName3 && accountName3.trim()) {
            await export_account(accountName3.trim(), '', '');
            alert('导出星铁账号成功');
          }
          break;
        case 'export_zzz_account':
          const zzzAccountName = prompt('请输入绝区零账号名称');
          if (zzzAccountName && zzzAccountName.trim()) {
            await export_zzz_account(zzzAccountName.trim());
            alert('导出绝区零账号成功');
          }
          break;
        case 'import_zzz_account':
          const zzzList = await list_zzz_accounts();
          if (zzzList.length === 0) {
            alert('没有绝区零账号');
            return;
          }
          const zzzAccountName2 = await selectOne(zzzList);
          if (zzzAccountName2) {
            await import_zzz_account(zzzAccountName2);
            alert('导入绝区零账号成功');
          }
          break;
        default:
          break;
      }
    } catch (error) {
      alert(error);
    }
  }

  const openFromPath = async (path, autoRun = false) => {
    if (!await exists(path)) {
      await writeTextFile(path, initialXml);
    }
    const fileContent = await readTextFile(path);
    setFilePath(path);
    setFileContent(fileContent);
    setLastSavedXml(fileContent);
    setIsDirty(false);
    window.isDirty = false;
    frontendConfig.lastFile = path;
    await saveConfig();
    setInit(100);
    if (autoRun) {
      setTimeout(() => {
        runCode();
      }, 200);
    }
  }

  const initFromTemaplate = async (path, template) => {
    await writeTextFile(path, template);
    const fileContent = await readTextFile(path);
    setFilePath(path);
    setFileContent(fileContent);
    setLastSavedXml(fileContent);
    setIsDirty(false);
    window.isDirty = false;
    frontendConfig.lastFile = path;
    await saveConfig();
    setInit(100);
  }

  const putConsoleMessage = (message) => {
    const datetime = new Date().toLocaleString();
    message = `${datetime} ${message}`;
    setConsoleMessages(prev => prev.length > 100 ? [...prev.slice(1), message] : [...prev, message]);
    const consoleContainer = document.querySelector('.console');
    if (consoleContainer) {
      consoleContainer.scrollTop = consoleContainer.scrollHeight;
    }
  }

  const runCode = async () => {

    setIsRunning(true);

    const log = (message) => {
      putConsoleMessage(message);
    }
    window['log'] = log;

    const workspace = Blockly.getMainWorkspace();
    if (!workspace) {
      setIsRunning(false);
      return;
    }

    const xml = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToText(xml);
    await saveToFile(xmlText);

    const startBlocks = workspace.getBlocksByType('start_flow', false);
    if (startBlocks.length === 0) {
      log('执行失败: 找不到"开始"积木。');
      setIsRunning(false);
      return;
    }
    if (startBlocks.length > 1) {
      log('执行失败: 只能有一个"开始"积木，请移除多余的。');
      setIsRunning(false);
      return;
    }

    const codeToRun = javascriptGenerator.workspaceToCode(workspace);
    setCode(codeToRun);

    log('开始运行...');

    const loadAccount = async (name) => {
      log('加载星铁账号数据: ' + name);
      await invoke('load_account', { name: name });
    }
    window['loadAccount'] = loadAccount;

    const saveAccount = async (name) => {
      log('保存星铁账号数据: ' + name);
      await invoke('save_account', { name: name });
    }
    window['saveAccount'] = saveAccount;

    const wait = (timeValue, timeUnit = 'SECONDS') => {
      return new Promise(resolve => {
        let seconds = timeValue;
        let unitText = '秒';

        switch (timeUnit) {
          case 'MINUTES':
            seconds = timeValue * 60;
            unitText = '分钟';
            break;
          case 'HOURS':
            seconds = timeValue * 3600;
            unitText = '小时';
            break;
          default:
            unitText = '秒';
            break;
        }

        log(`等待 ${timeValue} ${unitText}...`);
        setTimeout(() => {
          log(`等待完成。`);
          resolve();
        }, seconds * 1000);
      });
    }
    window['wait'] = wait;

    const waitUntilTime = (targetHour, targetMinute) => {
      return new Promise(resolve => {
        log(`等待到 ${targetHour.toString().padStart(2, '0')}:${targetMinute.toString().padStart(2, '0')}`);
        const checkTime = () => {
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          
          if (currentHour === targetHour && currentMinute === targetMinute) {
            log(`已到达指定时间 ${targetHour}:${targetMinute.toString().padStart(2, '0')}`);
            resolve();
          } else {
            // log(`等待到 ${targetHour}:${targetMinute.toString().padStart(2, '0')}，当前时间 ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
            setTimeout(checkTime, 60000); // 每分钟检查一次
          }
        };
        
        checkTime();
      });
    }
    window['waitUntilTime'] = waitUntilTime;

    const dailyMission = async () => {
      log('执行星铁每日任务...');
      await invoke('daily_mission');
    }
    window['dailyMission'] = dailyMission;

    const refreshStamina = async () => {
      log('执行星铁刷体力...');
      await invoke('refresh_stamina');
    }
    window['refreshStamina'] = refreshStamina;

    const simulatedUniverse = async () => {
      log('执行星铁模拟宇宙...');
      await invoke('simulated_universe');
    }
    window['simulatedUniverse'] = simulatedUniverse;

    const farming = async () => {
      log('执行星铁锄大地...');
      await invoke('farming');
    }
    window['farming'] = farming;

    const closeGame = async () => {
      log('关闭星铁...');
      await invoke('close_game');
    }
    window['closeGame'] = closeGame;

    const runBetterGi = async () => {
      log('运行原神一条龙...');
      await invoke('run_better_gi');
    }
    window['runBetterGi'] = runBetterGi;

    const runBetterGiByConfig = async (configName) => {
      log('运行原神一条龙，使用配置文件: ' + configName);
      await invoke('run_better_gi_by_config', { configName });
    }
    window['runBetterGiByConfig'] = runBetterGiByConfig;

    const closeGi = async () => {
      log('关闭原神...');
      await invoke('close_gi');
    }
    window['closeGi'] = closeGi;

    const exportGiAccount = async (accountName) => {
      log('导出原神账号: ' + accountName);
      await invoke('export_gi_account', { accountName });
    }
    window['exportGiAccount'] = exportGiAccount;

    const importGiAccount = async (accountName) => {
      log('导入原神账号: ' + accountName);
      await invoke('import_gi_account', { accountName });
    }
    window['importGiAccount'] = importGiAccount;

    const exportZzzAccount = async (accountName) => {
      log('导出绝区零账号: ' + accountName);
      await invoke('export_zzz_account', { accountName });
    }
    window['exportZzzAccount'] = exportZzzAccount;

    const importZzzAccount = async (accountName) => {
      log('导入绝区零账号: ' + accountName);
      await invoke('import_zzz_account', { accountName });
    }
    window['importZzzAccount'] = importZzzAccount;

    const closeZzz = async () => {
      log('关闭绝区零游戏...');
      await invoke('close_zzz');
    }
    window['closeZzz'] = closeZzz;

    const runZzzod = async () => {
      log('运行绝区零一条龙...');
      await invoke('run_zzzod');
    }
    window['runZzzod'] = runZzzod;

    const startOkWwDaily = async () => {
      log('运行鸣潮日常...');
      await invoke('start_ok_ww_daily');
    }
    window['startOkWwDaily'] = startOkWwDaily;

    const startOkWwWeekly = async () => {
      log('运行鸣潮周常...');
      await invoke('start_ok_ww_weekly');
    }
    window['startOkWwWeekly'] = startOkWwWeekly;

    const killOkWw = async () => {
      log('关闭鸣潮...');
      await invoke('kill_ok_ww');
    }
    window['killOkWw'] = killOkWw;

    const runBetterGiScheduler = async (groups) => {
      log('运行原神调度器，任务组: ' + groups);
      await invoke('run_better_gi_scheduler', { groups });
    }
    window['runBetterGiScheduler'] = runBetterGiScheduler;

    const runCommand = async (command) => {
      log('运行命令: ' + command);
      try {
        const result = await invoke('run_command', { command });
        log('命令输出: ' + result);
      } catch (error) {
        log('命令执行失败: ' + error);
      }
    }
    window['runCommand'] = runCommand;

    const genshinAutoLogin = async (accountName) => {
      log('原神自动登录，账号: ' + accountName);
      try {
        await invoke('genshin_auto_login', { accountName });
        log('原神自动登录完成');
      } catch (error) {
        log('原神自动登录失败: ' + error);
      }
    }
    window['genshinAutoLogin'] = genshinAutoLogin;

    const execute = async () => {
      try {
        await eval(`(async () => { ${codeToRun} })()`);
        log('运行完成。');
      } catch (e) {
        log('运行失败: ' + e);
      } finally {
        setIsRunning(false);
      }
    }

    execute();
  };

  const firstLoadA = useRef(true);

  useEffect(() => {
    var a = async () => {
      if (!firstLoadA.current) {
        return;
      }
      firstLoadA.current = false;

      await loadConfig();
      
      // 检查是否有自动运行文件
      const autoRunFile = await get_auto_run_file();
      if (autoRunFile) {
        frontendConfig.lastFile = autoRunFile;
      }
      
      if (frontendConfig.lastFile) {
        if (await exists(frontendConfig.lastFile)) {
          await openFromPath(frontendConfig.lastFile, autoRunFile);
        } else {
          setInit(20);
        }
      } else {
        setInit(20);
      }
    };
    a();

    const getVersion = async () => {
      const version = await get_version();
      setVersion(version);
    }
    getVersion();

    const getNewVersion = async () => {
      const newVersion = await get_new_version();
      setNewVersion(newVersion);
    }
    getNewVersion();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (init === 100 && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveFlow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [init, saveFlow]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };
    
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  const onWorkspaceChange = () => {
    const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace()));
    window.isDirty = xml !== lastSavedXml;
    setIsDirty(xml !== lastSavedXml);
  }

  useEffect(() => {
    const appWindow = getCurrentWindow();
    const unlisten = appWindow.onCloseRequested(async (event) => {
      if (window.isDirty) {
        const confirmed = await confirm("不经保存就退出吗？");
        if (!confirmed) {
          event.preventDefault();
        }
      }
    });
    return () => {
      unlisten.then((off) => off && off());
    };
  });

  if (init === 20) {
    return <OpenSaveProject goSetting={() => {
      setInit(40);
    }} goExport={async () => {
      const bc = await load_backend_config();
      if (!bc.m7_path) {
        alert('三月七小助手源代码路径未设置。');
        return;
      }
      try {
        const uid = await get_account_uid();
        setInit(70);
      } catch (e) {
        alert('获取账号UID失败。');
      }
    }} openFromPath={openFromPath} initFromTemaplate={initFromTemaplate} version={version} newVersion={newVersion} />;
  }

  if (init === 30) {
    return <AppConfig backToEditor={() => {
      setInit(100);
    }} />;
  }
  if (init === 40) {
    return <AppConfig backToEditor={() => {
      setInit(20);
    }} />;
  }
  if (init === 70) {
    return <div className='scrollRoot'> <AppExport backToOpenSaveProject={() => {
      setInit(20);
    }} /> </div>;
  }

  if (init === 100) {
    return (
      <div id="boo">
        <div id="top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button disabled={isRunning} onClick={async () => {
            if (window.isDirty) {
              const confirmed = await confirm("不经保存就关闭吗？");
              if (!confirmed) {
                return;
              }
            }
            setIsDirty(false);
            window.isDirty = false;
            frontendConfig.lastFile = '';
            await saveConfig();
            setInit(20);
          }}>
            关闭
          </button>
          <span style={{ color: 'red', fontWeight: 'bold', marginRight: 4 }}>{isDirty ? '*' : ''}</span>
          <input type="text" value={filePath} disabled={true}
            style={{ flexGrow: 1, border: 'none', outline: 'none', backgroundColor: 'transparent' }} />
          
          {/* 下拉菜单 */}
          <div className="dropdown-container" style={{ position: 'relative', marginRight: 8 }}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                padding: '8px 12px',
                /* backgroundColor: '#4a5568', */
                /* color: 'white', */
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              工具
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{ 
                  width: '16px', 
                  height: '16px',
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              >
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </button>
            
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
                minWidth: '220px'
              }}>
                <button
                  onClick={() => handleDropdownAction('m7_launcher')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <polygon points="5,3 19,12 5,21 5,3" />
                  </svg>
                  启动三月七小助手(GUI)
                </button>
                <button
                  onClick={() => handleDropdownAction('better_gi_gui')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <polygon points="5,3 19,12 5,21 5,3" />
                  </svg>
                  启动更好的原神(GUI)
                </button>
                <button
                  onClick={() => handleDropdownAction('zzzod_gui')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <polygon points="5,3 19,12 5,21 5,3" />
                  </svg>
                  启动绝区零一条龙(GUI)
                </button>
                
                {/* 分隔线 */}
                <div style={{
                  height: '1px',
                  backgroundColor: '#e5e7eb',
                  margin: '4px 0'
                }}></div>
                
                <button
                  onClick={() => handleDropdownAction('export_gi_account')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                    <path d="M12 3v12" />
                  </svg>
                  导出原神账号
                </button>
                
                <button
                  onClick={() => handleDropdownAction('import_gi_account')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17,8 12,3 7,8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  导入原神账号
                </button>
                
                <button
                  onClick={() => handleDropdownAction('import_account')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17,8 12,3 7,8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  导入星铁账号
                </button>
                
                <button
                  onClick={() => handleDropdownAction('export_account')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                    <path d="M12 3v12" />
                  </svg>
                  导出星铁账号
                </button>
                
                <button
                  onClick={() => handleDropdownAction('export_zzz_account')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                    <path d="M12 3v12" />
                  </svg>
                  导出绝区零账号
                </button>
                
                <button
                  onClick={() => handleDropdownAction('import_zzz_account')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17,8 12,3 7,8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  导入绝区零账号
                </button>
              </div>
            )}
          </div>
          
          <button onClick={() => {
            saveFlow();
          }}>
            保存
          </button>
          <button disabled={isRunning} onClick={() => {
            setInit(30);
          }}>
            配置
          </button>
          <div className="version-info" onClick={() => {
            open_release_page();
          }}>
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
            <span style={{ color: 'white' }}>v{version}</span>
          </div>
        </div>
        <div className="app-container">
          <div className="editor-container">
            <BlocklyComponent initialXml={fileContent} toolboxXml={toolboxXml} onWorkspaceChange={onWorkspaceChange} />
          </div>
          <div className="controls-container">
            <button onClick={runCode} className="run-button" disabled={isRunning} >
              {isRunning ? '运行中...' : '保存并运行'}
            </button>
            <div className="console">
              {consoleMessages.map((msg, i) => <p key={i}>{msg}</p>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>  </div>
}

export default App;

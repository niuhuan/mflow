import { useState, useEffect } from 'react';
import BlocklyComponent from './components/BlocklyComponent';
import './blocks/customBlocks';
import './blocks/generators';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import './App.css';
import { invoke } from '@tauri-apps/api/core';
import OpenSaveProject from './OpenSaveProject';
import { frontendConfig, loadConfig, saveConfig } from './config';
import { exists, get_account_uid, load_backend_config, readTextFile, writeTextFile, get_version, get_new_version } from './fromTauri';
import { AppConfig } from './AppConfig';
import { AppExport } from './AppExport';

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
      <category name="原神" colour="230">
        <block type="run_better_gi"></block>
      </category>
      <category name="通用" colour="50">
        <block type="wait_seconds">
          <field name="TIME_VALUE">1</field>
          <field name="TIME_UNIT">SECONDS</field>
        </block>
      </category>
      <category name="循环" colour="120">
        <block type="controls_whileUntil"></block>
        <block type="controls_repeat_ext">
          <value name="TIMES">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
        </block>
        <block type="controls_forEach"></block>
      </category>
      <category name="集合" colour="260">
        <block type="lists_create_with"></block>
      </category>
      <category name="逻辑" colour="210">
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
       <category name="文本" colour="160">
        <block type="text"></block>
      </category>
      <sep></sep>
      <category name="变量" colour="%{BKY_VARIABLE_HUE}" custom="VARIABLE"></category>
      <category name="函数" colour="290">
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

  const saveToFile = async (xmlContent) => {
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

  const openFromPath = async (path) => {
    if (!await exists(path)) {
      await writeTextFile(path, initialXml);
    }
    const fileContent = await readTextFile(path);
    setFilePath(path);
    setFileContent(fileContent);
    frontendConfig.lastFile = path;
    await saveConfig();
    setInit(100);
  }

  const initFromTemaplate = async (path, template) => {
    await writeTextFile(path, template);
    const fileContent = await readTextFile(path);
    setFilePath(path);
    setFileContent(fileContent);
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

    const cfg = await load_backend_config();
    if (!cfg.m7_source_path) {
      log('执行失败: 三月七小助手源代码路径未设置。');
      setIsRunning(false);
      return;
    }

    const loadAccount = async (name) => {
      log('加载账号数据: ' + name);
      await invoke('load_account', { name: name });
    }
    window['loadAccount'] = loadAccount;

    const saveAccount = async (name) => {
      log('保存账号数据: ' + name);
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

    const dailyMission = async () => {
      log('执行每日任务...');
      await invoke('daily_mission');
    }
    window['dailyMission'] = dailyMission;

    const refreshStamina = async () => {
      log('刷体力...');
      await invoke('refresh_stamina');
    }
    window['refreshStamina'] = refreshStamina;

    const simulatedUniverse = async () => {
      log('执行模拟宇宙...');
      await invoke('simulated_universe');
    }
    window['simulatedUniverse'] = simulatedUniverse;

    const farming = async () => {
      log('锄大地...');
      await invoke('farming');
    }
    window['farming'] = farming;

    const closeGame = async () => {
      log('关闭游戏...');
      await invoke('close_game');
    }
    window['closeGame'] = closeGame;

    const runBetterGi = async () => {
      log('运行BetterGI一条龙...');
      await invoke('run_better_gi');
    }
    window['runBetterGi'] = runBetterGi;

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

  useEffect(() => {
    var a = async () => {
      await loadConfig();
      if (frontendConfig.lastFile) {
        if (await exists(frontendConfig.lastFile)) {
          await openFromPath(frontendConfig.lastFile);
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

  if (init === 20) {
    return <OpenSaveProject goSetting={() => {
      setInit(40);
    }} goExport={async () => {
      const bc = await load_backend_config();
      if (!bc.m7_source_path) {
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
            frontendConfig.lastFile = '';
            await saveConfig();
            setInit(20);
          }}>
            关闭
          </button>
          <input type="text" value={filePath} disabled={true}
            style={{ flexGrow: 1, border: 'none', outline: 'none', backgroundColor: 'transparent' }} />
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
        </div>
        <div className="app-container">
          <div className="editor-container">
            <BlocklyComponent initialXml={fileContent} toolboxXml={toolboxXml} />
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

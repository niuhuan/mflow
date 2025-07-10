import { useState, useCallback, useEffect } from 'react';
import BlocklyComponent from './components/BlocklyComponent';
import './blocks/customBlocks';
import './blocks/generators';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import './App.css';
import { invoke } from '@tauri-apps/api/core';
import { exists, readFile, writeFile } from '@tauri-apps/plugin-fs';
import OpenSaveProject from './OpenSaveProject';

function App() {

  const initialXml = `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="start_flow" id="start" x="100" y="100"></block>
  </xml>`;

  const toolboxXml = `
    <xml>
      <category name="流程" colour="230">
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
              <field name="TEXT">默认存档</field>
            </shadow>
          </value>
        </block>
        <block type="daily_mission"></block>
        <block type="simulated_universe"></block>
        <block type="farming"></block>
        <block type="wait_seconds">
          <field name="SECONDS">1</field>
        </block>
        <block type="close_game"></block>
      </category>
      <category name="循环" colour="120" name_ch="循环">
        <block type="controls_repeat_ext">
          <value name="TIMES">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
        </block>
        <block type="controls_forEach"></block>
      </category>
      <category name="列表" colour="260">
        <block type="lists_create_with"></block>
      </category>
       <category name="文本" colour="160">
        <block type="text"></block>
      </category>
      <sep></sep>
      <category name="变量" colour="%{BKY_VARIABLE_HUE}" custom="VARIABLE"></category>
    </xml>
  `;

  const [code, setCode] = useState<string>('');
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
  const [init, setInit] = useState<boolean>(false);
  const [filePath, setFilePath] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>(initialXml);

  const saveToFile = async (xmlContent: string) => {
    if (filePath) {
      setConsoleMessages(prev => [...prev, `> 保存到文件: ${filePath}`]);
      await writeFile(filePath, new TextEncoder().encode(xmlContent));
    }
  }

  const initFromPath = async (path: string) => {
    if (!await exists(path)) {
      await writeFile(path, new TextEncoder().encode(initialXml));
    }
    const fileContent = await readFile(path);
    setFilePath(path);
    setFileContent(new TextDecoder().decode(fileContent));
    setInit(true);
  }

  const runCode = async () => {
    const log = (message: string) => {
      setConsoleMessages(prev => [...prev, `> ${message}`]);
    }

    const workspace = Blockly.getMainWorkspace();
    if (!workspace) {
      return;
    }

    const xml = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToText(xml);
    await saveToFile(xmlText);

    const startBlocks = workspace.getBlocksByType('start_flow', false);
    if (startBlocks.length === 0) {
      setConsoleMessages(['> 执行失败: 找不到"开始"积木。']);
      return;
    }
    if (startBlocks.length > 1) {
      setConsoleMessages(['> 执行失败: 只能有一个"开始"积木，请移除多余的。']);
      return;
    }

    const codeToRun = javascriptGenerator.workspaceToCode(workspace);
    setCode(codeToRun);

    setConsoleMessages(prev => [...prev, `> 开始运行...`]);

    const loadAccount = (name: string) => {
      return invoke('load_account', { name });
    }

    const saveAccount = (name: string) => {
      return invoke('save_account', { name });
    }

    const wait = (seconds: number) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          log(`Waited for ${seconds} second(s).`);
          resolve();
        }, seconds * 1000);
      });
    }

    const dailyMission = () => {
      return invoke('daily_mission');
    }

    const simulatedUniverse = () => {
      return invoke('simulated_universe');
    }

    const farming = () => {
      return invoke('farming');
    }

    const closeGame = () => {
      return invoke('close_game');
    }

    const execute = async () => {
      try {
        await eval(`(async () => { ${codeToRun} })()`);
        log('运行结束。');
      } catch (e: any) {
        log(`运行出错: ${e.message}`);
      }
    }

    execute();
  };


  if (!init) {
    return <OpenSaveProject initFromPath={initFromPath} />;
  }

  return (
    <div className="app-container">
      <div className="editor-container">
        <BlocklyComponent initialXml={fileContent} toolboxXml={toolboxXml} />
      </div>
      <div className="controls-container">
        <button onClick={runCode} className="run-button">运行</button>
        <div className="console">
          {consoleMessages.map((msg, i) => <p key={i}>{msg}</p>)}
        </div>
      </div>
    </div>
  );
}

export default App;

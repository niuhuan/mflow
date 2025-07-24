import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly/core';
import * as zhHans from 'blockly/msg/zh-hans';
import 'blockly/blocks';
import 'blockly/javascript';

Blockly.setLocale(zhHans);

const BlocklyComponent = ({ initialXml, toolboxXml, onWorkspaceChange }) => {
  const blocklyDiv = useRef(null);
  const primaryWorkspace = useRef(null);

  useEffect(() => {
    if (blocklyDiv.current && !primaryWorkspace.current) {
      primaryWorkspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxXml,
      });

      if (initialXml) {
        Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(initialXml), primaryWorkspace.current);
      }
    }

     return () => {
      if (primaryWorkspace.current) {
        primaryWorkspace.current.dispose();
        primaryWorkspace.current = null;
      }
    };
  }, [initialXml, toolboxXml]);

  useEffect(() => {
    if (!primaryWorkspace.current) return;
    const changeListener = () => {
      console.log('changeListener');
      if (onWorkspaceChange) {
        onWorkspaceChange(
          Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(primaryWorkspace.current))
        );
      }
    }
    
    if (onWorkspaceChange) {
      primaryWorkspace.current.addChangeListener(changeListener);
    }
    return () => {
      if (primaryWorkspace.current) {
        primaryWorkspace.current.removeChangeListener(changeListener);
      }
    };
  }, [onWorkspaceChange]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <div ref={blocklyDiv} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default BlocklyComponent; 
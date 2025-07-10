import { javascriptGenerator, Order } from 'blockly/javascript';

javascriptGenerator.forBlock['start_flow'] = function(block) {
  // This block is just a starting point, it generates no code itself.
  // The engine will automatically continue with the next block.
  return '';
};

javascriptGenerator.forBlock['load_account'] = function(block) {
  var accountName = javascriptGenerator.valueToCode(block, 'ACCOUNT_NAME', Order.ATOMIC) || "''";
  var code = `await loadAccount(${accountName});\n`;
  return code;
};

javascriptGenerator.forBlock['request_account_info'] = function(block) {
  var code = 'requestAccountInfo();\n';
  return code;
};

javascriptGenerator.forBlock['save_account'] = function(block) {
  var saveName = javascriptGenerator.valueToCode(block, 'SAVE_NAME', Order.ATOMIC) || "''";
  return `await saveAccount(${saveName});\n`;
};

javascriptGenerator.forBlock['wait_seconds'] = function(block) {
  var seconds = block.getFieldValue('SECONDS');
  return `await wait(${seconds});\n`;
};

javascriptGenerator.forBlock['daily_mission'] = function(block) {
  return 'await dailyMission();\n';
};

javascriptGenerator.forBlock['simulated_universe'] = function(block) {
  return 'await simulatedUniverse();\n';
};

javascriptGenerator.forBlock['farming'] = function(block) {
  return 'await farming();\n';
}; 
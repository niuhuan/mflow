import * as Blockly from 'blockly/core';

Blockly.defineBlocksWithJsonArray([
  {
    "type": "start_flow",
    "message0": "开始",
    "nextStatement": null,
    "colour": 230,
    "tooltip": "流程的开始节点",
    "helpUrl": ""
  },
  {
    "type": "load_account",
    "message0": "加载账号 %1",
    "args0": [
      {
        "type": "input_value",
        "name": "ACCOUNT_NAME",
        "check": "String"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "根据账号名称加载一个账号",
    "helpUrl": ""
  },
  {
    "type": "request_account_info",
    "message0": "请求账号信息",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 20,
    "tooltip": "请求当前已加载账号的信息",
    "helpUrl": ""
  },
  {
    "type": "save_account",
    "message0": "保存账号为 %1",
    "args0": [
      {
        "type": "input_value",
        "name": "SAVE_NAME",
        "check": "String"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "将当前状态保存为指定名称的存档",
    "helpUrl": ""
  },
  {
    "type": "wait_seconds",
    "message0": "等待 %1 秒",
    "args0": [
      {
        "type": "field_number",
        "name": "SECONDS",
        "value": 1,
        "min": 0
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 50,
    "tooltip": "暂停流程指定的时间",
    "helpUrl": ""
  },
  {
    "type": "daily_mission",
    "message0": "每日任务",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 290,
    "tooltip": "执行每日任务流程",
    "helpUrl": ""
  },
  {
    "type": "simulated_universe",
    "message0": "模拟宇宙",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 290,
    "tooltip": "执行模拟宇宙流程",
    "helpUrl": ""
  },
  {
    "type": "farming",
    "message0": "锄大地",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 290,
    "tooltip": "执行锄大地流程",
    "helpUrl": ""
  }
]); 
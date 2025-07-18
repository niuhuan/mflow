# 三月七小助手工作流

三月七小助手、更好的原神、绝区零一条龙工作流编排工具。主要解决多账号多游戏任务编排问题。支持 原神、崩坏 - 星穹铁道 、绝区零。


#### 相关项目

- [三月七小助手(March7thAssistant)](https://github.com/moesnow/March7thAssistant)
- [更好的原神(BetterGI)](https://github.com/babalae/better-genshin-impact)
- [绝区零一条龙(ZenlessZoneZero-OneDragon)](https://github.com/OneDragon-Anything/ZenlessZoneZero-OneDragon)

## 教程

1. 将 三月七小助手完整版、更好的原神、绝区零一条龙完整带运行时版 下载安装好后分别运行一次，确保无误。
2. 三月七小助手、更好的原神 设置成任务结束时关闭程序和游戏，绝区零一条龙设置成运行后关闭游戏。
3. 开启程序后设置三月七小助手文件夹路径，更好的原神安装文件夹路径, 绝区零一条龙安装后的文件夹路径。
4. （可选，多账户时使用）导出星铁账户，多个账户可以清除注册表重新登录星铁，完全进入游戏后关闭游戏，再次导出。原神同理。
5. 使用多游戏或多账户模板新建一个工程，调配好账户名称和积木，点击运行。

## 注意事项

1. 导出导入账号时会同时备份和恢复三月七小助手和更好的原神的配置文件。
2. 导出账户前，请将三月七小助手和更好的原神均设置为运行结束退出游戏和程序。
3. 导出星铁账户前请设置延续自动战斗。

## 截图

![templates.png](images/templates.png)

![single.png](images/single.png)

![main.png](images/main.png)

## 开发

### 环境

- python 3.13
- node 22 , yarn
- rust 1.85.0-nightly (14ee63a3c 2024-12-29)
- [三月七小助手FULL](https://github.com/moesnow/March7thAssistant)
- [更好的原神](https://bettergi.com/download.html)
- [绝区零一条龙](https://github.com/OneDragon-Anything/ZenlessZoneZero-OneDragon/releases)

### 开发环境启动

```
yarn cmd
```


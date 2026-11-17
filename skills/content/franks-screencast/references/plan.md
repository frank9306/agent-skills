# 计划与运行

首版支持 Windows 窗口，依赖已安装 franks-bot 0.2.6、FFmpeg/ffprobe（libx264、subtitles/libass）、Pillow>=11.2.1 及 Python 3.10+。`edge-tts` 使用在线服务，不能离线；网络失败即停止，不自动换成系统声音。可在隔离环境运行 `uv run --with edge-tts==7.3.1 --with pillow --with websocket-client python <技能目录>/scripts/screencast.py --plan <计划.json> --output <新目录>`。有视觉降级时按 franks-bot 文档加载其 OCR/模板依赖。

`--bot-path` 可指定任意位置的 franks-bot Skill，默认 `~/.codex/skills/franks-bot`。输入计划中的 target 与 steps 沿用其会话格式，选择器须来自当次观察。录制运行不创建、迁移或启动浏览器资料。Chromium 模式还需 `target.window` 的 HWND/PID/executable 供窗口捕获；授权发生一次，后续场景共用连接。连接失效停止任务。

```json
{
  "target": {"kind": "windows", "windowId": 123, "processId": 456, "executable": "C:/path/product.exe"},
  "voice": "zh-CN-YunyangNeural",
  "rate": "+0%",
  "scenes": [{
    "id": "search",
    "narration": "在搜索框输入会话名称，即可查找归档会话。",
    "durationSeconds": 10,
    "steps": [{"id": "type-name", "action": "type", "text": "星河",
      "target": {"name": "搜索归档会话", "kind": "Edit"},
      "expect": {"name": "搜索归档会话", "kind": "Edit", "equals": "星河"}, "capture": true}]
  }]
}
```

`durationSeconds` 是该段成片长度；省略时按“实际操作时间＋0.3秒＋音频时长＋0.4秒”决定。设置过短会拒绝合成，不裁掉旁白。若要30秒，先把文案拆为3段并给每段10秒，保留操作耗时余量。脚本生成语音后会先检查基本容量；操作耗时导致超长仍会报错。

字幕建议每段文案分成短句（每句约15–25个汉字），方便按真实 SentenceBoundary 对齐；不以字数猜语速。捕获线程以 per-monitor-v2 DPI 模式按 HWND 采集完整窗口，首张实际帧建立高精度时钟；15fps采集再编码为30fps成片（不把编码延迟当作录制起点），旁白在动作核验后再等0.3秒，按同一偏移合成音频和字幕。原始动作视频保留，不通过伪造截图遮掩失败。

结果目录包含各场景 `raw.mp4`、`voice.mp3`、`speech.json`、`actions.jsonl`、`scene.mp4`；总成片 `demo.mp4`、`subtitles.srt`、`narration.wav`、`timeline.json`、`manifest.json`、`verification.json`。失败写 `failure.json`，不生成成功成片。默认1280×720、30fps、H.264/AAC；按比例留边，字幕烧录在画面下方。原录制不包含麦克风或系统声音。

验收时从时间轴取每段 `videoStart + speechStart`，在字幕出现后抽帧核对实际产品状态，检查语音是否完整、字幕是否挡住目标。日志中的句边界表示语音服务给出的时间；录屏起点仍有帧级捕获误差，不承诺采样级同步。HWND捕获不包含系统光标与窗口外浮层；需要突出操作时由产品状态变化呈现，首版不额外绘制鼠标。采集间隔超过300ms、窗口尺寸/DPI改变或窗口消失即停止。Win32窗口录制可能不适用于受保护或特殊GPU窗口，出现黑屏时应停止并说明，不扩大到全桌面录制。

依据：[edge-tts](https://github.com/rany2/edge-tts)、[Pillow HWND捕获](https://pillow.readthedocs.io/en/stable/reference/ImageGrab.html)、[字幕滤镜](https://ffmpeg.org/ffmpeg-filters.html#subtitles-1)。

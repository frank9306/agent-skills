# franks-bot 隐藏桌面预览

Windows x64 采集器按隐藏测试桌面的窗口坐标和顺序合成画面。它向本机播放器提供最高 3840×2160 的连续画面。鼠标点击和键盘输入动效写入直播帧及录像。播放器使用 Go、MyGo 和 WebView2，测试完成后用 FFmpeg 保存 H.264 MP4 及步骤索引。

## Windows 构建

准备 Go 1.27.3、适用于 Vite 的 Node.js/npm，以及包含 x64 `windres` 的 GNU Binutils。播放器运行需要 WebView2。录像编码使用带 `libx264` 的 FFmpeg。

在本目录运行 `powershell -NoProfile -File build.ps1`。脚本生成品牌图标、构建界面，并把 `desktop-capture.exe` 和 `desktop-player.exe` 放到父级 Skill 目录的 `bin/`。可以用 `-OutputDirectory` 指定其他目录。随后可运行 `go test ./...` 和 `go vet ./...`。将 `ffmpeg.exe` 放入 PATH 后，Go 测试同时检查实时帧、录像编码与重新打开录像。

## 使用

franks-bot 为用户明确选用的隐藏用例配置 `preview` 后启动采集。测试和回放入口见[会话执行参考](../references/session.md)。已有录像可用 `desktop-player.exe --replay <录像目录>` 打开。该目录应包含 `replay.mp4` 和 `session.json`。

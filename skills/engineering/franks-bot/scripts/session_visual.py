import asyncio
import json
from pathlib import Path
import subprocess
import sys
import time

SCRIPTS = Path(__file__).resolve().parent


async def recognize(path, language):
    from PIL import Image
    from winrt.windows.globalization import Language
    from winrt.windows.graphics.imaging import BitmapAlphaMode, BitmapPixelFormat, SoftwareBitmap
    from winrt.windows.media.ocr import OcrEngine
    from winrt.windows.security.cryptography import CryptographicBuffer

    engine = OcrEngine.try_create_from_language(Language(language))
    if engine is None:
        raise RuntimeError(f"OCR language {language} unavailable")
    with Image.open(path) as image:
        data = CryptographicBuffer.create_from_byte_array(image.convert("RGBA").tobytes("raw", "BGRA"))
        bitmap = SoftwareBitmap.create_copy_from_buffer(data, BitmapPixelFormat.BGRA8, *image.size, BitmapAlphaMode.IGNORE)
    result = await engine.recognize_async(bitmap)
    lines = []
    for line in result.lines:
        words = list(line.words)
        for start in range(len(words)):
            for end in range(start + 1, len(words) + 1):
                span = words[start:end]
                left = min(word.bounding_rect.x for word in span)
                top = min(word.bounding_rect.y for word in span)
                right = max(word.bounding_rect.x + word.bounding_rect.width for word in span)
                bottom = max(word.bounding_rect.y + word.bounding_rect.height for word in span)
                lines.append(("".join(word.text for word in span), (left, top, right, bottom)))
    return lines


def template_candidates(path, template, threshold):
    import cv2
    import numpy as np

    def read(file):
        return cv2.imdecode(np.frombuffer(file.read_bytes(), np.uint8), cv2.IMREAD_GRAYSCALE)

    image, sample = read(path), read(template)
    height, width = sample.shape
    if (height > image.shape[0] or width > image.shape[1] or sample.std() < 1):
        return []
    score = cv2.matchTemplate(image, sample, cv2.TM_CCOEFF_NORMED)
    _, first, _, (x, y) = cv2.minMaxLoc(score)
    if first < threshold:
        return []
    score[max(0, y - height // 2):y + height // 2 + 1, max(0, x - width // 2):x + width // 2 + 1] = -1
    _, second, _, (xx, yy) = cv2.minMaxLoc(score)
    matches = [(x, y, x + width, y + height)]
    if second >= threshold and first - second < 0.04:
        matches.append((xx, yy, xx + width, yy + height))
    return matches


class VisualSearch:
    def visual_locate(self, step, output, report):
        config = step["target"].get("visual")
        if not config:
            return None
        from PIL import Image, ImageChops

        path = output / (step["id"] + "-visual.png")
        source = self.snapshot(path)
        with Image.open(path) as captured:
            width, height = captured.size
        candidates = []

        def location(box, by, verify=False):
            x1, y1, x2, y2 = box
            if not (0 <= x1 < x2 <= width and 0 <= y1 < y2 <= height):
                raise ValueError("Visual match lies outside its screenshot")
            current = source
            if verify:
                fresh = path.with_name(path.stem + "-verified.png")
                current = self.snapshot(fresh)
                if source.get("viewport") != current.get("viewport"):
                    raise ValueError("Viewport changed after visual selection")
                region = tuple(int(val) for val in box)
                with Image.open(path) as old, Image.open(fresh) as new:
                    if old.size != new.size or ImageChops.difference(
                            old.crop(region).convert("RGB"), new.crop(region).convert("RGB")).getbbox():
                        raise ValueError("Selected pixels changed before dispatch")
            x, y = (x1 + x2) / 2, (y1 + y2) / 2
            if "Observation" in current:
                return {"by": by, "Observation": current["Observation"], "X": int(x), "Y": int(y)}
            viewport = current["viewport"]
            return {"by": by, "x": x * viewport["width"] / width, "y": y * viewport["height"] / height}

        for by in ("OCR", "template"):
            start = time.perf_counter()
            try:
                if by == "OCR" and "text" in config:
                    wanted = "".join(config["text"].split()).casefold()
                    boxes = [box for text, box in asyncio.run(recognize(path, config.get("language", "zh-CN")))
                             if text.casefold() == wanted]
                elif by == "template" and "template" in config:
                    boxes = template_candidates(path, Path(config["template"]), config.get("templateThreshold", 0.9))
                else:
                    continue
                report(by, round((time.perf_counter() - start) * 1000, 2), "hit" if len(boxes) == 1 else "miss")
                if len(boxes) == 1:
                    return location(boxes[0], by)
                candidates.extend(box for box in boxes if box not in candidates)
            except (ImportError, OSError, RuntimeError) as exc:
                report(by, round((time.perf_counter() - start) * 1000, 2), type(exc).__name__)

        if candidates and config.get("allowRemoteVision"):
            start = time.perf_counter()
            # Normalize the remote screenshot while retaining the original coordinates locally.
            from PIL import ImageDraw, ImageFont
            marked = path.with_name(path.stem + "-choices.png")
            with Image.open(path) as raw:
                raw = raw.convert("RGB")
                raw.thumbnail((1568, 1568))
                canvas = Image.new("RGB", (max(280, raw.width), max(280, raw.height)), "#15181c")
                canvas.paste(raw, (0, 0))
                draw = ImageDraw.Draw(canvas)
                font = ImageFont.truetype("arial.ttf", 18)
                for index, box in enumerate(candidates[:12]):
                    left, top, right, bottom = (box[0]*raw.width/width, box[1]*raw.height/height,
                                                box[2]*raw.width/width, box[3]*raw.height/height)
                    draw.rectangle((left, top, right, bottom), outline="#ffdd33", width=2)
                    label_x, label_y = max(0, left-26), max(0, top-22)
                    draw.rectangle((label_x, label_y, label_x+25, label_y+22), fill="#ffdd33")
                    draw.text((label_x+2, label_y), str(index + 1), font=font, fill="black")
                canvas.save(marked)
            choices = {"goal": config.get("goal", step["id"]), "progress": "Select a numbered control in the displayed window.",
                       "candidates": {"no_match": "No appropriate control",
                                      **{f"candidate_{i}": f"Target inside yellow rectangle numbered {i+1}, "
                                           f"center at {100*(candidates[i][0]+candidates[i][2])/2/width:.1f}% from left, "
                                           f"{100*(candidates[i][1]+candidates[i][3])/2/height:.1f}% from top of application."
                                           for i in range(min(12, len(candidates)))}}}
            request = path.with_name(path.stem + "-jev.json")
            request.write_text(json.dumps(choices), encoding="utf-8")
            try:
                result = subprocess.run([sys.executable, str(SCRIPTS / "jev-next.py"), str(marked), str(request)],
                                        capture_output=True, text=True, timeout=3)
                answer = json.loads(result.stdout)
                choice = answer.get("choice")
                request.with_name(request.stem + "-answer.json").write_text(json.dumps(answer), encoding="utf-8")
                report("Jev", round((time.perf_counter() - start) * 1000, 2), choice or answer.get("reason", "invalid-response"))
                if choice in choices["candidates"] and choice != "no_match":
                    return location(candidates[int(choice.rsplit("_", 1)[-1])], "Jev", verify=True)
            except (subprocess.TimeoutExpired, ValueError):
                report("Jev", round((time.perf_counter() - start) * 1000, 2), "timeout-or-invalid")
        else:
            report("Jev", 0, "no-candidates" if not candidates else "remote-disabled")

        # Invoke the current agent through an explicit scratch directory hand-off.
        if config.get("aiReplyMs", 0):
            started = time.perf_counter()
            reply = path.with_name(path.stem + "-reply.json")
            request = path.with_name(path.stem + "-request.json")
            request.write_text(json.dumps({"image": str(path), "step": step["id"], "goal": config.get("goal"),
                                           "reply": str(reply), "format": {"box": ["left", "top", "right", "bottom"]}}),
                               encoding="utf-8")
            print(f"Vision requested: {request}", file=sys.stderr, flush=True)
            deadline = time.perf_counter() + config["aiReplyMs"] / 1000
            while time.perf_counter() < deadline:
                check_cancelled = getattr(self, "check_cancelled", None)
                if check_cancelled:
                    check_cancelled()
                if reply.is_file():
                    try:
                        data = json.loads(reply.read_text(encoding="utf-8"))
                    except json.JSONDecodeError:
                        pass
                    else:
                        report("AI screenshot", round((time.perf_counter() - started) * 1000, 2), "reply")
                        if data.get("box"):
                            return location(data["box"], "AI screenshot", verify=True)
                        return None
                time.sleep(0.05)
            report("AI screenshot", round((time.perf_counter() - started) * 1000, 2), "timeout")
        return None

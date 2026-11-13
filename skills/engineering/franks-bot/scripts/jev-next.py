"""Select one desktop action. UI input is always handled by desktop.ps1."""

import argparse
import base64
import json
import os
from pathlib import Path
import sys
from urllib.error import URLError
from urllib.request import Request, urlopen


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("screenshot", type=Path)
    parser.add_argument("decision", type=Path, help="JSON with goal, progress, and candidates")
    parser.add_argument("--simulate-failure", action="store_true", help="Inject a local timeout for testing")
    args = parser.parse_args()
    try:
        decision = json.loads(args.decision.read_text(encoding="utf-8"))
        candidates = decision["candidates"]
        if not isinstance(candidates, dict) or "no_match" not in candidates or len(candidates) < 2:
            raise ValueError("Provide candidate IDs with descriptions, including no_match.")
        key = os.environ["TYPESAFE_API_KEY"]
        screenshot = base64.b64encode(args.screenshot.read_bytes()).decode("ascii")
        payload = {
            "model": "jev-latest",
            "state": {"view": "window-frame", "goal": decision["goal"], "progress": decision["progress"]},
            "assets": {"window-frame": {"type": "image", "format": "png", "data_base64": screenshot}},
            "questions": {"next": {
                "type": "choice",
                "instructions": "Use the current screenshot and confirmed progress to choose the next single action for the goal. Choose no_match if none fits.",
                "criteria": candidates,
            }},
        }
        request = Request(
            "https://api.typesafe.ai/v1/systemone",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json",
                     "TypeSafe-Danger-Zone-Images": "true"},
        )
        if args.simulate_failure:
            raise TimeoutError("Injected Jev timeout; no request sent")
        with urlopen(request, timeout=15) as response:
            answer = json.load(response)["answers"]["next"]
        choice = answer["choice"]
        if answer["type"] != "choice" or choice not in candidates or choice == "no_match":
            raise ValueError("Jev returned no usable choice.")
        print(json.dumps({"choice": choice, "confidence": answer.get("confidence")}))
    except (OSError, URLError, ValueError, KeyError, TypeError) as error:
        print(json.dumps({"fallback": True, "reason": str(error)}))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

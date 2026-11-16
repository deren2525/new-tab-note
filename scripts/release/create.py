"""Publish release notes from a merged develop-to-main PR."""

import json
import os
import re
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen


def section(body, heading):
    match = re.search(
        rf"^##[ \t]+{re.escape(heading)}[ \t]*\n(.*?)(?=^##[ \t]|\Z)",
        body.replace("\r\n", "\n"),
        re.MULTILINE | re.DOTALL,
    )
    return match.group(1).strip() if match else ""


def prepare_release(event, config, template):
    pr = event["pull_request"]
    if not (
        pr["merged"]
        and pr["base"]["ref"] == "main"
        and pr["head"]["ref"] == "develop"
        and pr["head"]["repo"]["full_name"] == event["repository"]["full_name"]
    ):
        raise ValueError("Expected a merged develop-to-main PR from this repository")
    if not pr.get("merge_commit_sha"):
        raise ValueError("Missing PR merge commit SHA")
    # Ignore comments so an old commented-out version cannot become a release.
    config = re.sub(r"/\*.*?\*/|//[^\n]*", "", config, flags=re.DOTALL)
    version = re.search(
        r"\bmanifest\s*:\s*\{[^{}]*?\bversion\s*:\s*['\"](\d+\.\d+\.\d+)['\"]",
        config,
        re.DOTALL,
    )
    if not version:
        raise ValueError("Cannot read manifest.version from wxt.config.ts")
    changes = section(pr["body"] or "", "リリース内容")
    if not changes:
        raise ValueError("Release PR must contain a nonempty リリース内容 section")
    # Only include actual PR entries, never a 'none' placeholder.
    entries = [
        line for line in section(pr["body"], "対象PR").splitlines()
        if re.match(r"^\s*[-*]\s+(?:#\d+\b|\[#\d+\]\()", line)
    ]
    if "{{changes}}" not in template:
        raise ValueError("Release notes template must contain {{changes}}")
    unknown = re.sub(r"{{(?:changes|pull_requests|#pull_requests|/pull_requests)}}", "", template)
    if "{{" in unknown or "}}" in unknown:
        raise ValueError("Unknown release notes template placeholder")
    notes = re.sub(
        r"{{#pull_requests}}(.*?){{/pull_requests}}",
        lambda match: match.group(1) if entries else "",
        template,
        flags=re.DOTALL,
    )
    # Validate template placeholders before inserting arbitrary Markdown content.
    if re.search(r"{{.*?}}", notes.replace("{{changes}}", "").replace("{{pull_requests}}", "")):
        raise ValueError("Unknown or unmatched release notes template placeholder")
    values = {"changes": changes, "pull_requests": "\n".join(entries)}
    notes = re.sub(r"{{(changes|pull_requests)}}", lambda match: values[match.group(1)], notes)
    tag = "v" + version.group(1)
    return {
        "tag_name": tag,
        "name": tag,
        "target_commitish": pr["merge_commit_sha"],
        "body": notes.strip() + "\n",
    }


def api(path, payload=None):
    request = Request(
        f"{os.environ.get('GITHUB_API_URL', 'https://api.github.com')}{path}",
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={
            "Authorization": f"Bearer {os.environ['GH_TOKEN']}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
        },
    )
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def publish(repository, payload):
    releases = f"/repos/{repository}/releases"
    try:
        existing = api(f"{releases}/tags/{payload['tag_name']}")
    except HTTPError as error:
        if error.code != 404:
            raise
    else:
        print(f"Release already exists; leaving unchanged: {existing['html_url']}")
        return
    # target_commitish does not change an existing tag: reject a different target.
    try:
        tagged = api(f"/repos/{repository}/commits/{payload['tag_name']}")
    except HTTPError as error:
        if error.code != 404:
            raise
    else:
        if tagged["sha"] != payload["target_commitish"]:
            raise ValueError("Existing release tag points to a different commit")
    release = api(releases, payload)
    print(f"Created release: {release['html_url']}")


if __name__ == "__main__":
    event = json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text())
    payload = prepare_release(
        event,
        Path("wxt.config.ts").read_text(),
        Path(".github/release-notes-template.md").read_text(),
    )
    publish(event["repository"]["full_name"], payload)

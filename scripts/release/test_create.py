import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError

from create import prepare_release, publish


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.event = {
            "repository": {"full_name": "owner/repo"},
            "pull_request": {
                "merged": True,
                "base": {"ref": "main"},
                "head": {"ref": "develop", "repo": {"full_name": "owner/repo"}},
                "merge_commit_sha": "merged-sha",
                "body": "## リリース内容\n- 修正\n\n## 確認内容\n- CI成功\n",
            },
        }
        self.config = "export default { manifest: { version: '2.5.0' } }"
        self.template = (Path(__file__).resolve().parents[2] / ".github/release-notes-template.md").read_text()

    def prepare(self):
        return prepare_release(self.event, self.config, self.template)

    def test_notes_exclude_internal_verification_and_use_merge_commit(self):
        payload = self.prepare()
        self.assertEqual(payload["body"], "## 変更内容\n\n- 修正\n")
        self.assertEqual(payload["tag_name"], "v2.5.0")
        self.assertEqual(payload["target_commitish"], "merged-sha")

    def test_related_prs_and_crlf(self):
        self.event["pull_request"]["body"] += "\n## 対象PR\n- #12 修正\n- [#13](https://example.com) 更新\n"
        self.event["pull_request"]["body"] = self.event["pull_request"]["body"].replace("\n", "\r\n")
        self.assertIn("## 関連PR\n\n- #12 修正", self.prepare()["body"])
        self.assertIn("- [#13]", self.prepare()["body"])

    def test_empty_pr_section_is_omitted(self):
        self.event["pull_request"]["body"] += "\n## 対象PR\n- なし\n"
        self.assertNotIn("関連PR", self.prepare()["body"])
        self.assertNotIn("なし", self.prepare()["body"])

    def test_missing_changes_and_wrong_branch_are_rejected(self):
        self.event["pull_request"]["body"] = "## 確認内容\nCI成功"
        with self.assertRaises(ValueError):
            self.prepare()
        self.event["pull_request"]["head"]["ref"] = "feature"
        with self.assertRaises(ValueError):
            self.prepare()

    @patch("create.api")
    def test_existing_release_is_not_overwritten(self, api):
        api.return_value = {"html_url": "existing"}
        publish("owner/repo", self.prepare())
        self.assertEqual(api.call_count, 1)

    @patch("create.complete_release_notes", new=lambda repository, payload: payload["body"])
    @patch("create.api")
    def test_missing_release_is_created_but_auth_errors_fail(self, api):
        payload = self.prepare()
        api.side_effect = [HTTPError("url", 404, "missing", {}, None), HTTPError("url", 404, "missing tag", {}, None), {"html_url": "new"}]
        publish("owner/repo", payload)
        api.assert_called_with("/repos/owner/repo/releases", payload)
        api.side_effect = HTTPError("url", 403, "forbidden", {}, None)
        with self.assertRaises(HTTPError):
            publish("owner/repo", payload)


    def test_invalid_version_and_missing_merge_commit_fail(self):
        for config in ["", "manifest: { version: 'invalid' }", "// manifest: { version: '1.0.0' }", "manifest: {}, other: { version: '9.9.9' }"]:
            with self.subTest(config=config), self.assertRaises(ValueError):
                prepare_release(self.event, config, self.template)
        self.event["pull_request"]["merge_commit_sha"] = None
        with self.assertRaises(ValueError):
            self.prepare()

    def test_invalid_events_fail(self):
        for key, value in [("merged", False), ("base", {"ref": "develop"}),
                           ("head", {"ref": "develop", "repo": {"full_name": "fork/repo"}})]:
            with self.subTest(key=key):
                event = {**self.event, "pull_request": {**self.event["pull_request"], key: value}}
                with self.assertRaises(ValueError):
                    prepare_release(event, self.config, self.template)

    def test_missing_or_empty_changes_fail(self):
        for body in [None, "", "## リリース内容\n\n## 確認内容\n- CI成功"]:
            self.event["pull_request"]["body"] = body
            with self.subTest(body=body), self.assertRaises(ValueError):
                self.prepare()

    def test_placeholder_and_direct_commit_explanation_are_omitted(self):
        self.event["pull_request"]["body"] += "\n## 対象PR\n- なし（対象の2コミットはdevelopへの直接コミット）。\n"
        self.assertEqual(self.prepare()["body"], "## 変更内容\n\n- 修正\n")

    def test_template_controls_headings_and_requires_changes(self):
        self.template = "Changes\n{{changes}}\n{{#pull_requests}}Related\n{{pull_requests}}{{/pull_requests}}"
        self.event["pull_request"]["body"] += "\n## 対象PR\n- #12 修正\n"
        self.assertIn("Related\n- #12", self.prepare()["body"])
        self.template = "{{unknown}}"
        with self.assertRaises(ValueError):
            self.prepare()

    def test_markdown_template_expressions_are_preserved(self):
        self.event["pull_request"]["body"] = "## リリース内容\n- Vueの`{{ value }}`を修正"
        self.assertIn("{{ value }}", self.prepare()["body"])

    @patch("create.complete_release_notes", new=lambda repository, payload: payload["body"])
    @patch("create.api")
    def test_existing_tag_must_target_merge_commit(self, api):
        missing = HTTPError("url", 404, "missing", {}, None)
        api.side_effect = [missing, {"sha": "another-sha"}]
        with self.assertRaises(ValueError):
            publish("owner/repo", self.prepare())
        self.assertEqual(api.call_count, 2)
        api.reset_mock()
        api.side_effect = [missing, {"sha": "merged-sha"}, {"html_url": "new"}]
        publish("owner/repo", self.prepare())
        api.assert_called_with("/repos/owner/repo/releases", self.prepare())


    @patch("create.api")
    def test_aggregates_all_release_prs_and_deduplicates_changes(self, api):
        from create import complete_release_notes
        api.side_effect = [
            {"body": "## What's Changed\n* https://github.com/owner/repo/pull/99\n* https://github.com/owner/repo/pull/100\n\n**Full Changelog**: https://github.com/owner/repo/compare/v3.6.0...v3.7.0"},
            {"merged_at": "date", "body": "## リリース内容\n- Node更新\n- 共通\n"},
            {"merged_at": "date", "body": "## リリース内容\n- 自動化\n- 共通\n"},
        ]
        notes = complete_release_notes("owner/repo", self.prepare())
        self.assertIn("- Node更新", notes)
        self.assertIn("- 自動化", notes)
        self.assertEqual(notes.count("- 共通"), 1)
        self.assertIn("## What's Changed", notes)
        self.assertIn("**Full Changelog**: https://", notes)
        self.assertNotIn("## 関連PR", notes)

    @patch("create.api")
    def test_no_structured_pr_content_preserves_current_notes(self, api):
        from create import complete_release_notes
        api.return_value = {"body": "## What's Changed\n"}
        self.assertIn("- 修正", complete_release_notes("owner/repo", self.prepare()))

    @patch("create.api")
    def test_generation_failure_does_not_publish_incomplete_notes(self, api):
        from create import complete_release_notes
        api.side_effect = HTTPError("url", 403, "forbidden", {}, None)
        with self.assertRaises(HTTPError):
            complete_release_notes("owner/repo", self.prepare())


if __name__ == "__main__":
    unittest.main()

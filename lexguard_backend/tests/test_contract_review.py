import asyncio
import io
import json
import os
import sys
import unittest
import zipfile
from dataclasses import replace
from pathlib import Path
from unittest.mock import AsyncMock, patch
from xml.sax.saxutils import escape
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import httpx
from fastapi.testclient import TestClient
from pydantic import ValidationError
from config import Settings
from errors import AppError
from main import create_app
from models.schemas import ProviderAnalysis, ReviewContext
from services.chunking import chunk_legal_text
from services.pdf_parser import extract_document, parse_document
from services.unified_analysis import build_super_analysis
from services import providers
from security import AdmissionControl
from utils.helpers import ground_analysis, safe_json_loads, source_span

SOURCE = "SERVICE AGREEMENT\n\nLiability is unlimited.\n\nEither party may terminate on thirty days notice."


def docx(text=SOURCE, extra=""):
    stream = io.BytesIO()
    xml = '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>' + escape(text) + '</w:t></w:r></w:p>' + extra + '</w:body></w:document>'
    with zipfile.ZipFile(stream, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("word/document.xml", xml)
    return stream.getvalue()


def pdf(text):
    stream = ("BT /F1 12 Tf 50 750 Td (" + text + ") Tj ET").encode()
    objects = [b"<< /Type /Catalog /Pages 2 0 R >>", b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream"]
    content, offsets = bytearray(b"%PDF-1.4\n"), [0]
    for i, obj in enumerate(objects, 1):
        offsets.append(len(content))
        content.extend(f"{i} 0 obj\n".encode() + obj + b"\nendobj\n")
    start = len(content)
    content.extend(b"xref\n0 6\n0000000000 65535 f \n")
    for offset in offsets[1:]:
        content.extend(f"{offset:010d} 00000 n \n".encode())
    content.extend(f"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{start}\n%%EOF".encode())
    return bytes(content)


def analysis(quote="Liability is unlimited.", severity="high", score=8, confidence=95):
    return {"summary": "This section includes potentially broad liability.",
        "overall_risk_score": 75, "fairness_score": 30,
        "risk_breakdown": dict(employment=0, privacy=0, financial=80, ip=0, fairness=70),
        "clauses": [{"clause_type": "Financial", "severity": severity, "risk_score": score,
            "original_clause": quote, "plain_english": "Liability has no stated cap.",
            "why_risky": "Potential exposure could exceed the contract value.",
            "real_world_impact": "A claim could create significant financial exposure.",
            "negotiation_tip": "Propose a mutual, proportionate liability cap.",
            "affected_party": "Supplier", "confidence_score": confidence}]}


class ContractTests(unittest.TestCase):
    def test_valid_json_quote_is_never_rewritten(self):
        self.assertEqual(safe_json_loads(json.dumps({"quote": "Pay, } remains due."}))["quote"], "Pay, } remains due.")
        self.assertEqual(safe_json_loads(' ```json\n{"ok": true}\n``` '), {"ok": True})
        for bad in ("[]", '{"x":1,}', "", "false"):
            with self.assertRaises(ValueError):
                safe_json_loads(bad)

    def test_strict_scores_and_required_fields(self):
        for update in ({"overall_risk_score": 200}, {"overall_risk_score": "85%"}, {"fairness_score": -1}, {"clauses": [{}]}):
            with self.assertRaises(ValidationError):
                ProviderAnalysis.model_validate({**analysis(), **update})

    def test_confidence_is_independent_and_zero_is_preserved(self):
        _, clauses = ground_analysis(analysis(severity="low", score=2, confidence=0), SOURCE, 0, [])
        self.assertEqual((clauses[0].risk_score, clauses[0].confidence_score), (2, 0))

    def test_source_grounding_allows_only_whitespace(self):
        self.assertEqual(source_span("Liability is\nunlimited.", "Liability is unlimited."), (0, 23))
        with self.assertRaises(ValueError):
            source_span("The customer may cancel.", "The customer may not cancel.")

    def test_source_offsets_and_ids_are_stable(self):
        _, first = ground_analysis(analysis(), SOURCE, 3, [{"number": 2, "start": 0, "end": 1000}])
        _, second = ground_analysis(analysis(), SOURCE, 3, [])
        self.assertEqual(first[0].clause_id, second[0].clause_id)
        self.assertEqual(first[0].source_page, 2)
        self.assertEqual(first[0].source_start, SOURCE.index("Liability") + 3)

    def test_batches_cover_all_text_short_clauses_and_boundaries(self):
        text = ("A long paragraph about the agreement. " * 2000) + "\nLiability is unlimited.\nEnd."
        batches = chunk_legal_text(text)
        coverage = set()
        for batch in batches:
            self.assertLessEqual(len(batch.text), 20000)
            self.assertEqual(batch.text, text[batch.start:batch.start + len(batch.text)])
            coverage.update(range(batch.start, batch.start + len(batch.text)))
        self.assertEqual(len(coverage), len(text))
        self.assertTrue(any("Liability is unlimited." in batch.text for batch in batches))

    def test_docx_and_pdf_text(self):
        self.assertEqual(extract_document(docx(), ".docx", Settings())["text"], SOURCE)
        self.assertEqual(extract_document(pdf("Liability is unlimited."), ".pdf", Settings())["text"], "Liability is unlimited.")

    def test_empty_and_wrong_format_rejected(self):
        for data, ext in ((b"invalid", ".pdf"), (b"invalid", ".docx"), (docx(""), ".docx")):
            with self.assertRaises(AppError):
                extract_document(data, ext, Settings())

    def test_docx_entities_and_tracked_changes_rejected(self):
        with self.assertRaises(AppError):
            extract_document(docx(extra="<w:del><w:r><w:delText>deleted</w:delText></w:r></w:del>"), ".docx", Settings())
        data = io.BytesIO()
        with zipfile.ZipFile(data, "w") as archive:
            archive.writestr("word/document.xml", '<!DOCTYPE a [<!ENTITY x "EXPAND">]><a>&x;</a>')
        with self.assertRaises(Exception):
            extract_document(data.getvalue(), ".docx", Settings())

    def test_extracted_text_and_expansion_limits(self):
        with self.assertRaises(AppError):
            extract_document(docx("a" * 100), ".docx", replace(Settings(), max_text_chars=50))
        data = io.BytesIO()
        with zipfile.ZipFile(data, "w", zipfile.ZIP_DEFLATED) as archive:
            archive.writestr("word/document.xml", "x" * (2 * 1024 * 1024 + 1))
        with self.assertRaises(AppError):
            extract_document(data.getvalue(), ".docx", Settings())

    def test_admission_limits_and_release(self):
        gate = AdmissionControl(replace(Settings(), max_concurrent=1, hourly_limit=1))
        gate.acquire("one")
        with self.assertRaises(AppError):
            gate.acquire("two")
        gate.active -= 1
        with self.assertRaises(AppError):
            gate.acquire("one")


class AsyncTests(unittest.IsolatedAsyncioTestCase):
    async def test_real_parser_process(self):
        result = await parse_document(docx(), ".docx", Settings())
        self.assertEqual(result["text"], SOURCE)

    async def test_parser_deadline_terminates_process(self):
        import multiprocessing
        before = {p.pid for p in multiprocessing.active_children()}
        with self.assertRaises(AppError) as error:
            await parse_document(docx(), ".docx", replace(Settings(), parser_seconds=0))
        self.assertEqual(error.exception.code, "parser_timeout")
        self.assertEqual({p.pid for p in multiprocessing.active_children()}, before)

    async def test_primary_timeout_reserves_secondary_and_keeps_source(self):
        context = ReviewContext(reviewing_party="Supplier", jurisdiction="Not specified", contract_type="Services")
        async def slow(*args):
            await asyncio.sleep(2)
        with patch.dict(os.environ, {"GEMINI_API_KEY": "test", "OPENROUTER_API_KEY": "test"}), \
             patch.object(providers, "gemini", slow), patch.object(providers, "openrouter", AsyncMock(return_value=analysis())) as secondary:
            async with httpx.AsyncClient() as client:
                result = await build_super_analysis({"text": SOURCE, "pages": [], "warnings": []}, context, "test", client, replace(Settings(), primary_seconds=.01))
            self.assertEqual(result.provider_used, "openrouter")
            self.assertTrue(result.fallback_triggered)
            self.assertEqual(result.extracted_text, SOURCE)
            self.assertEqual(secondary.await_count, 1)

    async def test_no_providers_and_hallucinated_quotes_fail(self):
        context = ReviewContext(reviewing_party="Supplier", jurisdiction="Not specified", contract_type="Services")
        async with httpx.AsyncClient() as client:
            with patch.dict(os.environ, {"GEMINI_API_KEY": "", "OPENROUTER_API_KEY": ""}):
                with self.assertRaises(AppError) as error:
                    await build_super_analysis({"text": SOURCE, "pages": [], "warnings": []}, context, "test", client, Settings())
                self.assertEqual(error.exception.status, 503)
            with patch.dict(os.environ, {"GEMINI_API_KEY": "test", "OPENROUTER_API_KEY": ""}), \
                 patch.object(providers, "gemini", AsyncMock(return_value=analysis("Fabricated clause."))):
                with self.assertRaises(AppError) as error:
                    await build_super_analysis({"text": SOURCE, "pages": [], "warnings": []}, context, "test", client, Settings())
                self.assertEqual(error.exception.status, 502)

    async def test_concurrent_requests_are_independent_and_admission_releases(self):
        app = create_app(replace(Settings(), hourly_limit=100))
        started = asyncio.Event()
        release = asyncio.Event()
        count = 0
        async def controlled(*args):
            nonlocal count
            count += 1
            if count == 2:
                started.set()
            await release.wait()
            return analysis()
        async with httpx.AsyncClient() as provider_client:
            app.state.http = provider_client
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                with patch.dict(os.environ, {"GEMINI_API_KEY": "test", "OPENROUTER_API_KEY": ""}), \
                     patch("routes.analyze.parse_document", AsyncMock(return_value={"text": SOURCE, "pages": [], "warnings": []})), \
                     patch.object(providers, "gemini", controlled):
                    first = asyncio.create_task(client.post("/analyze-contract", files={"file": ("one.docx", docx())}, data={"reviewing_party": "Party one"}))
                    second = asyncio.create_task(client.post("/analyze-contract", files={"file": ("two.docx", docx())}, data={"reviewing_party": "Party two"}))
                    await asyncio.wait_for(started.wait(), 2)
                    excess = await client.post("/analyze-contract", files={"file": ("three.docx", docx())})
                    self.assertEqual(excess.status_code, 429)
                    release.set()
                    a, b = await asyncio.gather(first, second)
                    self.assertEqual(a.json()["context"]["reviewing_party"], "Party one")
                    self.assertEqual(b.json()["context"]["reviewing_party"], "Party two")
                    self.assertNotEqual(a.json()["request_id"], b.json()["request_id"])
                    self.assertEqual(app.state.admission.active, 0)

    async def test_disconnect_cleans_up_both_extraction_and_provider_work(self):
        from fastapi import Request
        for phase in ("parsing", "provider"):
            app = create_app(replace(Settings(), hourly_limit=100))
            cancelled = asyncio.Event()
            async def extraction(*args):
                if phase == "parsing":
                    try:
                        await asyncio.sleep(10)
                    finally:
                        cancelled.set()
                return {"text": SOURCE, "pages": [], "warnings": []}
            async def generation(*args):
                try:
                    await asyncio.sleep(10)
                finally:
                    cancelled.set()
            async with httpx.AsyncClient() as provider_client:
                app.state.http = provider_client
                async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                    with patch.dict(os.environ, {"GEMINI_API_KEY": "test", "OPENROUTER_API_KEY": ""}), \
                         patch("routes.analyze.parse_document", extraction), \
                         patch.object(providers, "gemini", generation), \
                         patch.object(Request, "is_disconnected", AsyncMock(side_effect=[False, True])):
                        response = await client.post("/analyze-contract", files={"file": ("cancel.docx", docx())})
                    self.assertEqual(response.status_code, 499)
                    await asyncio.wait_for(cancelled.wait(), 1)
                    self.assertEqual(app.state.admission.active, 0)
                    self.assertFalse(app.state.parser_lock.locked())

    async def test_provider_wire_contract_uses_system_instruction_and_schema(self):
        payloads = []
        async def handler(request):
            payloads.append(json.loads(request.content))
            return httpx.Response(200, json={"candidates": [{"finishReason": "STOP", "content": {"parts": [{"text": json.dumps(analysis())}]}}]})
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            with patch.dict(os.environ, {"GEMINI_API_KEY": "test"}):
                result = await providers.gemini(client, "trusted system", "untrusted document")
        self.assertEqual(result["clauses"][0]["original_clause"], "Liability is unlimited.")
        self.assertEqual(payloads[0]["systemInstruction"]["parts"][0]["text"], "trusted system")
        self.assertIn("responseJsonSchema", payloads[0]["generationConfig"])
        self.assertEqual(payloads[0]["contents"][0]["parts"][0]["text"], "untrusted document")

    async def test_transient_provider_retry_and_nontransient_no_retry(self):
        for status, attempts in ((429, 2), (401, 1)):
            calls = []
            async def handler(request):
                calls.append(request)
                return httpx.Response(status, json={})
            async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
                with self.assertRaises(ValueError):
                    await providers._post(client, "https://provider.example", {}, {})
            self.assertEqual(len(calls), attempts)


class APITests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(create_app(replace(Settings(), hourly_limit=100, global_hourly_limit=1000)))
        self.client.__enter__()

    def tearDown(self):
        self.client.__exit__(None, None, None)

    def test_health_and_readiness_are_distinct(self):
        self.assertEqual(self.client.get("/health").status_code, 200)
        with patch.dict(os.environ, {"GEMINI_API_KEY": "", "OPENROUTER_API_KEY": ""}):
            self.assertEqual(self.client.get("/ready").status_code, 503)

    def test_invalid_uploads_are_errors_never_sample_findings(self):
        for name, body, status in (("bad.doc", b"x", 415), ("empty.pdf", b"", 422), ("broken.pdf", b"invalid", 422)):
            response = self.client.post("/analyze-contract", files={"file": (name, body)})
            self.assertEqual(response.status_code, status)
            self.assertIn("error", response.json())
            self.assertNotIn("clauses", response.json())

    def test_declared_and_actual_oversize_rejected(self):
        response = self.client.post("/analyze-contract", content=b"small", headers={"Content-Length": str(20 * 1024 * 1024)})
        self.assertEqual(response.status_code, 413)
        response = self.client.post("/analyze-contract", files={"file": ("large.pdf", b"x" * (11 * 1024 * 1024))})
        self.assertEqual(response.status_code, 413)

    def test_api_key_required_before_body_parsing(self):
        with TestClient(create_app(replace(Settings(), api_key="secret"))) as client:
            self.assertEqual(client.post("/analyze-contract", content=b"invalid").status_code, 401)

    def test_unrelated_vercel_origin_is_not_allowed(self):
        response = self.client.options("/analyze-contract", headers={"Origin": "https://unrelated.vercel.app", "Access-Control-Request-Method": "POST"})
        self.assertNotIn("access-control-allow-origin", response.headers)

    def test_successful_upload_has_valid_evidence_context_and_no_mock(self):
        with patch.dict(os.environ, {"GEMINI_API_KEY": "test", "OPENROUTER_API_KEY": ""}), patch.object(providers, "gemini", AsyncMock(return_value=analysis())):
            response = self.client.post("/analyze-contract", files={"file": ("real.docx", docx())}, data={"reviewing_party": "Supplier", "jurisdiction": "India"})
        self.assertEqual(response.status_code, 200, response.text)
        result = response.json()
        self.assertFalse(result["is_demo"])
        self.assertEqual(result["extracted_text"], SOURCE)
        self.assertEqual(result["coverage"]["analyzed_characters"], len(SOURCE))
        self.assertEqual(result["context"]["reviewing_party"], "Supplier")
        clause = result["clauses"][0]
        self.assertEqual(SOURCE[clause["source_start"]:clause["source_end"]], clause["original_clause"])
        self.assertEqual(response.headers["cache-control"], "no-store")
        self.assertEqual(response.headers["x-request-id"], result["request_id"])

    def test_schema_is_exposed_and_fake_progress_removed(self):
        schema = self.client.get("/openapi.json").json()["paths"]["/analyze-contract"]["post"]["responses"]["200"]["content"]["application/json"]["schema"]
        self.assertIn("$ref", schema)
        self.assertEqual(self.client.get("/analyze-status").status_code, 404)

    def test_production_fails_closed_without_service_key(self):
        with self.assertRaises(ValueError):
            create_app(replace(Settings(), production=True))

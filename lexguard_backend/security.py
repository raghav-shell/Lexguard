"""Admission controls run before multipart parsing. Limits are per server process."""
import asyncio
import hashlib
import hmac
import ipaddress
import time
import uuid
from collections import deque
from fastapi.responses import JSONResponse
from config import Settings
from errors import AppError


class AdmissionControl:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.active = 0
        self.clients = {}
        self.total = deque()

    def acquire(self, identity: str):
        now = time.monotonic()
        cutoff = now - 3600
        self.clients = {key: hits for key, hits in self.clients.items() if hits and hits[-1] > cutoff}
        while self.total and self.total[0] <= cutoff:
            self.total.popleft()
        hits = self.clients.setdefault(identity, deque())
        while hits and hits[0] <= cutoff:
            hits.popleft()
        if len(self.clients) > 4096 or len(hits) >= self.settings.hourly_limit or len(self.total) >= self.settings.global_hourly_limit:
            raise AppError(429, "rate_limited", "The hourly analysis limit has been reached. Please try again later.")
        if self.active >= self.settings.max_concurrent:
            raise AppError(429, "server_busy", "The analysis service is busy. Please try again in a moment.")
        hits.append(now)
        self.total.append(now)
        self.active += 1


class RequestGuard:
    def __init__(self, app, settings: Settings, admission: AdmissionControl):
        self.app, self.settings, self.admission = app, settings, admission

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        request_id = uuid.uuid4().hex
        scope.setdefault("state", {})["request_id"] = request_id
        headers = dict(scope["headers"])
        admitted = False

        async def respond(message):
            if message["type"] == "http.response.start":
                message.setdefault("headers", []).extend([
                    (b"x-request-id", request_id.encode()),
                    (b"cache-control", b"no-store"),
                    (b"x-content-type-options", b"nosniff"),
                    (b"referrer-policy", b"no-referrer"),
                ])
            await send(message)

        try:
            if scope["path"] == "/analyze-contract" and scope["method"] == "POST":
                supplied = headers.get(b"x-analysis-key", b"")
                if self.settings.api_key and not hmac.compare_digest(supplied, self.settings.api_key.encode()):
                    raise AppError(401, "unauthorized", "This analysis endpoint requires authorized application access.")
                host = (scope.get("client") or ("unknown",))[0]
                if self.settings.api_key:
                    forwarded = headers.get(b"x-client-ip", b"").decode(errors="replace")
                    try:
                        host = str(ipaddress.ip_address(forwarded))
                    except ValueError:
                        pass
                identity = hashlib.sha256(host.encode()).hexdigest()
                self.admission.acquire(identity)
                admitted = True
                limit = self.settings.max_file_bytes + 128 * 1024
                try:
                    length = int(headers.get(b"content-length", b"0"))
                except ValueError:
                    raise AppError(400, "invalid_length", "The upload length is invalid.") from None
                if length < 0 or length > limit:
                    raise AppError(413, "file_too_large", "Upload a PDF or DOCX of 10 MiB or less.")
                # Bounded pre-read also limits chunked requests before framework spooling.
                body = bytearray()
                async with asyncio.timeout(20):
                    while True:
                        message = await receive()
                        if message["type"] == "http.disconnect":
                            return
                        body.extend(message.get("body", b""))
                        if len(body) > limit:
                            raise AppError(413, "file_too_large", "Upload a PDF or DOCX of 10 MiB or less.")
                        if not message.get("more_body", False):
                            break
                delivered = False

                async def bounded_receive():
                    nonlocal delivered
                    if not delivered:
                        delivered = True
                        return {"type": "http.request", "body": bytes(body), "more_body": False}
                    return await receive()

                return await self.app(scope, bounded_receive, respond)
            return await self.app(scope, receive, respond)
        except TimeoutError:
            response = JSONResponse({"error": {"code": "upload_timeout", "message": "Uploading took too long. Please retry.", "request_id": request_id}}, status_code=408)
            await response(scope, receive, respond)
        except AppError as error:
            response = JSONResponse({"error": {"code": error.code, "message": error.message, "request_id": request_id}}, status_code=error.status, headers={"Retry-After": "60"} if error.status == 429 else None)
            await response(scope, receive, respond)
        finally:
            if admitted:
                self.admission.active -= 1

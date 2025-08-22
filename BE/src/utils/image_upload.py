# BE/src/utils/image_upload.py
import os, uuid, imghdr
from typing import Tuple
from fastapi import UploadFile, HTTPException, status

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = int(os.getenv("IMAGE_MAX_BYTES", str(5 * 1024 * 1024)))


def _ext_from_content(content: bytes) -> str:
    kind = imghdr.what(None, h=content)
    # imghdr는 webp 인식이 약할 수 있음 -> MIME으로 보완
    mapping = {"jpeg": "jpg", "png": "png", "webp": "webp"}
    return mapping.get(kind, "")

# 빈 파일 방지
def _to_web_path(disk_path: str) -> str:    # ⬅️ 추가
    posix = disk_path.replace("\\", "/")
    if posix.startswith(("uploads/", "static/")):
        return "/" + posix
    return "/" + posix if not posix.startswith("/") else posix


async def save_image_local(file: UploadFile, base_dir: str) -> Tuple[str, str]:
    # 1) MIME 1차 체크
    if (file.content_type or "").lower() not in ALLOWED_MIME:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Only jpeg/png/webp allowed")

    os.makedirs(base_dir, exist_ok=True)
    raw = await file.read()
    if not raw:                                  #
        raise HTTPException(status_code=422, detail="Empty file")
    
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 5MB)")

    # 2) 파일 시그니처 기반 2차 체크
    ext = _ext_from_content(raw)
    if not ext:
        # webp는 imghdr가 못잡는 경우 있어서 MIME으로 보완
        if file.content_type == "image/webp":
            ext = "webp"
        else:
            raise HTTPException(status_code=415, detail="Unsupported image content")

    fname = f"{uuid.uuid4().hex}.{ext}"
    disk_path = os.path.join(base_dir, fname)
    with open(disk_path, "wb") as f:
        f.write(raw)

    url_path = _to_web_path(disk_path)
    return disk_path, url_path

# S3 등으로 바꿀 경우 이 함수를 동일 인터페이스로 교체
async def save_image(file: UploadFile, base_dir: str) -> Tuple[str, str]:
    return await save_image_local(file, base_dir)



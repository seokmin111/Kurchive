import os, uuid, imghdr
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
import oci

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = int(os.getenv("IMAGE_MAX_BYTES", str(5 * 1024 * 1024)))

# ============================
# 로컬 저장 유틸
# ============================

def _ext_from_content(content: bytes) -> str:
    kind = imghdr.what(None, h=content)
    mapping = {"jpeg": "jpg", "png": "png", "webp": "webp"}
    return mapping.get(kind, "")

def _to_web_path(disk_path: str) -> str:
    posix = disk_path.replace("\\", "/")
    if posix.startswith(("uploads/", "static/")):
        return "/" + posix
    return "/" + posix if not posix.startswith("/") else posix

async def save_image_local(file: UploadFile, base_dir: str) -> Tuple[str, str]:
    if (file.content_type or "").lower() not in ALLOWED_MIME:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Only jpeg/png/webp allowed")

    os.makedirs(base_dir, exist_ok=True)
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=422, detail="Empty file")
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 5MB)")

    ext = _ext_from_content(raw)
    if not ext:
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

# ============================
# OCI Object Storage 유틸
# ============================

# SDK 클라이언트 초기화
import oci

_config = None
_object_storage = None
_BUCKET_NAME = "kurchive-uploads"
_NAMESPACE = None
_REGION = None


def _ensure_client():
    global _config, _object_storage, _REGION
    if _object_storage is not None:
        return _object_storage

    try:
        _config = oci.config.from_file("~/.oci/config")
        _object_storage = oci.object_storage.ObjectStorageClient(_config)

        # 여기서 진짜 namespace를 받아온다
        global _NAMESPACE, _REGION
        _NAMESPACE = _object_storage.get_namespace().data
        _REGION = _config.get("region")

        print(f"✅ OCI initialized: namespace={_NAMESPACE}, region={_REGION}")

        print("✅ OCI ObjectStorageClient initialized")
    except oci.exceptions.ConfigFileNotFound:
        print("⚠️ OCI config not found — skipping OCI features.")
        _object_storage = None
    except Exception as e:
        print(f"⚠️ OCI init failed: {e}")
        _object_storage = None

    return _object_storage

async def save_image_oci(file: UploadFile, prefix: str) -> Tuple[str, str]:
    """
    Object Storage에 이미지 업로드
    - prefix: 'restaurants/{id}' or 'recipes/{id}/thumbnail' 같은 경로 접두어
    """
    # oci 있는지 체크
    client = _ensure_client()
    if client is None:
        raise HTTPException(
            status_code=500,
            detail="OCI Object Storage is not configured"
        )

    if (file.content_type or "").lower() not in ALLOWED_MIME:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Only jpeg/png/webp allowed")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=422, detail="Empty file")
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 5MB)")

    ext = _ext_from_content(raw)
    if not ext:
        if file.content_type == "image/webp":
            ext = "webp"
        else:
            raise HTTPException(status_code=415, detail="Unsupported image content")

    fname = f"{uuid.uuid4().hex}.{ext}"
    object_name = f"{prefix}/{fname}"

    _object_storage.put_object(
        _NAMESPACE,
        _BUCKET_NAME,
        object_name,
        raw,
        content_type=file.content_type  # 이 줄 추가
    )


    url_path = f"https://objectstorage.{_REGION}.oraclecloud.com/n/{_NAMESPACE}/b/{_BUCKET_NAME}/o/{object_name}"
    return object_name, url_path

def delete_image_oci(object_url: str):
    """Object Storage에서 이미지 삭제"""
    # oci 있는지 체크
    client = _ensure_client()
    if client is None:
        print("⚠️ Skipping OCI delete (no client)")
        return
    try:
        object_name = object_url.split("/o/")[-1]
        _object_storage.delete_object(_NAMESPACE, _BUCKET_NAME, object_name)
    except Exception as e:
        print(f"[OCI 이미지 삭제 실패] {e}")

# ============================
# 최종 인터페이스 (교체 가능)
# ============================

async def save_image(file: UploadFile, base_dir: str) -> Tuple[str, str]:
    """
    현재는 OCI Object Storage 업로드를 기본으로 사용.
    base_dir 대신 prefix를 받는다고 생각하면 됨.
    """
    return await save_image_oci(file, base_dir)

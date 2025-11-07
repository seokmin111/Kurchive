# BE/src/utils/image_cleanup.py
import logging
from src.utils.image_upload import delete_image_oci

logger = logging.getLogger("image_cleanup")

async def cleanup_recipe_images(recipe):
    # ✅ 썸네일 삭제
    if recipe.thumbnail_url:
        try:
            delete_image_oci(recipe.thumbnail_url)
        except Exception as e:
            logger.warning(f"[레시피 썸네일 삭제 실패] {e}")

    # ✅ 단계 이미지 삭제
    for step in recipe.steps:
        for img in step.images:
            try:
                delete_image_oci(img.image_url)
            except Exception as e:
                logger.warning(f"[레시피 단계 이미지 삭제 실패] {e}")


async def cleanup_restaurant_images(images):
    for img in images:
        try:
            delete_image_oci(img.image_url)
        except Exception as e:
            logger.warning(f"[식당 이미지 삭제 실패] {e}")

def build_uploader(user):
    if not user:
        return None

    return {
        "id": user.id,
        "nickname": user.nickname
    }
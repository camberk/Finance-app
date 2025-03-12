from app.crud.user import get, get_by_email, get_by_username, create, update, authenticate

__all__ = ["user"]

class _UserCRUD:
    get = get
    get_by_email = get_by_email
    get_by_username = get_by_username
    create = create
    update = update
    authenticate = authenticate

user = _UserCRUD() 
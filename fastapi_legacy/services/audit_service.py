from sqlalchemy.ext.asyncio import AsyncSession
from ..models import AuditLog

async def log_audit(db: AsyncSession, user_id: int, target_id: int, target_table: str, action: str):
    """
    Log an audit event.
    """
    log = AuditLog(
        user_id=user_id,
        target_id=target_id,
        target_table=target_table,
        action=action
    )
    db.add(log)
    # Note: Calling commit here might interfere with ongoing transactions if used inside other services.
    # Ideally should be part of the same transaction or background task.
    # For now, we assume it's called where flush/commit is safe or managed by caller.
    await db.commit()

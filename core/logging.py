import logging
import sys
from .config import settings

# Configure logging format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

def setup_logging():
    logging.basicConfig(
        level=settings.LOG_LEVEL,
        format=LOG_FORMAT,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    # Set third-party logs to warning
    logging.getLogger("uvicorn").setLevel(logging.WARNING)

logger = logging.getLogger("wildheads")

import logging
from app.db.session import engine
from app.db.base_class import Base

# Make sure all models are imported before calling create_all
from app.models.team_member import TeamMember
from app.models.ticket import Ticket

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Creating initial data...")
    Base.metadata.create_all(bind=engine)
    logger.info("Initial data created")

if __name__ == "__main__":
    init_db()

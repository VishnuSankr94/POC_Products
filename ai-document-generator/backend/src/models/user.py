from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .base import Base, TimestampMixin

# Association table for user-document many-to-many relationship
user_documents = Table(
    'user_documents',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('document_id', UUID(as_uuid=True), ForeignKey('documents.id'), primary_key=True)
)

class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    preferences = Column(Text, nullable=True)  # JSON string for user preferences
    
    # Relationships
    documents = relationship("Document", secondary=user_documents, back_populates="users")
    document_generations = relationship("DocumentGeneration", back_populates="user")
    ai_providers = relationship("AIProvider", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"
    
    @property
    def is_authenticated(self) -> bool:
        return self.is_active and self.is_verified
    
    def get_preferences(self) -> dict:
        """Get user preferences as dictionary"""
        import json
        if self.preferences:
            try:
                return json.loads(self.preferences)
            except json.JSONDecodeError:
                return {}
        return {}
    
    def set_preferences(self, preferences: dict) -> None:
        """Set user preferences from dictionary"""
        import json
        self.preferences = json.dumps(preferences)


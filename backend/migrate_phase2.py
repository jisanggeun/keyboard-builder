"""
Phase 2 DB Migration Script
- Adds is_public, like_count columns to builds table
- Creates build_likes, posts, comments, post_likes tables
"""
from sqlalchemy import text
from app.database import engine, Base
from app.models import (
    PCB, Case, Plate, Stabilizer, Switch, Keycap, CompatibleGroup,
    User, Build, BuildLike,
    Post, Comment, PostLike,
)


def run_migration():
    with engine.connect() as conn:
        # Add is_public column to builds if not exists
        result = conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'builds' AND column_name = 'is_public'"
        ))
        if not result.fetchone():
            conn.execute(text(
                "ALTER TABLE builds ADD COLUMN is_public BOOLEAN DEFAULT FALSE"
            ))
            print("Added is_public column to builds")

        # Add like_count column to builds if not exists
        result = conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'builds' AND column_name = 'like_count'"
        ))
        if not result.fetchone():
            conn.execute(text(
                "ALTER TABLE builds ADD COLUMN like_count INTEGER DEFAULT 0"
            ))
            print("Added like_count column to builds")

        # Add build_id column to posts if not exists
        result = conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'posts' AND column_name = 'build_id'"
        ))
        if not result.fetchone():
            conn.execute(text(
                "ALTER TABLE posts ADD COLUMN build_id INTEGER REFERENCES builds(id)"
            ))
            print("Added build_id column to posts")

        conn.commit()

    # Create new tables (build_likes, posts, comments, post_likes)
    Base.metadata.create_all(bind=engine)
    print("Created new tables (build_likes, posts, comments, post_likes)")
    print("Migration complete!")


if __name__ == "__main__":
    run_migration()

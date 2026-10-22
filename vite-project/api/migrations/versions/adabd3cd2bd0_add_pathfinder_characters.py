"""add pathfinder_characters

Revision ID: adabd3cd2bd0
Revises: e5f6a1b2c3d4
Create Date: 2026-10-20 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'adabd3cd2bd0'
down_revision = 'e5f6a1b2c3d4'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'pathfinder_characters',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('data', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        'ix_pathfinder_characters_username',
        'pathfinder_characters',
        ['username'],
        unique=False,
    )


def downgrade():
    op.drop_index('ix_pathfinder_characters_username', table_name='pathfinder_characters')
    op.drop_table('pathfinder_characters')

# NELO Database

## Profiles
- id
- username
- avatar_id
- role
- created_at
- updated_at

## Posts
- id
- user_id
- type
- title
- content
- media_path
- status
- created_at
- updated_at

## Likes
- user_id
- post_id
- created_at

## Comments
- id
- post_id
- user_id
- content
- created_at
- updated_at

## Boosts
- user_id
- post_id
- created_at

## Reports
- id
- reporter_id
- post_id
- reason
- status
- created_at
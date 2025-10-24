# Implement Collaboration

Add commenting, mentions, activity feed, and shared workspaces for team collaboration.

## Backend
- Create Comment entity: Id, OrganizationId, UserId, EntityType, EntityId, Content (markdown), ParentCommentId (for threads), CreatedAt, UpdatedAt
- Create Mention entity: Id, CommentId, UserId, IsRead
- Parse @mentions from comments
- Send notifications on mentions
- Activity feed query (aggregated user actions)
- Version history for portfolios/accounts
- Shared workspace concept (future: collaborative analysis sessions)

## Frontend
- Create CommentThread component
- Add comments to: Portfolios, Accounts, Holdings
- Markdown editor with @mention support
- @mention autocomplete
- Threaded replies
- Edit/delete own comments
- Activity feed page (timeline of all org activity)
- User profile with activity history

## Testing
- Test comment creation
- Test @mention notifications
- Test threaded comments
- Test markdown rendering

## Files
- `src/Domain/Entities/Comment.cs` (NEW)
- `src/Domain/Entities/Mention.cs` (NEW)
- `src/Application/Features/Collaboration/` (NEW)
- `frontend/src/components/comments/CommentThread.tsx` (NEW)
- `frontend/src/pages/ActivityFeed.tsx` (NEW)

Execute end-to-end autonomously.

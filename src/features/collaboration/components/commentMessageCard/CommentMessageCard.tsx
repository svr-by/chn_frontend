import { Paper, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import type { Comment } from '@/api/generated/models/comment';

dayjs.extend(relativeTime);

interface CommentMessageCardProps {
  comment: Comment;
  isOwn: boolean;
}

export function CommentMessageCard({
  comment,
  isOwn,
}: CommentMessageCardProps) {
  return (
    <Stack
      alignItems={isOwn ? 'flex-end' : 'flex-start'}
      data-own={isOwn ? 'true' : 'false'}
      sx={{ width: '100%' }}
    >
      <Paper
        variant={isOwn ? 'elevation' : 'outlined'}
        elevation={isOwn ? 0 : undefined}
        sx={{
          p: 2,
          maxWidth: '85%',
          bgcolor: isOwn ? 'primary.main' : 'background.paper',
          color: isOwn ? 'primary.contrastText' : 'text.primary',
          borderTopRightRadius: isOwn ? '4px' : undefined,
          borderTopLeftRadius: isOwn ? undefined : '4px',
        }}
      >
        <Stack spacing={0.5}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="baseline"
            flexWrap="wrap"
          >
            <Typography variant="subtitle2">{comment.author.name}</Typography>
            <Typography
              variant="caption"
              sx={{
                color: isOwn ? 'primary.contrastText' : 'text.secondary',
                opacity: isOwn ? 0.8 : 1,
              }}
            >
              {comment.author.companyName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isOwn ? 'primary.contrastText' : 'text.secondary',
                opacity: isOwn ? 0.8 : 1,
              }}
            >
              {dayjs(comment.createdAt).fromNow()}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {comment.body}
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}

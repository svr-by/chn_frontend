import { Typography } from '@mui/material';

interface LineageCreatedMetaProps {
  createdAt?: string;
  createdBy?: string;
}

export function LineageCreatedMeta({
  createdAt,
  createdBy,
}: LineageCreatedMetaProps) {
  const date = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : undefined;
  const label = [date, createdBy].filter(Boolean).join(', ');

  if (!label) {
    return null;
  }

  return (
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  );
}

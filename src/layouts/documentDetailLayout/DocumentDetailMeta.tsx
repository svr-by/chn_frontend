import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Stack, Typography, type StackProps, type SxProps, type Theme } from '@mui/material';

interface DocumentDetailMetaProps {
  children: ReactNode;
  /** Defaults to `1`. */
  spacing?: StackProps['spacing'];
}

/** Vertical stack for document detail header meta. */
export function DocumentDetailMeta({
  children,
  spacing = 1,
}: DocumentDetailMetaProps) {
  return <Stack spacing={spacing}>{children}</Stack>;
}

interface DocumentDetailMetaRowProps {
  children: ReactNode;
  /** Defaults to `1`. */
  spacing?: StackProps['spacing'];
}

/** Wrapping horizontal row of meta items. */
export function DocumentDetailMetaRow({
  children,
  spacing = 1,
}: DocumentDetailMetaRowProps) {
  if (Children.toArray(children).length === 0) {
    return null;
  }

  return (
    <Stack
      direction="row"
      spacing={spacing}
      flexWrap="wrap"
      useFlexGap
      alignItems="center"
    >
      {children}
    </Stack>
  );
}

export interface DocumentDetailMetaItemProps {
  icon: ReactElement;
  label?: ReactNode;
  value?: ReactNode;
  /** Shown after the label (e.g. an edit button). */
  action?: ReactNode;
  alignItems?: 'center' | 'flex-start';
  /** Clamp value text to N lines (notes preview). */
  valueClampLines?: number;
  valueSx?: SxProps<Theme>;
}

/**
 * Icon + optional label/value + optional action for DocumentDetailLayout meta.
 * Pass a MUI icon element; `fontSize` / `color` are applied automatically.
 */
export function DocumentDetailMetaItem({
  icon,
  label,
  value,
  action = null,
  alignItems = 'center',
  valueClampLines,
  valueSx,
}: DocumentDetailMetaItemProps) {
  const resolvedIcon = isValidElement<{
    fontSize?: string;
    color?: string;
  }>(icon)
    ? cloneElement(icon, {
        fontSize: icon.props.fontSize ?? 'small',
        color: icon.props.color ?? 'action',
      })
    : icon;

  const clampSx: SxProps<Theme> | undefined =
    valueClampLines != null
      ? {
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: valueClampLines,
          overflow: 'hidden',
          maxWidth: 320,
          ...((valueSx ?? {}) as object),
        }
      : valueSx;

  const hasLabel = label != null && label !== false;
  const hasValue = value != null && value !== false && value !== '';
  /** Keep clamped notes outside the label so `action` can sit between them. */
  const splitValue = valueClampLines != null && hasValue;

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems={alignItems}
      flexWrap="wrap"
      useFlexGap
    >
      {resolvedIcon}
      {hasLabel || (hasValue && !splitValue) ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={splitValue ? undefined : clampSx}
        >
          {hasLabel ? (
            <>
              {label}
              {': '}
            </>
          ) : null}
          {!splitValue && hasValue ? value : null}
        </Typography>
      ) : null}
      {action}
      {splitValue ? (
        <Typography variant="body2" color="text.secondary" sx={clampSx}>
          {value}
        </Typography>
      ) : null}
    </Stack>
  );
}

import { useEffect, useRef, useState } from 'react';
import { TextField, type TextFieldProps } from '@mui/material';

export interface AutosaveTextFieldProps
  extends Omit<
    TextFieldProps,
    'value' | 'onChange' | 'onBlur' | 'defaultValue'
  > {
  value: string;
  /** Called when the user finishes editing with a changed value. */
  onCommit: (value: string) => Promise<void>;
  /** When true (default for single-line), Enter commits. */
  commitOnEnter?: boolean;
}

/**
 * Text field that commits on blur (and Enter for single-line).
 * Skips commit when the value is unchanged. Esc resets to the last saved value.
 */
export function AutosaveTextField({
  value,
  onCommit,
  commitOnEnter,
  multiline,
  disabled,
  ...props
}: AutosaveTextFieldProps) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const draftRef = useRef(draft);
  const valueRef = useRef(value);
  const savingRef = useRef(false);

  const shouldCommitOnEnter = commitOnEnter ?? !multiline;

  useEffect(() => {
    setDraft(value);
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  async function commit() {
    if (savingRef.current || disabled) {
      return;
    }

    const next = draftRef.current;
    if (next === valueRef.current) {
      return;
    }

    savingRef.current = true;
    setSaving(true);
    try {
      await onCommit(next);
      valueRef.current = next;
    } catch {
      setDraft(valueRef.current);
      draftRef.current = valueRef.current;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <TextField
      {...props}
      multiline={multiline}
      value={draft}
      disabled={disabled || saving}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        void commit();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          setDraft(valueRef.current);
          draftRef.current = valueRef.current;
          (event.target as HTMLInputElement).blur();
          return;
        }

        if (
          shouldCommitOnEnter &&
          event.key === 'Enter' &&
          !event.shiftKey
        ) {
          event.preventDefault();
          (event.target as HTMLInputElement).blur();
        }

        if (
          multiline &&
          event.key === 'Enter' &&
          (event.ctrlKey || event.metaKey)
        ) {
          event.preventDefault();
          (event.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}

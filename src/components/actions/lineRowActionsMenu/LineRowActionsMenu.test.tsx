import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListItemText, MenuItem } from '@mui/material';

import { LineRowActionsMenu } from '@/components/actions/lineRowActionsMenu/LineRowActionsMenu';
import { LINEAGE_ID } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

describe('LineRowActionsMenu', () => {
  it('closes after an extra menu item is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    renderWithProviders(
      <LineRowActionsMenu
        lineageId={LINEAGE_ID}
        moreLabel="More actions"
        openTraceLabel="Open trace"
      >
        <MenuItem onClick={onEdit}>
          <ListItemText>Edit line</ListItemText>
        </MenuItem>
      </LineRowActionsMenu>,
    );

    await user.click(screen.getByRole('button', { name: 'More actions' }));
    expect(screen.getByRole('menuitem', { name: 'Edit line' })).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Edit line' }));

    expect(onEdit).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole('menuitem', { name: 'Edit line' }),
    ).not.toBeInTheDocument();
  });
});

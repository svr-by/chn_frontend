import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import {
  DocumentDetailMeta,
  DocumentDetailMetaItem,
  DocumentDetailMetaRow,
} from './DocumentDetailMeta';
import { renderWithProviders } from '@/test/render';

describe('DocumentDetailMeta', () => {
  it('renders label, value, and action', () => {
    renderWithProviders(
      <DocumentDetailMeta>
        <DocumentDetailMetaRow>
          <DocumentDetailMetaItem
            icon={<PersonOutlineOutlinedIcon />}
            label="Assignee"
            value="Jane Doe"
            action={<button type="button">Edit</button>}
          />
        </DocumentDetailMetaRow>
      </DocumentDetailMeta>,
    );

    expect(screen.getByText(/Assignee:\s*Jane Doe/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('hides empty meta rows', () => {
    const { container } = renderWithProviders(
      <DocumentDetailMeta>
        <DocumentDetailMetaRow>{null}</DocumentDetailMetaRow>
        <DocumentDetailMetaItem
          icon={<PersonOutlineOutlinedIcon />}
          value="Created by: Jane"
        />
      </DocumentDetailMeta>,
    );

    expect(screen.getByText('Created by: Jane')).toBeInTheDocument();
    expect(container.querySelectorAll('.MuiStack-root').length).toBeGreaterThan(
      0,
    );
  });

  it('clamps long values when valueClampLines is set', () => {
    renderWithProviders(
      <DocumentDetailMetaItem
        icon={<PersonOutlineOutlinedIcon />}
        label="Notes"
        value="Long note text"
        valueClampLines={2}
      />,
    );

    expect(screen.getByText(/Notes:/)).toBeInTheDocument();
    expect(screen.getByText('Long note text')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TuiButton } from '../TuiButton';

describe('TuiButton Component', () => {
  it('should render children', () => {
    render(<TuiButton>Click Me</TuiButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<TuiButton onClick={handleClick}>Click Me</TuiButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled and show processing state when loading', () => {
    render(<TuiButton loading>Click Me</TuiButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('_PROCESSING')).toBeInTheDocument();
    expect(button.className).toContain('cursor-wait');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<TuiButton disabled>Disabled</TuiButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should pass through standard button props', () => {
    render(<TuiButton type="submit" aria-label="Submit Button">Submit</TuiButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'Submit Button');
  });
});

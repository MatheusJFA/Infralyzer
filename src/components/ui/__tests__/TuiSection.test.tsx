import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TuiSection } from '../TuiSection';

describe('TuiSection Component', () => {
  it('should render children and optional title', () => {
    render(<TuiSection title="Test Title">Content</TuiSection>);
    expect(screen.getByText('[ Test Title ]')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should apply base classes', () => {
    const { container } = render(<TuiSection>Base Section</TuiSection>);
    const section = container.firstChild as HTMLElement;
    expect(section.className).toContain('bg-background');
    expect(section.className).toContain('border-paper-outline');
  });

  it('should apply additional class names', () => {
    const { container } = render(<TuiSection className="custom-cls">Section</TuiSection>);
    const section = container.firstChild as HTMLElement;
    expect(section.className).toContain('custom-cls');
  });

  it('hides heading when title is not provided', () => {
    const { container } = render(<TuiSection>Content</TuiSection>);
    expect(container.querySelector('h2')).toBeNull();
  });

  it('accepts and applies a ref', () => {
    const myRef = React.createRef<HTMLElement>();
    render(<TuiSection sectionRef={myRef}>Ref Test</TuiSection>);
    expect(myRef.current).not.toBeNull();
    expect(myRef.current?.tagName).toBe('SECTION');
  });
});

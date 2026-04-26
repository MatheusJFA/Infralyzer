import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InfoTooltip } from '../InfoTooltip';

describe('InfoTooltip Component', () => {
    it('should render the help icon', () => {
        const { container } = render(<InfoTooltip content="Help content" />);
        const icon = container.querySelector('svg');
        expect(icon).toBeInTheDocument();
    });

    it('should be hidden initially via CSS classes', () => {
        render(<InfoTooltip content="Extra explanation" />);
        const tooltipBox = screen.getByText('Extra explanation').parentElement;
        // Check classes that control visibility in our TUI implementation
        expect(tooltipBox?.className).toContain('opacity-0');
        expect(tooltipBox?.className).toContain('pointer-events-none');
    });

    it('contains the arrow indicator snippet', () => {
        const { container } = render(<InfoTooltip content="Arrow test" />);
        const arrow = container.querySelector('.rotate-45');
        expect(arrow).toBeInTheDocument();
    });
});

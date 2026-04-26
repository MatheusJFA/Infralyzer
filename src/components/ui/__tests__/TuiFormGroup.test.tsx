import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TuiFormGroup } from '../TuiFormGroup';

describe('TuiFormGroup Component', () => {
    it('should render children correctly', () => {
        render(<TuiFormGroup>Some Content</TuiFormGroup>);
        expect(screen.getByText('Some Content')).toBeInTheDocument();
    });

    it('should apply additional class names', () => {
        const { container } = render(<TuiFormGroup className="extra-class">Content</TuiFormGroup>);
        const div = container.firstChild as HTMLElement;
        expect(div.className).toContain('extra-class');
    });
});

import React from 'react';
import { render, screen} from '@testing-library/react';
import { describe, it, expect} from 'vitest';
import { TuiBanner} from '../TuiBanner';

describe('TuiBanner Component', () => {
 it('should render children correctly', () => {
 render(<TuiBanner>Test Banner</TuiBanner>);
 expect(screen.getByText('Test Banner')).toBeInTheDocument();
 });

 it('should apply dashed border by default', () => {
 const { container} = render(<TuiBanner>Default Variant</TuiBanner>);
 const div = container.firstChild as HTMLElement;
 expect(div.className).toContain('border-dashed');
 });

 it('should apply solid border when variant is solid', () => {
 const { container} = render(<TuiBanner variant="solid">Solid Variant</TuiBanner>);
 const div = container.firstChild as HTMLElement;
 expect(div.className).toContain('border-solid');
 expect(div.className).not.toContain('border-dashed');
 });

 it('should apply additional class names', () => {
 const { container} = render(<TuiBanner className="custom-class">Banner</TuiBanner>);
 const div = container.firstChild as HTMLElement;
 expect(div.className).toContain('custom-class');
 });
});

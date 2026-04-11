import React from 'react';
import { render, screen} from '@testing-library/react';
import { describe, it, expect} from 'vitest';
import { TuiSection} from '../TuiSection';

describe('TuiSection Component', () => {
 it('should render children and optional title', () => {
 render(
 <TuiSection title="Section Title">
 <p>Section Content</p>
 </TuiSection>
 );
 expect(screen.getByText('Section Title')).toBeInTheDocument();
 expect(screen.getByText('Section Content')).toBeInTheDocument();
 });

 it('hides heading when title is not provided', () => {
 const { container} = render(<TuiSection>Content</TuiSection>);
 expect(container.querySelector('h2')).toBeNull();
 });

 it('should apply left variant corners by default', () => {
 const { container} = render(<TuiSection>Content</TuiSection>);
 const section = container.firstChild as HTMLElement;
 expect(section.className).toContain('before:top-0 before:left-0');
 expect(section.className).toContain('after:bottom-0 after:right-0');
 });

 it('should apply right variant corners correctly', () => {
 const { container} = render(<TuiSection variant="right">Content</TuiSection>);
 const section = container.firstChild as HTMLElement;
 expect(section.className).toContain('before:top-0 before:right-0');
 expect(section.className).toContain('after:bottom-0 after:left-0');
 });

 it('accepts custom class names', () => {
 const { container} = render(<TuiSection className="custom-section">Content</TuiSection>);
 const section = container.firstChild as HTMLElement;
 expect(section.className).toContain('custom-section');
 });

 it('accepts and applies a ref', () => {
 const myRef = React.createRef<HTMLElement>();
 render(<TuiSection sectionRef={myRef}>Ref Test</TuiSection>);
 expect(myRef.current).not.toBeNull();
 expect(myRef.current?.tagName).toBe('SECTION');
 });
});

import React from 'react';
import { render, screen} from '@testing-library/react';
import { describe, it, expect, vi} from 'vitest';
import { TuiLoading} from '../TuiLoading';

// Mock useTranslation
vi.mock('@/lib/i18n/I18nContext', () => ({
 useTranslation: () => ({
 t: (key: string) => (key === 'loadingPricing' ? 'CARREGANDO PREÇOS...' : key),
 }),
}));

describe('TuiLoading Component', () => {
 it('should render default message when no message is provided', () => {
 render(<TuiLoading />);
 expect(screen.getByText('CARREGANDO PREÇOS...')).toBeInTheDocument();
 });

 it('should render custom message when provided', () => {
 render(<TuiLoading message="Custom Loading" />);
 expect(screen.getByText('Custom Loading')).toBeInTheDocument();
 });

 it('should render the spinner [\]', () => {
 render(<TuiLoading />);
 expect(screen.getByText('[\\]')).toBeInTheDocument();
 });

 it('should apply custom min-height', () => {
 const { container} = render(<TuiLoading minHeight="500px" />);
 const div = container.firstChild as HTMLElement;
 expect(div.style.minHeight).toBe('500px');
 });
});

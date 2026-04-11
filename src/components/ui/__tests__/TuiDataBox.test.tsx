import React from 'react';
import { render, screen} from '@testing-library/react';
import { describe, it, expect, vi} from 'vitest';
import { TuiDataBox} from '../TuiDataBox';

// Mock InfoTooltip to focus on TuiDataBox behavior
vi.mock('@/components/InfoTooltip', () => ({
 InfoTooltip: ({ content}: { content: string}) => <div data-testid="tooltip">{content}</div>,
}));

describe('TuiDataBox Component', () => {
 it('should render label and value correctly', () => {
 render(<TuiDataBox label="Monthly Cost" value="$1,000" />);
 expect(screen.getByText('Monthly Cost')).toBeInTheDocument();
 expect(screen.getByText('$1,000')).toBeInTheDocument();
 });

 it('should render tooltip when infoText is provided', () => {
 render(<TuiDataBox label="Cost" value="100" infoText="Test Tooltip" />);
 expect(screen.getByTestId('tooltip')).toHaveTextContent('Test Tooltip');
 });

 it('should apply large value styling by default', () => {
 const { getByText} = render(<TuiDataBox label="Test" value="Value" />);
 const valueEl = getByText('Value');
 expect(valueEl.className).toContain('text-2xl font-black');
 });

 it('should apply small value styling when largeValue is false', () => {
 const { getByText} = render(<TuiDataBox label="Test" value="Value" largeValue={false} />);
 const valueEl = getByText('Value');
 expect(valueEl.className).toContain('text-xl font-bold');
 expect(valueEl.className).not.toContain('text-2xl font-black');
 });
});

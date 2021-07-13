import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Switch from './Switch';

describe('<Switch />', () => {
  test('it should mount', () => {
    render(<Switch />);
    
    const switch = screen.getByTestId('Switch');

    expect(switch).toBeInTheDocument();
  });
});
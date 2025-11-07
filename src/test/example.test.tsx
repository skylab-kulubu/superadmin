import { render, screen } from '@testing-library/react';
import React from 'react';

function DummyComponent() {
  return <div>Test bileşeni</div>;
}

describe('DummyComponent', () => {
  it('mesajı render eder', () => {
    render(<DummyComponent />);
    expect(screen.getByText('Test bileşeni')).toBeInTheDocument();
  });
});

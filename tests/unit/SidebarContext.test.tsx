import React from 'react';
import { render, act, screen } from '@testing-library/react';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

// Test component to access sidebar context
const TestComponent = () => {
  const { isOpen, isMobile, open, close, toggle } = useSidebar();
  return (
    <div>
      <span data-testid="isOpen">{isOpen.toString()}</span>
      <span data-testid="isMobile">{isMobile.toString()}</span>
      <button data-testid="open" onClick={open}>
        Open
      </button>
      <button data-testid="close" onClick={close}>
        Close
      </button>
      <button data-testid="toggle" onClick={toggle}>
        Toggle
      </button>
    </div>
  );
};

describe('SidebarContext', () => {
  // Mock window.innerWidth
  const mockInnerWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    window.dispatchEvent(new Event('resize'));
  };

  beforeEach(() => {
    // Set default desktop width
    mockInnerWidth(1024);
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSidebar must be used within a SidebarProvider');

    consoleSpy.mockRestore();
  });

  it('should provide initial state for desktop', () => {
    mockInnerWidth(1024);

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByTestId('isMobile').textContent).toBe('false');
    expect(screen.getByTestId('isOpen').textContent).toBe('true');
  });

  it('should provide initial state for mobile', () => {
    mockInnerWidth(375);

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByTestId('isMobile').textContent).toBe('true');
    expect(screen.getByTestId('isOpen').textContent).toBe('false');
  });

  it('should open sidebar on open()', () => {
    mockInnerWidth(375);

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    // Initially closed on mobile
    expect(screen.getByTestId('isOpen').textContent).toBe('false');

    // Open sidebar
    act(() => {
      screen.getByTestId('open').click();
    });

    expect(screen.getByTestId('isOpen').textContent).toBe('true');
  });

  it('should close sidebar on close()', () => {
    mockInnerWidth(1024);

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    // Initially open on desktop
    expect(screen.getByTestId('isOpen').textContent).toBe('true');

    // Close sidebar
    act(() => {
      screen.getByTestId('close').click();
    });

    expect(screen.getByTestId('isOpen').textContent).toBe('false');
  });

  it('should toggle sidebar state', () => {
    mockInnerWidth(1024);

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    // Initially open on desktop
    expect(screen.getByTestId('isOpen').textContent).toBe('true');

    // Toggle to closed
    act(() => {
      screen.getByTestId('toggle').click();
    });
    expect(screen.getByTestId('isOpen').textContent).toBe('false');

    // Toggle back to open
    act(() => {
      screen.getByTestId('toggle').click();
    });
    expect(screen.getByTestId('isOpen').textContent).toBe('true');
  });

  it('should respond to window resize', () => {
    mockInnerWidth(1024);

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    // Initially desktop
    expect(screen.getByTestId('isMobile').textContent).toBe('false');
    expect(screen.getByTestId('isOpen').textContent).toBe('true');

    // Resize to mobile
    act(() => {
      mockInnerWidth(375);
    });

    expect(screen.getByTestId('isMobile').textContent).toBe('true');
    expect(screen.getByTestId('isOpen').textContent).toBe('false');

    // Resize back to desktop
    act(() => {
      mockInnerWidth(1024);
    });

    expect(screen.getByTestId('isMobile').textContent).toBe('false');
    expect(screen.getByTestId('isOpen').textContent).toBe('true');
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '../contexts/ToastContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import ToastContainer from './ToastContainer';

function Wrap({ children }) {
  return (
    <LanguageProvider>
      <ToastProvider>
        {children}
        <ToastContainer />
      </ToastProvider>
    </LanguageProvider>
  );
}

function Trigger({ message, onReady }) {
  const { showToast } = useToast();
  if (onReady) onReady(showToast);
  return <button onClick={() => showToast(message, { duration: 0 })}>show</button>;
}

describe('ToastContainer', () => {
  it('renders nothing when the queue is empty', () => {
    const { container } = render(
      <Wrap>
        <Trigger message="" />
      </Wrap>
    );
    expect(container.querySelector('.toast-container')).toBeNull();
  });

  it('renders one .toast per active toast with the message text', async () => {
    const user = userEvent.setup();
    render(
      <Wrap>
        <Trigger message="Alberta DST changed." />
      </Wrap>
    );
    await user.click(screen.getByRole('button', { name: 'show' }));
    expect(screen.getByRole('status')).toHaveTextContent('Alberta DST changed.');
  });

  it('clicking the dismiss button removes the toast', async () => {
    const user = userEvent.setup();
    render(
      <Wrap>
        <Trigger message="bye" />
      </Wrap>
    );
    await user.click(screen.getByRole('button', { name: 'show' }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByRole('status')).toBeNull();
  });
});

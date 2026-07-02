import { runAsk } from './ask.js';

// A core askAgent-jét mockoljuk: a CLI I/O rétegét teszteljük, nem az LLM-hívást.
vi.mock('@plantbase/core', () => ({
  askAgent: vi.fn(async (question: string) => ({
    answer: `válasz: ${question}`,
    model: 'test-model',
    systemPrompt: 'SYS-PROMPT',
    messages: [{ role: 'user', content: question }],
    usage: { inputTokens: 1, outputTokens: 2 },
  })),
}));

function captureLog(): { logs: string[]; restore: () => void } {
  const logs: string[] = [];
  const spy = vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
    logs.push(String(msg));
  });
  return { logs, restore: () => spy.mockRestore() };
}

describe('runAsk (single-shot, mocked agent)', () => {
  it('should print the agent answer for a provided question', async () => {
    const { logs, restore } = captureLog();
    try {
      await runAsk('van pozsgásod?', {});
    } finally {
      restore();
    }
    expect(logs).toContain('válasz: van pozsgásod?');
  });

  it('should print the full prompt when --show-prompt is set', async () => {
    const { logs, restore } = captureLog();
    try {
      await runAsk('szia', { showPrompt: true });
    } finally {
      restore();
    }
    expect(logs).toContain('--- system prompt ---');
    expect(logs.some((line) => line.includes('SYS-PROMPT'))).toBe(true);
  });
});

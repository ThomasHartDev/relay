import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does not update the value before the delay", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "hello", delay: 300 },
    });

    rerender({ value: "world", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("hello");
  });

  it("updates the value after the delay", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "hello", delay: 300 },
    });

    rerender({ value: "world", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("world");
  });

  it("resets the timer on rapid changes", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "a", delay: 300 },
    });

    rerender({ value: "ab", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "abc", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Only 200ms since last change
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("abc");
  });
});

import { describe, test, expect } from "bun:test";

const NEURALWATT_API_KEY = process.env.NEURALWATT_API_KEY;
const BASE_URL = "https://api.neuralwatt.com/v1";

/** Minimal chat completion request helper. */
async function complete(model: string, body: Record<string, unknown> = {}) {
	const res = await fetch(`${BASE_URL}/chat/completions`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${NEURALWATT_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model,
			messages: [{ role: "user", content: "Reply with exactly one word: ok" }],
			max_tokens: 2000,
			...body,
		}),
	});
	const data = await res.json().catch(() => ({}));
	return { status: res.status, ok: res.ok, data };
}

describe.skipIf(!NEURALWATT_API_KEY)("neuralwatt integration", () => {
	test("qwen3.6-35b-fast returns a non-empty chat completion", async () => {
		const res = await fetch(`${BASE_URL}/chat/completions`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${NEURALWATT_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "qwen3.6-35b-fast",
				messages: [{ role: "user", content: "Say hello." }],
				max_tokens: 50,
			}),
		});

		expect(res.ok).toBe(true);
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.object).toBe("chat.completion");
		expect(data.choices).toBeInstanceOf(Array);
		expect(data.choices.length).toBeGreaterThan(0);

		const content = data.choices[0]?.message?.content;
		expect(typeof content).toBe("string");
		expect(content!.length).toBeGreaterThan(0);
	}, { timeout: 30000 });
});

// Defends the thinking-effort wire contract for qwen3.6-35b: it's backed by
// vLLM with a strict enum accepting only `low`/`medium`/`high`. Sending
// `minimal` or `xhigh` returns HTTP 400. Regression for the migration bug
// that advertised the full ladder for this model.
describe.skipIf(!NEURALWATT_API_KEY)("qwen3.6-35b thinking effort", () => {
	const ACCEPTED = ["low", "medium", "high"] as const;
	const REJECTED = ["minimal", "xhigh"] as const;

	for (const effort of ACCEPTED) {
		test(`qwen3.6-35b accepts reasoning_effort=${effort}`, async () => {
			const { status, ok, data } = await complete("qwen3.6-35b", { reasoning_effort: effort });
			expect(status).toBe(200);
			expect(ok).toBe(true);
			expect(data.choices?.[0]?.message?.content).toBeTruthy();
		}, { timeout: 60000 });
	}

	for (const effort of REJECTED) {
		test(`qwen3.6-35b rejects reasoning_effort=${effort} with 400`, async () => {
			const { status } = await complete("qwen3.6-35b", { reasoning_effort: effort });
			expect(status).toBe(400);
		}, { timeout: 30000 });
	}

	test("reasoning content lives on the `reasoning` field (not reasoning_content)", async () => {
		const { status, data } = await complete("qwen3.6-35b", { reasoning_effort: "high" });
		expect(status).toBe(200);
		const msg = data.choices?.[0]?.message;
		expect(msg).toBeDefined();
		expect(msg).toHaveProperty("reasoning");
		expect(typeof msg.reasoning).toBe("string");
	}, { timeout: 60000 });
});

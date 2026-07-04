import { describe, test, expect } from "bun:test";

const NEURALWATT_API_KEY = process.env.NEURALWATT_API_KEY;
const BASE_URL = "https://api.neuralwatt.com/v1";

describe.skipIf(!NEURALWATT_API_KEY)("neuralwatt integration", () => {
	test("qwen3.6-35b-fast responds to a chat completion request", async () => {
		const res = await fetch(`${BASE_URL}/chat/completions`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${NEURALWATT_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "qwen3.6-35b-fast",
				messages: [{ role: "user", content: "reply with exactly: pong" }],
				max_tokens: 50,
			}),
		});

		expect(res.ok).toBe(true);
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.object).toBe("chat.completion");
		expect(data.model).toBe("qwen3.6-35b-fast");
		expect(data.choices).toBeInstanceOf(Array);
		expect(data.choices.length).toBeGreaterThan(0);

		const message = data.choices[0]?.message;
		expect(message?.role).toBe("assistant");
		expect(message?.content).toBe("pong");

		expect(data.usage).toBeDefined();
		expect(typeof data.usage.prompt_tokens).toBe("number");
		expect(typeof data.usage.completion_tokens).toBe("number");
	});
});

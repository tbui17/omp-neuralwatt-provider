import { describe, test, expect } from "bun:test";

const NEURALWATT_API_KEY = process.env.NEURALWATT_API_KEY;
const BASE_URL = "https://api.neuralwatt.com/v1";

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
	});
});

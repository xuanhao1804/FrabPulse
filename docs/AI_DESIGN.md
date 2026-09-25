# FrabPulse — AI Intelligence Design & Ethics

## 1. AI Philosophy

FrabPulse rejects the gimmick of sticking an unconstrained chatbot on top of market data.
In financial intelligence, free-form chatbots suffer from three critical flaws:
1. **Hallucinated causality:** Claiming Event A caused Price Movement B when other macro variables were active.
2. **Lack of attribution:** Blurring whether a statement came from a central banker, a journalist, or the model's weights.
3. **Temporal inconsistency:** Forgetting exact chronological sequencing between releases and price spikes.

Instead, FrabPulse treats AI strictly as an **epistemic processing pipeline**:
- **Structured Extraction:** Pulling named entities, event categories, and numerical statistics into typed schemas.
- **Source-Grounded Synthesis:** Summarizing what multiple accredited sources reported, attributing every distinct perspective.
- **Timeline Sequencing:** Ordering chronological sub-developments within an unfolding story.

---

## 2. Provider Abstraction Architecture

To avoid vendor lock-in and enable deterministic zero-dependency local development, all AI processing is mediated by the `IAIIntelligenceProvider` interface:

```typescript
export interface IAIIntelligenceProvider {
  extractStructuredEvent(articles: RawArticleInput[]): Promise<ExtractedEventOutput>;
  synthesizeEventNarrative(
    eventData: BaseEventData,
    sources: SourceCitationInput[]
  ): Promise<EventNarrativeOutput>;
  calculateConfidence(event: ExtractedEventOutput, sources: SourceCitationInput[]): number;
}
```

### Implementations:
1. **`OpenAIIntelligenceProvider`**:
   - Uses OpenAI structured outputs (`response_format: { type: "json_schema" }`) via models such as `gpt-4o-mini` or `gpt-4o`.
   - Activated when `OPENAI_API_KEY` is present in the environment.

2. **`DeterministicLabAIProvider`**:
   - Built-in default provider for local development, automated CI pipelines, and offline demonstrations.
   - Applies deterministic rule-based entity recognition, key-phrase parsing, and structured synthesis templates.
   - Guaranteed 100% reproducible output without network calls or API costs.

---

## 3. Strict Guardrails: Fact vs. Interpretation vs. Synthesis

The prompt engineering and post-processing filters enforce three strict boundaries:

1. **Never generate unconditioned causal statements:**
   - Forbidden: *"The gold price dropped because the CPI was hotter than expected."*
   - Required: *"Following the CPI release of 3.4% (vs 3.1% forecast), XAU/USD recorded a 0.65% decline within 30 minutes. Reporting by Bloomberg attributed the pressure to rising treasury yields."*

2. **Explicit Attribution:**
   - Every summary item must carry citation tags referencing specific `sourceId` elements.

3. **Methodology Disclosure:**
   - Every generated intelligence block includes an algorithmic confidence score (0.00 – 1.00) based on source convergence, outlet credibility ratings, and timestamp precision.

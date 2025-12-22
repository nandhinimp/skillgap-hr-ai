Learnings from AI Resume & Mock Interviewer (HR-Tech)

This project helped me understand how to design AI systems that are explainable, structured, and production-oriented rather than just chat-based.



 1. Prompt Engineering & System Design
- Learned how to write **system prompts** that keep the AI in a strict role (professional recruiter).
- Understood the importance of **instruction hierarchy** (System → Developer → User).
- Learned how to prevent vague or unstructured responses by enforcing **JSON-only outputs**.



 2. Prompt Chaining (Agentic Flow)
- Implemented a multi-step AI workflow instead of a single prompt.
- Step 1: Resume + Job Description analysis.
- Step 2: Skill gap identification.
- Step 3: Dynamic interview question generation based on weaknesses.
- Step 4: STAR-based answer evaluation.
- This taught me how AI agents can **reason over previous outputs**.



 3. Structured JSON for Frontend Integration
- Designed clear JSON schemas for:
  - Resume analysis
  - Interview questions
  - STAR feedback
- Learned how structured outputs make AI responses:
  - Reliable
  - UI-friendly
  - Easy to debug



 4. Semantic Skill Matching
- Learned how LLMs can identify **semantic matches**, not just keyword matches.
- Example:
  - "Managed 5 interns" → mapped to "Team Leadership"
- This helped me understand how LLM reasoning differs from traditional keyword filters.



 5. STAR Framework Evaluation
- Learned how to evaluate user answers using a structured framework:
  - Situation
  - Task
  - Action
  - Result
- This showed me how AI can be used not just to generate content, but to **assess quality**.


 6. HR-Tech Domain Understanding
- Gained understanding of how modern hiring systems work:
  - Resume screening
  - Skill gap analysis
  - Interview preparation
- Learned how to design AI tools that help candidates instead of acting as black boxes.



 7. AI Safety & Control
- Learned how to:
  - Limit hallucinations using strict output formats.
  - Avoid overclaiming by the AI.
  - Make AI reasoning transparent and explainable.



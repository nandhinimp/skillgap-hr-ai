app.post("/interview", async (req, res) => {
  try {
    const { missingSkills } = req.body;

    if (!missingSkills || !Array.isArray(missingSkills)) {
      return res.status(400).json({ error: "missingSkills array required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: interviewPrompt },
        {
          role: "user",
          content: `Missing Skills:\n${missingSkills.map(s => `- ${s}`).join("\n")}`
        }
      ],
      temperature: 0.3,
    });

    const rawText = completion.choices[0].message.content;

    const parsedJSON = extractJSON(rawText);

    if (!parsedJSON) {
      return res.json({ rawOutput: rawText });
    }

    res.json(parsedJSON);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Interview generation failed" });
  }
});

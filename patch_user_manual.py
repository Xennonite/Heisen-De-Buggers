with open("docs/USER_MANUAL.md", "r") as f:
    text = f.read()

text = text.replace(
    "1\\times h$ above/below, $2\\times h$ left/right)",
    "1\\times h$ above/below, $1\\times h$ left/right)"
)

text = text.replace(
    "2\\times h$ left/right without encroaching text.",
    "1\\times h$ left/right without encroaching text."
)

with open("docs/USER_MANUAL.md", "w") as f:
    f.write(text)

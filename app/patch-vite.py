import re
with open("vite.config.ts", "r") as f:
    content = f.read()

# Change noExternal to include specific packages but exclude three
old = 'ssr: {\n      noExternal: true,'
new = 'ssr: {\n      noExternal: [/^(?!three|@react-three|@mediapipe|@tweenjs)/],'

content = content.replace(old, new)

with open("vite.config.ts", "w") as f:
    f.write(content)
print("Patched vite.config.ts")

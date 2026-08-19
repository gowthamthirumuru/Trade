"""Applies pure black institutional theme across all React components and pages."""

import os
import glob

mappings = [
    ('bg-[#07090E]', 'bg-black'),
    ('bg-[#0A0D16]', 'bg-black'),
    ('bg-[#0B0E17]/40', 'bg-[#040404]'),
    ('bg-[#0B0E17]/60', 'bg-[#050505]'),
    ('bg-[#0B0E17]/80', 'bg-[#050505]'),
    ('bg-[#0B0E17]', 'bg-[#050505]'),
    ('bg-[#101426]', 'bg-[#080808]'),
    ('bg-[#151B32]/40', 'bg-[#101010]'),
    ('bg-[#151B32]/70', 'bg-[#121212]'),
    ('bg-[#151B32]', 'bg-[#121212]'),
    ('bg-[#161F38]/60', 'bg-[#141414]'),
    ('bg-[#161F38]', 'bg-[#141414]'),
    ('border-[#161F38]/40', 'border-[#171717]'),
    ('border-[#161F38]/60', 'border-[#171717]'),
    ('border-[#161F38]/80', 'border-[#1a1a1a]'),
    ('border-[#161F38]', 'border-[#1c1c1c]'),
    ('border-[#2A365E]', 'border-[#262626]'),
    ('border-[#242E4C]', 'border-[#282828]'),
    ('border-[#1C243E]', 'border-[#222222]'),
    ('divide-[#161F38]/40', 'divide-[#171717]'),
    ('divide-[#161F38]/50', 'divide-[#171717]'),
    ('divide-[#161F38]/60', 'divide-[#171717]'),
    ('divide-[#161F38]', 'divide-[#171717]'),
    ('text-[#161F38]', 'text-[#1a1a1a]'),
    ('hover:bg-[#151B32]/40', 'hover:bg-[#121212]'),
    ('hover:bg-[#151B32]/70', 'hover:bg-[#121212]'),
    ('hover:bg-[#151B32]', 'hover:bg-[#121212]'),
    ('hover:bg-[#101426]', 'hover:bg-[#0c0c0c]'),
    ('hover:bg-[#161F38]', 'hover:bg-[#141414]'),
    ('hover:border-[#2A365E]', 'hover:border-neutral-700'),
    ('hover:border-[#242E4C]', 'hover:border-neutral-700'),
    ('hover:border-slate-700', 'hover:border-neutral-700'),
    ("'#07090E'", "'#000000'"),
    ("'#0B0E17'", "'#050505'"),
    ("'#101426'", "'#050505'"),
    ("'#151B32'", "'#121212'"),
    ("'#161F38'", "'#1a1a1a'"),
    ("'#2A365E'", "'#262626'"),
    ("'#242E4C'", "'#282828'"),
    ('"#07090E"', '"#000000"'),
    ('"#0B0E17"', '"#050505"'),
    ('"#101426"', '"#050505"'),
    ('"#151B32"', '"#121212"'),
    ('"#161F38"', '"#1a1a1a"'),
    ('"#2A365E"', '"#262626"'),
    ('"#242E4C"', '"#282828"'),
]

def main():
    root = "a:/Trade/src/ui/frontend/src"
    files = glob.glob(f"{root}/**/*.tsx", recursive=True) + glob.glob(f"{root}/**/*.ts", recursive=True)
    count = 0
    for fpath in files:
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        orig = content
        for old, new in mappings:
            content = content.replace(old, new)
        if content != orig:
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(content)
            count += 1
            print(f"Updated {fpath}")
    print(f"Done. Total files updated: {count}")

if __name__ == "__main__":
    main()

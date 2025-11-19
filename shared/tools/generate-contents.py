import os

# ==========================
# Configuration
# ==========================
BASE_DIR = "C:/Code/Projects/oil-app-nuxt"  # directory to scan
OUTPUT_FILE = "C:/Code/Projects/oil-app-nuxt/shared/tools/structure.txt"               # output file
INCLUDE_CONTENT = True                      # True = write file content, False = just tree
MAX_LINES_PER_FILE = 10000                     # max lines of file content to include
IGNORE_DIRS = ["venv", "node_modules","public","__pycache__",".nuxt","shared",".git","doc"]       # folder names to ignore
IGNORE_EXTENSIONS = [".log", ".tmp",".yaml",".json",".md",".gitignore"]        # file extensions to ignore
# ==========================

def should_ignore_dir(dirname):
    return any(dirname == ignore for ignore in IGNORE_DIRS)

def should_ignore_file(filename):
    return any(filename.endswith(ext) for ext in IGNORE_EXTENSIONS)

def write_tree(base_dir, output_file, include_content=True, indent_level=0):
    with open(output_file, "w", encoding="utf-8") as out:
        def recursive_write(current_dir, level):
            for item in sorted(os.listdir(current_dir)):
                path = os.path.join(current_dir, item)
                indent = " " * (level * 4)
                if os.path.isdir(path):
                    if should_ignore_dir(item):
                        continue
                    out.write(f"{indent}{item}/\n")
                    recursive_write(path, level + 1)
                elif os.path.isfile(path):
                    if should_ignore_file(item):
                        continue
                    out.write(f"{indent}{item}\n")
                    if include_content:
                        try:
                            with open(path, "r", encoding="utf-8") as f:
                                lines = f.readlines()
                            # write max N lines of file content
                            for line in lines[:MAX_LINES_PER_FILE]:
                                out.write(f"{indent}    {line}")
                        except Exception as e:
                            out.write(f"{indent}    # Could not read file: {e}\n")

        recursive_write(base_dir, indent_level)

if __name__ == "__main__":
    write_tree(BASE_DIR, OUTPUT_FILE, INCLUDE_CONTENT)
    print(f"Structure written to {OUTPUT_FILE}")

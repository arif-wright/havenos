import pathlib
import sys
path = pathlib.Path(sys.argv[1])
lines = path.read_text().splitlines()
start = int(sys.argv[2]) if len(sys.argv)  else 
end = int(sys.argv[3]) if len(sys.argv)  else len(lines)
for i in range(start-1, min(end, len(lines))):
tprint(f\"{i+1}:{lines[i]}\")

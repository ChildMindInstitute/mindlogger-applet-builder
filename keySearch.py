import os

dir_path = os.path.dirname(os.path.realpath(__file__))
while dir_path:
    keyword = input("Search For?: ")
    for root, dirs, files in os.walk(dir_path, onerror=None):
        if "/node_module" in root:
            continue
        elif "/dist" in root:
            continue
        else:
            for filename in files:
                file_path = os.path.join(root, filename)
                try:
                    with open(file_path, "rb") as f:
                        for line in f:
                            try:
                                line = line.decode("utf-8") 
                            except ValueError:
                                continue
                            if keyword in line:
                                print(file_path)
                                break 
                except (IOError, OSError):
                    pass
    print('\n')

    try_again = input("Continue: Y or N ")
    if try_again == "Y":
        continue
    else:
        break
